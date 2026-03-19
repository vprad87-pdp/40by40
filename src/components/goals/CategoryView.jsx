// src/components/goals/CategoryView.jsx
import MilestoneItem from "./MilestoneItem";

/**
 * Content rendered inside the category bottom sheet.
 *
 * Props:
 *   category      {object}  — one entry from CATEGORIES
 *   milestones    {object}  — map from useMilestones: { [goal_id]: row }
 *   cumulativeMap {object}  — map of { [goal_id]: currentValue }
 *   onToggle      {func}    — (goalId, isDone) => void
 *   onTapTracked  {func}    — (goal) => void
 */
export default function CategoryView({
  category,
  milestones = {},
  cumulativeMap = {},
  onToggle,
  summaryMap = {},
  onTapTracked,
}) {
  if (!category) return null;

  const total = category.goals.length;
  const done  = category.goals.filter(
    (g) => g.type === "milestone" && milestones[g.id]?.is_done
  ).length;

  return (
    <div>
      {/* Summary strip */}
      <div
        className="px-5 py-3 flex items-center justify-between"
        style={{
          background:   category.colorLight,
          borderBottom: `1px solid ${category.colorBorder}`,
        }}
      >
        <span
          className="text-xs font-medium"
          style={{ color: category.color, fontFamily: "Outfit, sans-serif" }}
        >
          {total} goal{total !== 1 ? "s" : ""}
        </span>
        {done > 0 && (
          <span
            className="text-xs font-medium"
            style={{ color: category.color, fontFamily: "Outfit, sans-serif" }}
          >
            {done} milestone{done !== 1 ? "s" : ""} done ✓
          </span>
        )}
      </div>

      {/* Goal rows */}
      {category.goals.map((goal) => (
        <MilestoneItem
          key={goal.id}
          goal={goal}
          milestone={milestones[goal.id]}
          cumulativeVal={cumulativeMap[goal.id] ?? 0}
          onToggle={onToggle}
          summaryMap={summaryMap}
          onTapTracked={() => onTapTracked?.(goal)}
          accentColor={category.color}
        />
      ))}

      {/* Bottom padding so last item clears the nav bar */}
      <div style={{ height: 80 }} />
    </div>
  );
}
