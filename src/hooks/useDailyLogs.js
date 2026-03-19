import { useState, useCallback } from 'react';
import { supabase } from '../supabase';

/**
 * useDailyLogs
 * Fetch, insert, and update rows in daily_logs for the current user.
 */
export function useDailyLogs(userId) {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  /**
   * Fetch a single log by date (YYYY-MM-DD).
   * Returns the row object or null if not found.
   */
  const fetchByDate = useCallback(async (date) => {
    if (!userId) return null;
    setError(null);
    try {
      const { data, error } = await supabase
        .from('daily_logs')
        .select('*')
        .eq('user_id', userId)
        .eq('log_date', date)
        .maybeSingle();

      if (error) throw error;
      return data; // null if no row found
    } catch (err) {
      setError(err.message);
      return null;
    }
  }, [userId]);

  /**
   * Fetch logs for a date range (for History screen).
   * Returns array sorted newest-first.
   */
  const fetchRange = useCallback(async (fromDate, toDate) => {
    if (!userId) return [];
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('daily_logs')
        .select('*')
        .eq('user_id', userId)
        .gte('log_date', fromDate)
        .lte('log_date', toDate)
        .order('log_date', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (err) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, [userId]);

  /**
 * Fetch ALL logs for the user (for computing total averages).
 * Returns array of all rows.
 */
const fetchAll = useCallback(async () => {
  if (!userId) return [];
  setLoading(true);
  setError(null);
  try {
    const { data, error } = await supabase
      .from('daily_logs')
      .select('*')
      .eq('user_id', userId)
      .order('log_date', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (err) {
    setError(err.message);
    return [];
  } finally {
    setLoading(false);
  }
}, [userId]);

  /**
   * Save (insert or update) a log for a given date.
   * Uses upsert with onConflict on (user_id, log_date).
   * Returns the saved row or null on error.
   */
  const saveLog = useCallback(async ({ log_date, mobile_mins, social_mins, walk_km }) => {
    if (!userId) return null;
    setLoading(true);
    setError(null);
    try {
      const payload = {
        user_id: userId,
        log_date,
        mobile_mins: mobile_mins !== '' && mobile_mins !== null ? Number(mobile_mins) : null,
        social_mins: social_mins !== '' && social_mins !== null ? Number(social_mins) : null,
        walk_km:     walk_km     !== '' && walk_km     !== null ? Number(walk_km)     : null,
        updated_at:  new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('daily_logs')
        .upsert(payload, { onConflict: 'user_id,log_date' })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [userId]);

  
  return { fetchByDate, fetchRange, fetchAll, saveLog, loading, error };
}
