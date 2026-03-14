// src/screens/GoalsScreen.jsx
import { useState, useMemo } from "react";
import { Target } from "lucide-react";
import { CATEGORIES, ALL_GOALS, TOTAL_GOALS } from "../../constants/goals";
import { useMilestones } from "../../hooks/useMilestones";
import BottomSheet from "../layout/BottomSheet";
import CategoryView from "../goals/CategoryView";

/**
 * Goals Screen — Session 4
 *
 * Layout:
 *   • Header: "38 Goals · 7 Categories"
 *   • 7 category tiles in 2-column grid
 *   • Tapping a tile opens a BottomSheet with CategoryView
 *
 * TODO (future sessions):
 *   • Wire cumulativeMap from real Supabase queries
 *     (walk_km sum from daily_logs, books count, articles count, etc.)
 *   • GoalLogSheet for logging cumulative/daily goals inline
 */
export default function GoalsScreen() {
  const { milestones, loading, toggleMilestone } = useMilestones();
  const [activeCategory, setActiveCategory] = useState(null); // category object

  // ── Compute per-category completion stats ──────────────────────────────
  const categoryStats = useMemo(() => {
    return CATEGORIES.map((cat) => {
      const milestoneGoals = cat.goals.filter((g) => g.type === "milestone");
      const totalMilestones = milestoneGoals.length;
      const doneMilestones  = milestoneGoals.filter(
        (g) => milestones[g.id]?.is_done
      ).length;

      // Overall % = done milestones / total goals (simple for now)
      const pct =
        cat.goals.length > 0
          ? Math.round((doneMilestones / cat.goals.length) * 100)
          : 0;

      return { id: cat.id, totalMilestones, doneMilestones, pct };
    });
  }, [milestones]);

  const statsMap = useMemo(() => {
    const map = {};
    categoryStats.forEach((s) => { map[s.id] = s; });
    return map;
  }, [categoryStats]);

  // ── Overall totals ─────────────────────────────────────────────────────
  const totalMilestoneDone = useMemo(() => {
    return ALL_GOALS.filter(
      (g) => g.type === "milestone" && milestones[g.id]?.is_done
    ).length;
  }, [milestones]);

  // ── Handlers ───────────────────────────────────────────────────────────
  const handleOpenCategory = (cat) => setActiveCategory(cat);
  const handleClose        = () => setActiveCategory(null);

  const handleToggle = async (goalId, isDone) => {
    await toggleMilestone(goalId, isDone);
  };

  const handleTapTracked = (goal) => {
    // TODO Session 5+: open a GoalLogSheet / navigate to Log tab
    console.log("Tapped tracked goal:", goal.id);
  };

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div
      className="flex flex-col min-h-full"
      style={{ background: "var(--bg)", fontFamily: "Outfit, sans-serif" }}
    >
      {/* ── Page header ─────────────────────────────────────────────── */}
      <div
        className="px-5 pt-12 pb-5"
        style={{ background: "var(--surface)", borderBottom: "1px solid var(--border)" }}
      >
        <div className="flex items-center gap-2 mb-1">
          <Target size={18} style={{ color: "var(--gold)" }} />
          <h1
            className="text-xl font-semibold"
            style={{ fontFamily: "Lora, serif", color: "var(--brown)" }}
          >
            Goals
          </h1>
        </div>

        <p className="text-sm" style={{ color: "var(--muted)" }}>
          {TOTAL_GOALS} goals · 7 categories
          {!loading && totalMilestoneDone > 0 && (
            <span style={{ color: "var(--green)" }}>
              {" "}· {totalMilestoneDone} milestone{totalMilestoneDone !== 1 ? "s" : ""} done
            </span>
          )}
        </p>
      </div>

      {/* ── 2-column category grid ───────────────────────────────────── */}
      <div className="flex-1 px-4 py-4">
        <div className="grid grid-cols-2 gap-3">
          {CATEGORIES.map((cat) => {
            const stats   = statsMap[cat.id];
            const pct     = stats?.pct ?? 0;
            const isLarge = cat.id === "legacy"; // Legacy has 1 goal — spans full width

            return (
              <button
                key={cat.id}
                onClick={() => handleOpenCategory(cat)}
                className={`text-left rounded-2xl p-4 transition-all duration-200
                  active:scale-95 active:shadow-sm
                  ${isLarge ? "col-span-2" : ""}`}
                style={{
                  background:  cat.colorLight,
                  border:      `1.5px solid ${cat.colorBorder}`,
                  boxShadow:   "0 1px 4px rgba(28,43,28,0.06)",
                }}
              >
                {/* Emoji + goal count */}
                <div className="flex items-start justify-between mb-2">
                  <span className="text-2xl leading-none">{cat.emoji}</span>
                  <span
                    className="text-xs font-medium px-2 py-0.5 rounded-full"
                    style={{ background: cat.colorBorder, color: cat.color }}
                  >
                    {cat.goals.length}
                  </span>
                </div>

                {/* Category name */}
                <p
                  className="text-sm font-semibold leading-tight mb-3"
                  style={{ fontFamily: "Lora, serif", color: "var(--brown)" }}
                >
                  {cat.label}
                </p>

                {/* Progress bar */}
                <div>
                  <div
                    className="h-1.5 rounded-full overflow-hidden mb-1"
                    style={{ background: cat.colorBorder }}
                  >
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${pct}%`, background: cat.color }}
                    />
                  </div>
                  <p
                    className="text-xs"
                    style={{ color: "var(--muted)" }}
                  >
                    {loading
                      ? "Loading…"
                      : pct === 0
                      ? "Not started"
                      : `${pct}% complete`}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Category bottom sheet ────────────────────────────────────── */}
      <BottomSheet
        isOpen={!!activeCategory}
        onClose={handleClose}
        title={activeCategory?.label ?? ""}
        emoji={activeCategory?.emoji}
        accentColor={activeCategory?.color}
      >
        {activeCategory && (
          <CategoryView
            category={activeCategory}
            milestones={milestones}
            cumulativeMap={{}} // TODO: wire real data in Session 5+
            onToggle={handleToggle}
            onTapTracked={handleTapTracked}
          />
        )}
      </BottomSheet>
    </div>
  );
}
