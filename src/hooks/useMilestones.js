// src/hooks/useMilestones.js
import { useState, useEffect, useCallback } from "react";
import { supabase } from "../supabase";


/**
 * Fetches all milestone rows for the current user and exposes a toggle function.
 * Returns a map: { [goal_id]: { is_done, notes, completed_date } }
 */
export function useMilestones(user) {
  
  const [milestones, setMilestones] = useState({}); // keyed by goal_id string
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);

  // ─── Fetch all milestones for this user ──────────────────────────────────
  const fetchMilestones = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);

    const { data, error: fetchError } = await supabase
      .from("milestones")
      .select("goal_id, is_done, notes, completed_date, updated_at")
      .eq("user_id", user.id);

    if (fetchError) {
      setError(fetchError.message);
    } else {
      // Build a lookup map keyed by goal_id
      const map = {};
      (data || []).forEach((row) => {
        map[row.goal_id] = row;
      });
      setMilestones(map);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchMilestones();
  }, [fetchMilestones]);

  // ─── Toggle a single milestone ───────────────────────────────────────────
  const toggleMilestone = useCallback(
    async (goalId, currentDone, notes = "") => {
      if (!user) return { error: "Not authenticated" };

      const newDone = !currentDone;
      const today = new Date().toISOString().split("T")[0];

      // Optimistic update
      setMilestones((prev) => ({
        ...prev,
        [goalId]: {
          ...prev[goalId],
          goal_id:        goalId,
          is_done:        newDone,
          completed_date: newDone ? today : null,
          notes:          notes || prev[goalId]?.notes || "",
        },
      }));

      // Upsert to Supabase (insert or update by user_id + goal_id)
      const { error: upsertError } = await supabase
        .from("milestones")
        .upsert(
          {
            user_id:        user.id,
            goal_id:        goalId,
            is_done:        newDone,
            notes:          notes || milestones[goalId]?.notes || "",
            completed_date: newDone ? today : null,
            updated_at:     new Date().toISOString(),
          },
          { onConflict: "user_id,goal_id" }
        );

      if (upsertError) {
        // Rollback optimistic update on failure
        setMilestones((prev) => ({
          ...prev,
          [goalId]: {
            ...prev[goalId],
            is_done:        currentDone,
            completed_date: currentDone
              ? prev[goalId]?.completed_date
              : null,
          },
        }));
        return { error: upsertError.message };
      }

      return { error: null };
    },
    [user, milestones]
  );

  // ─── Save notes for a milestone (e.g. course name) ───────────────────────
  const saveMilestoneNotes = useCallback(
    async (goalId, notes) => {
      if (!user) return { error: "Not authenticated" };

      setMilestones((prev) => ({
        ...prev,
        [goalId]: { ...prev[goalId], notes },
      }));

      const { error: updateError } = await supabase
        .from("milestones")
        .upsert(
          {
            user_id:    user.id,
            goal_id:    goalId,
            is_done:    milestones[goalId]?.is_done ?? false,
            notes,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id,goal_id" }
        );

      return { error: updateError?.message || null };
    },
    [user, milestones]
  );

  return {
    milestones,
    loading,
    error,
    toggleMilestone,
    saveMilestoneNotes,
    refetch: fetchMilestones,
  };
}
