// src/components/goals/MilestoneItem.jsx
import { useState } from "react";
import { ChevronRight, Loader2 } from "lucide-react";
import { GOAL_TYPE_META } from "../../constants/goals";
import FuzzyGoalSheet from "./FuzzyGoalSheet";

export default function MilestoneItem({
  goal,
  milestone,
  cumulativeVal = 0,
  summaryMap = {},
  onToggle,
  onTapTracked,
  onSaveFuzzy,
  accentColor = "#7A9E7E",
}) {
  const [toggling, setToggling] = useState(false);
  const [fuzzyOpen, setFuzzyOpen] = useState(false);

  const typeMeta = GOAL_TYPE_META[goal.type] || GOAL_TYPE_META.milestone;
  const isDone   = milestone?.is_done ?? false;
  const isFuzzy  = goal.fuzzy === true;
  const isDisplayOnly = goal.displayOnly === true;
const isMilestone = (goal.type === "milestone" || goal.type === "quarterly") && !isDisplayOnly;

  const handleToggle = async () => {
    if (toggling || isFuzzy) return;
    setToggling(true);
    await onToggle?.(goal.id, isDone);
    setToggling(false);
  };

  const progressPct =
    goal.type === "cumulative" && goal.targetValue
      ? Math.min(100, Math.round((cumulativeVal / goal.targetValue) * 100))
      : null;

  const hasArrow = goal.id === "books" || goal.id === "articles" || goal.id === "tech_projects";
  const dotColor = accentColor + "99";
  const rowBg = isMilestone && isDone ? "#F0FAF4" : "#FFFFFF";
  const summaryText = summaryMap[goal.id] ?? null;

  return (
    <>
      <div
        onClick={isFuzzy ? () => setFuzzyOpen(true) : undefined}
        style={{
          background:   rowBg,
          borderBottom: "1px solid #E8F0E8",
          padding:      "14px 16px",
          display:      "flex",
          alignItems:   "flex-start",
          gap:          "12px",
          transition:   "background 0.2s",
          cursor:       isFuzzy ? "pointer" : "default",
        }}
      >
        {/* Left: milestone toggle OR soft dot */}
       
<div style={{ flexShrink: 0, marginTop: 2 }}>
  {isMilestone && !isFuzzy ? (
    <button
      onClick={handleToggle}
      disabled={toggling}
      aria-label={isDone ? "Mark incomplete" : "Mark complete"}
      style={{
        width: 32, height: 32,
        borderRadius: "50%",
        border: "none",
        background: "transparent",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 0,
      }}
    >
      {toggling ? (
        <Loader2 size={22} className="animate-spin" style={{ color: accentColor }} />
      ) : isDone ? (
        <svg width="28" height="28" viewBox="0 0 28 28">
          <circle cx="14" cy="14" r="13" fill={accentColor} />
          <polyline points="8,14 12,18 20,10"
            fill="none" stroke="#FFFFFF"
            strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : (
        <svg width="28" height="28" viewBox="0 0 28 28">
          <circle cx="14" cy="14" r="12"
            fill="none" stroke="#C8D8C8" strokeWidth="2" />
        </svg>
      )}
    </button>
  ) : (
    <div style={{
      width: 9, height: 9,
      borderRadius: "50%",
      background: isDisplayOnly
        ? "#D8E4D8"
        : isFuzzy
          ? (milestone?.progress_pct > 0 ? accentColor : dotColor)
          : dotColor,
      marginTop: 5,
    }} />
  )}
</div>  

        {/* Centre: title + badge + summary/progress */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{
            margin: 0,
            fontSize: 15,
            fontWeight: isDone ? 400 : 500,
            fontFamily: "Outfit, sans-serif",
            color: isDone ? "#A0B8A0" : "#1C2B1C",
            lineHeight: 1.35,
            textDecoration: isDone ? "line-through" : "none",
          }}>
            {goal.title}
          </p>

          <span style={{
            display: "inline-block",
            marginTop: 5,
            padding: "2px 9px",
            borderRadius: 20,
            fontSize: 10,
            fontWeight: 600,
            fontFamily: "Outfit, sans-serif",
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            background: typeMeta.bg,
            color: typeMeta.text,
          }}>
            {isFuzzy ? "In Progress" : typeMeta.label}
          </span>

          {/* Fuzzy progress bar */}
          {isFuzzy && milestone?.progress_pct > 0 && (
            <div style={{ marginTop: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                <span style={{ fontSize: 11, color: "#7A8F7A", fontFamily: "Outfit, sans-serif" }}>
                  {milestone.notes || "No notes yet"}
                </span>
                <span style={{ fontSize: 11, fontWeight: 700, color: accentColor, fontFamily: "Outfit, sans-serif" }}>
                  {milestone.progress_pct}%
                </span>
              </div>
              <div style={{ height: 5, borderRadius: 5, background: "#E8F0E8", overflow: "hidden" }}>
                <div style={{
                  height: "100%", borderRadius: 5,
                  background: accentColor,
                  width: `${milestone.progress_pct}%`,
                  transition: "width 0.5s ease",
                }} />
              </div>
            </div>
          )}

          {summaryText && (
            <div style={{ marginTop: 7, fontSize: 12, fontFamily: "Outfit, sans-serif", color: "#7A8F7A", fontWeight: 500 }}>
              {summaryText}
            </div>
          )}

          {progressPct !== null && (
            <div style={{ marginTop: 9 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontFamily: "Outfit, sans-serif" }}>
                <span style={{ fontSize: 11, color: "#7A8F7A" }}>
                  {cumulativeVal} / {goal.targetValue} {goal.unit}
                </span>
                <span style={{ fontSize: 11, fontWeight: 700, color: progressPct >= 100 ? "#2E7D52" : accentColor }}>
                  {progressPct}%
                </span>
              </div>
              <div style={{ height: 6, borderRadius: 6, background: "#E8F0E8", overflow: "hidden" }}>
                <div style={{
                  height: "100%", borderRadius: 6,
                  background: progressPct >= 100 ? "#2E7D52" : accentColor,
                  width: `${progressPct}%`,
                  transition: "width 0.5s ease",
                }} />
              </div>
            </div>
          )}

          {isMilestone && !isFuzzy && isDone && milestone?.completed_date && (
            <p style={{ margin: "5px 0 0", fontSize: 11, fontFamily: "Outfit, sans-serif", color: "#7A9E7E" }}>
              ✓ Done {new Date(milestone.completed_date).toLocaleDateString("en-IN", {
                day: "numeric", month: "short", year: "numeric",
              })}
            </p>
          )}
        </div>

        {/* Right: arrow for Books/Articles, chevron for fuzzy */}
        {hasArrow && (
          <button
            onClick={onTapTracked}
            aria-label="View details"
            style={{
              flexShrink: 0, width: 30, height: 30,
              borderRadius: "50%", border: "none",
              background: "#F0F4F0", cursor: "pointer",
              display: "flex", alignItems: "center",
              justifyContent: "center", color: "#7A8F7A", marginTop: 2,
            }}
          >
            <ChevronRight size={15} />
          </button>
        )}

        {isFuzzy && (
          <div style={{
            flexShrink: 0, width: 30, height: 30,
            borderRadius: "50%", background: "#F0F4F0",
            display: "flex", alignItems: "center",
            justifyContent: "center", color: "#7A8F7A", marginTop: 2,
          }}>
            <ChevronRight size={15} />
          </div>
        )}
      </div>

      {/* Fuzzy goal sheet */}
      {isFuzzy && (
        <FuzzyGoalSheet
          goal={goal}
          milestone={milestone}
          accentColor={accentColor}
          isOpen={fuzzyOpen}
          onClose={() => setFuzzyOpen(false)}
          onSave={onSaveFuzzy}
        />
      )}
    </>
  );
}