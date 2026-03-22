// src/screens/GoalsScreen.jsx
import { useState, useMemo, useEffect } from "react";
import { CATEGORIES, ALL_GOALS, TOTAL_GOALS } from "../../constants/goals";
import { useMilestones } from "../../hooks/useMilestones";
import { useDailyLogs } from "../../hooks/useDailyLogs";

import BottomSheet from "../layout/BottomSheet";
import CategoryView from "../goals/CategoryView";

export default function GoalsScreen({ goalFilter, onNavigate, user }) {
  
    const { milestones, loading, toggleMilestone, saveFuzzyProgress, refetch } = useMilestones(user);
    console.log('GoalsScreen user:', user?.id, 'milestones:', milestones)
  const { fetchAll } = useDailyLogs(user?.id);
  const [activeCategory, setActiveCategory] = useState(null);
  const [allLogs, setAllLogs] = useState([]);

  const handleCategoryOpen = async (cat) => {
  await refetch();  // wait for fresh data first
  console.log('milestones after refetch:', milestones['kannada']);
  setActiveCategory(cat);  // then open the sheet
}

  useEffect(() => {
    if (user?.id) fetchAll().then(setAllLogs);
  }, [user?.id]);

  const dailyAverages = useMemo(() => {
    if (!allLogs.length) return { mobile_mins: null, social_mins: null };
    const withMobile = allLogs.filter(l => l.mobile_mins !== null);
    const withSocial = allLogs.filter(l => l.social_mins !== null);
    return {
      mobile_mins: withMobile.length
        ? Math.round(withMobile.reduce((s, l) => s + l.mobile_mins, 0) / withMobile.length)
        : null,
      social_mins: withSocial.length
        ? Math.round(withSocial.reduce((s, l) => s + l.social_mins, 0) / withSocial.length)
        : null,
    };
  }, [allLogs]);

  const formatMins = (mins) => {
    if (mins === null) return "No data yet";
    if (mins >= 60) return `${Math.floor(mins / 60)}h ${mins % 60}m`;
    return `${mins}m`;
  };

  const summaryMap = useMemo(() => ({
    mobile_usage: dailyAverages.mobile_mins !== null
      ? `Avg ${formatMins(dailyAverages.mobile_mins)} / day`
      : "No data yet",
    social_media: dailyAverages.social_mins !== null
      ? `Avg ${formatMins(dailyAverages.social_mins)} / day`
      : "No data yet",
  }), [dailyAverages]);

  const categoryStats = useMemo(() => {
    return CATEGORIES.map((cat) => {
      const milestoneGoals = cat.goals.filter((g) => g.type === "milestone");
      const doneMilestones = milestoneGoals.filter(
        (g) => milestones[g.id]?.is_done
      ).length;
      const pct = cat.goals.length > 0
        ? Math.round((doneMilestones / cat.goals.length) * 100)
        : 0;
      return { id: cat.id, doneMilestones, pct };
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

  const handleToggle = async (goalId, isDone) => {
    await toggleMilestone(goalId, isDone);
  };

  return (
    <div style={{
      minHeight: "100%",
      background: "#F0F4F0",
      fontFamily: "Outfit, sans-serif",
    }}>

      {/* Header */}
      <div style={{
        background: "#FFFFFF",
        borderBottom: "1px solid #D8E4D8",
        padding: "48px 20px 20px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <span style={{ fontSize: 20 }}>🎯</span>
          <h1 style={{
            fontFamily: "Lora, serif",
            fontSize: 22,
            fontWeight: 600,
            color: "#3D2B1F",
            margin: 0,
          }}>
            Goals
          </h1>
        </div>
        <p style={{ fontSize: 13, color: "#7A8F7A", margin: 0 }}>
          {TOTAL_GOALS} goals · 7 categories
          {!loading && totalMilestoneDone > 0 && (
            <span style={{ color: "#2E7D52" }}>
              {" "}· {totalMilestoneDone} done
            </span>
          )}
        </p>
      </div>

      {/* Category grid — pure CSS grid, no Tailwind */}
      <div style={{ padding: "16px 16px 100px" }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 12,
        }}>
          {CATEGORIES.map((cat) => {
            const stats   = statsMap[cat.id];
            const pct     = stats?.pct ?? 0;
            const done    = stats?.doneMilestones ?? 0;
            const total   = cat.goals.length;
            const isLarge = cat.id === "legacy";

            return (
              <button
                key={cat.id}
                onClick={() => handleCategoryOpen(cat)}
                style={{
                  gridColumn:    isLarge ? "1 / -1" : "auto",
                  textAlign:     "left",
                  background:    cat.colorLight,
                  border:        `1.5px solid ${cat.colorBorder}`,
                  borderRadius:  16,
                  padding:       "14px 14px 12px",
                  cursor:        "pointer",
                  transition:    "transform 0.15s",
                  outline:       "none",
                  WebkitTapHighlightColor: "transparent",
                }}
                onMouseDown={e => e.currentTarget.style.transform = "scale(0.96)"}
                onMouseUp={e   => e.currentTarget.style.transform = "scale(1)"}
                onTouchStart={e => e.currentTarget.style.transform = "scale(0.96)"}
                onTouchEnd={e   => e.currentTarget.style.transform = "scale(1)"}
              >
                {/* Top row: emoji + count badge */}
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: 8,
                }}>
                  <span style={{ fontSize: 24, lineHeight: 1 }}>{cat.emoji}</span>
                  <span style={{
                    fontSize: 11,
                    fontWeight: 600,
                    padding: "2px 8px",
                    borderRadius: 20,
                    background: cat.colorBorder,
                    color: cat.color,
                    fontFamily: "Outfit, sans-serif",
                  }}>
                    {total}
                  </span>
                </div>

                {/* Category name */}
                <p style={{
                  fontFamily: "Lora, serif",
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#3D2B1F",
                  margin: "0 0 10px",
                  lineHeight: 1.3,
                }}>
                  {cat.label}
                </p>

                {/* Progress bar — track always visible */}
                <div style={{
                  height: 5,
                  borderRadius: 5,
                  background: cat.colorBorder,
                  overflow: "hidden",
                  marginBottom: 6,
                }}>
                  <div style={{
                    height: "100%",
                    borderRadius: 5,
                    background: cat.color,
                    width: `${pct}%`,
                    transition: "width 0.7s ease",
                    minWidth: pct > 0 ? 4 : 0,
                  }} />
                </div>

                {/* Status text */}
                <p style={{
                  fontSize: 11,
                  color: "#7A8F7A",
                  margin: 0,
                  fontFamily: "Outfit, sans-serif",
                }}>
                  {loading
                    ? "Loading…"
                    : done > 0
                    ? `${done} done · ${total} goals`
                    : `${total} goals`}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom sheet */}
      <BottomSheet
        isOpen={!!activeCategory}
        onClose={() => setActiveCategory(null)}
        title={activeCategory?.label ?? ""}
        emoji={activeCategory?.emoji}
        accentColor={activeCategory?.color}
      >
        {activeCategory && (
          <CategoryView
  category={activeCategory}
  milestones={milestones}
  cumulativeMap={{}}
  summaryMap={summaryMap}
  onToggle={handleToggle}
  onSaveFuzzy={saveFuzzyProgress}
  onTapTracked={(goal) => {
    setActiveCategory(null);
    onNavigate?.(goal.id);
  }}
/>
        )}
      </BottomSheet>
    </div>
  );
}