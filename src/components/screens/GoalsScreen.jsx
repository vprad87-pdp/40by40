// src/screens/GoalsScreen.jsx
import { useState, useMemo } from "react";
import { Target } from "lucide-react";
import { CATEGORIES, ALL_GOALS, TOTAL_GOALS } from "../../constants/goals";
import { useMilestones } from "../../hooks/useMilestones";
import BottomSheet from "../layout/BottomSheet";
import CategoryView from "../goals/CategoryView";

export default function GoalsScreen() {
  const { milestones, loading, toggleMilestone } = useMilestones();
  const [activeCategory, setActiveCategory] = useState(null);

  const categoryStats = useMemo(() => {
    return CATEGORIES.map((cat) => {
      const milestoneGoals  = cat.goals.filter((g) => g.type === "milestone");
      const totalMilestones = milestoneGoals.length;
      const doneMilestones  = milestoneGoals.filter(
        (g) => milestones[g.id]?.is_done
      ).length;
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

  const totalMilestoneDone = useMemo(() => {
    return ALL_GOALS.filter(
      (g) => g.type === "milestone" && milestones[g.id]?.is_done
    ).length;
  }, [milestones]);

  const handleOpenCategory = (cat) => setActiveCategory(cat);
  const handleClose        = () => setActiveCategory(null);
  const handleToggle       = async (goalId, isDone) => {
    await toggleMilestone(goalId, isDone);
  };
  const handleTapTracked   = (goal) => {
    console.log("Tapped tracked goal:", goal.id);
  };

  return (
    <div
      className="flex flex-col min-h-full"
      style={{ background: "#F0F4F0", fontFamily: "Outfit, sans-serif" }}
    >
      {/* Header */}
      <div
        className="px-5 pt-12 pb-5"
        style={{ background: "#FFFFFF", borderBottom: "1px solid #D8E4D8" }}
      >
        <div className="flex items-center gap-2 mb-1">
          <Target size={18} style={{ color: "#B8860B" }} />
          <h1
            className="text-xl font-semibold"
            style={{ fontFamily: "Lora, serif", color: "#3D2B1F" }}
          >
            Goals
          </h1>
        </div>
        <p className="text-sm" style={{ color: "#7A8F7A" }}>
          {TOTAL_GOALS} goals · 7 categories
          {!loading && totalMilestoneDone > 0 && (
            <span style={{ color: "#2E7D52" }}>
              {" "}· {totalMilestoneDone} milestone{totalMilestoneDone !== 1 ? "s" : ""} done
            </span>
          )}
        </p>
      </div>

      {/* Category grid */}
      <div className="flex-1 px-4 py-4">
        <div className="grid grid-cols-2 gap-3">
          {CATEGORIES.map((cat) => {
            const stats   = statsMap[cat.id];
            const pct     = stats?.pct ?? 0;
            const done    = stats?.doneMilestones ?? 0;
            const total   = cat.goals.length;
            const isLarge = cat.id === "legacy";

            return (
              <button
                key={cat.id}
                onClick={() => handleOpenCategory(cat)}
                className={`text-left rounded-2xl p-4 transition-all duration-200
                  active:scale-95 ${isLarge ? "col-span-2" : ""}`}
                style={{
                  background: cat.colorLight,
                  border:     `1.5px solid ${cat.colorBorder}`,
                }}
              >
                {/* Emoji + count badge */}
                <div className="flex items-start justify-between mb-2">
                  <span className="text-2xl leading-none">{cat.emoji}</span>
                  <span
                    className="text-xs font-medium px-2 py-0.5 rounded-full"
                    style={{ background: cat.colorBorder, color: cat.color }}
                  >
                    {total}
                  </span>
                </div>

                {/* Category name */}
                <p
                  className="text-sm font-semibold leading-tight mb-3"
                  style={{ fontFamily: "Lora, serif", color: "#3D2B1F" }}
                >
                  {cat.label}
                </p>

                {/* Progress bar — CHANGE 1: height 5px instead of 1.5px */}
                <div>
                  <div
                    className="rounded-full overflow-hidden mb-1"
                    style={{
                      height:     5,
                      background: cat.colorBorder,
                    }}
                  >
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${pct}%`, background: cat.color }}
                    />
                  </div>

                  {/* CHANGE 2: show "X done · Y goals" instead of "Not started" */}
                  <p className="text-xs" style={{ color: "#7A8F7A" }}>
                    {loading
                      ? "Loading…"
                      : done > 0
                      ? `${done} done · ${total} goals`
                      : `${total} goals`}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom sheet */}
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
            cumulativeMap={{}}
            onToggle={handleToggle}
            onTapTracked={handleTapTracked}
          />
        )}
      </BottomSheet>
    </div>
  );
}