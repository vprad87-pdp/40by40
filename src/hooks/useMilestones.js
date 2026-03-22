// src/hooks/useMilestones.js
import { useState, useEffect, useCallback } from "react";
import { supabase } from "../supabase";

export function useMilestones(user) {
  const [milestones, setMilestones] = useState({});
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);

  const fetchMilestones = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);

    const { data, error: fetchError } = await supabase
      .from("milestones")
      .select("goal_id, is_done, notes, completed_date, updated_at, progress_pct")
      .eq("user_id", user.id);

    if (fetchError) {
      setError(fetchError.message);
    } else {
      const map = {};
      (data || []).forEach((row) => { map[row.goal_id] = row; });
      setMilestones(map);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchMilestones();
    // Refetch when user comes back to this tab
    function handleVisibilityChange() {
      if (document.visibilityState === 'visible') {
        setTimeout(() => fetchMilestones(), 300);
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  
   }, [fetchMilestones]);

  const toggleMilestone = useCallback(
    async (goalId, currentDone, notes = "") => {
      if (!user) return { error: "Not authenticated" };
      const newDone = !currentDone;
      const today = new Date().toISOString().split("T")[0];

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
        setMilestones((prev) => ({
          ...prev,
          [goalId]: {
            ...prev[goalId],
            is_done:        currentDone,
            completed_date: currentDone ? prev[goalId]?.completed_date : null,
          },
        }));
        return { error: upsertError.message };
      }
      return { error: null };
    },
    [user, milestones]
  );

  const saveMilestoneNotes = useCallback(
    async (goalId, notes) => {
      if (!user) return { error: "Not authenticated" };
      setMilestones((prev) => ({ ...prev, [goalId]: { ...prev[goalId], notes } }));
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

  const saveFuzzyProgress = useCallback(
    async (goalId, pct, note, isDone) => {
      console.log('saveFuzzyProgress user:', user?.id) 
      if (!user) return { error: "Not authenticated" };
      console.log('saveFuzzyProgress called:', goalId, pct, note, isDone)
      const today = new Date().toISOString().split("T")[0];

      // Optimistic update
      setMilestones((prev) => ({
        ...prev,
        [goalId]: {
          ...prev[goalId],
          progress_pct:   pct,
          notes:          note,
          is_done:        isDone,
          completed_date: isDone ? today : null,
        },
      }));

      const { error: upsertError } = await supabase
        .from("milestones")
        .upsert(
          {
            user_id:        user.id,
            goal_id:        goalId,
            progress_pct:   pct,
            notes:          note,
            is_done:        isDone,
            completed_date: isDone ? today : null,
            updated_at:     new Date().toISOString(),
          },
          { onConflict: "user_id,goal_id" }
        );

      return { error: upsertError?.message || null };
    },
    [user]
  );

  return {
    milestones,
    loading,
    error,
    toggleMilestone,
    saveMilestoneNotes,
    saveFuzzyProgress,
    refetch: fetchMilestones,
  };
}