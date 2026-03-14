// src/components/goals/GoalItem.jsx
import { useState } from "react";
import { CheckCircle2, Circle, ChevronRight, Loader2 } from "lucide-react";
import { GOAL_TYPE_META } from "../../constants/goals";

/**
 * Renders a single goal row inside the category bottom sheet.
 *
 * Props:
 *   goal          {object}  — goal config from CATEGORIES
 *   milestone     {object}  — milestone row from useMilestones (may be undefined)
 *   cumulativeVal {number}  — current cumulative value (books read, km walked, etc.)
 *   onToggle      {func}    — (goalId, isDone) => void  — only for milestone type
 *   onTapTracked  {func}    — () => void  — for daily/cumulative/monthly goals
 *   accentColor   {string}  — category colour
 */
export default function GoalItem({
  goal,
  milestone,
  cumulativeVal = 0,
  onToggle,
  onTapTracked,
  accentColor = "var(--sage)",
}) {
  const [toggling, setToggling] = useState(false);

  const typeMeta = GOAL_TYPE_META[goal.type] || GOAL_TYPE_META.milestone;
  const isDone   = milestone?.is_done ?? false;

  // ─── Milestone toggle ──────────────────────────────────────────────────
  const handleToggle = async () => {
    if (toggling) return;
    setToggling(true);
    await onToggle?.(goal.id, isDone);
    setToggling(false);
  };

  // ─── Progress % for cumulative goals ──────────────────────────────────
  const progressPct =
    goal.type === "cumulative" && goal.targetValue
      ? Math.min(100, Math.round((cumulativeVal / goal.targetValue) * 100))
      : null;

  // ─── Tap handler — cumulative/daily/monthly open a sheet; milestone toggles
  const isTappable =
    goal.type === "cumulative" || goal.type === "daily" || goal.type === "monthly";

  return (
    <div
      className="flex items-start gap-3 px-5 py-4"
      style={{ borderBottom: "1px solid var(--border)" }}
    >
      {/* Left — milestone checkbox or type indicator dot */}
      <div className="flex-shrink-0 mt-0.5">
        {goal.type === "milestone" ? (
          <button
            onClick={handleToggle}
            disabled={toggling}
            className="w-6 h-6 flex items-center justify-center
              rounded-full transition-all duration-200 active:scale-90"
            aria-label={isDone ? "Mark incomplete" : "Mark complete"}
          >
            {toggling ? (
              <Loader2 size={20} className="animate-spin" style={{ color: accentColor }} />
            ) : isDone ? (
              <CheckCircle2 size={22} style={{ color: accentColor }} />
            ) : (
              <Circle size={22} style={{ color: "var(--border)" }} />
            )}
          </button>
        ) : (
          <div
            className="w-2 h-2 rounded-full mt-1.5"
            style={{ background: accentColor, opacity: 0.7 }}
          />
        )}
      </div>

      {/* Centre — title + type badge + progress bar */}
      <div className="flex-1 min-w-0">
        {/* Title */}
        <p
          className={`text-sm leading-snug ${
            isDone ? "line-through opacity-50" : ""
          }`}
          style={{
            fontFamily: "Outfit, sans-serif",
            color:      "var(--text)",
          }}
        >
          {goal.title}
        </p>

        {/* Type badge */}
        <span
          className="inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium"
          style={{
            background: typeMeta.bg,
            color:      typeMeta.text,
            fontFamily: "Outfit, sans-serif",
          }}
        >
          {typeMeta.label}
        </span>

        {/* Cumulative progress bar */}
        {progressPct !== null && (
          <div className="mt-2">
            <div
              className="flex items-center justify-between mb-1"
              style={{ fontFamily: "Outfit, sans-serif" }}
            >
              <span className="text-xs" style={{ color: "var(--muted)" }}>
                {cumulativeVal} / {goal.targetValue}{" "}
                {goal.unit}
              </span>
              <span
                className="text-xs font-semibold"
                style={{ color: accentColor }}
              >
                {progressPct}%
              </span>
            </div>
            <div
              className="h-1.5 rounded-full overflow-hidden"
              style={{ background: "var(--border)" }}
            >
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width:      `${progressPct}%`,
                  background: accentColor,
                }}
              />
            </div>
          </div>
        )}

        {/* Milestone done date */}
        {goal.type === "milestone" && isDone && milestone?.completed_date && (
          <p
            className="mt-1 text-xs"
            style={{ color: "var(--muted)", fontFamily: "Outfit, sans-serif" }}
          >
            ✓ Done{" "}
            {new Date(milestone.completed_date).toLocaleDateString("en-IN", {
              day:   "numeric",
              month: "short",
              year:  "numeric",
            })}
          </p>
        )}
      </div>

      {/* Right — chevron for tappable tracked goals */}
      {isTappable && (
        <button
          onClick={onTapTracked}
          className="flex-shrink-0 w-7 h-7 flex items-center justify-center
            rounded-full transition-colors duration-150"
          style={{ color: "var(--muted)" }}
          aria-label="View details"
        >
          <ChevronRight size={16} />
        </button>
      )}
    </div>
  );
}
