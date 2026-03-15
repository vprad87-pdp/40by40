// src/hooks/useHomeData.js
import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import { ALL_GOALS, BIRTHDAY } from '../constants/goals'

// ─── Bucket classification helpers ────────────────────────────────────────────

// How many days have passed since Jan 1 2026 (the tracking start date)
function daysSinceStart() {
  const start = new Date('2026-01-01T00:00:00+05:30')
  const now   = new Date()
  return Math.max(1, Math.floor((now - start) / (1000 * 60 * 60 * 24)))
}

// Total days in the journey (Jan 1 2026 → May 9 2027)
function totalJourneyDays() {
  const start = new Date('2026-01-01T00:00:00+05:30')
  return Math.floor((BIRTHDAY - start) / (1000 * 60 * 60 * 24))
}

// What fraction of the journey is done? e.g. 0.30 = 30% through
function journeyFraction() {
  return daysSinceStart() / totalJourneyDays()
}

// Classify a single goal into a bucket string
function classifyGoal(goal, dailyLogs, milestoneMap) {

  // ── MILESTONE goals ──────────────────────────────────────────────────────
  if (goal.type === 'milestone') {
    const done = milestoneMap[goal.id]?.is_done === true
    return done ? 'achieved' : 'dreadful'
  }

  // ── DAILY goals (mobile_mins, social_mins) ───────────────────────────────
  if (goal.type === 'daily' && goal.table === 'daily_logs') {
    const logs = dailyLogs.filter(l => l[goal.field] != null)
    if (logs.length === 0) return 'dreadful'

    const avg = logs.reduce((sum, l) => sum + l[goal.field], 0) / logs.length

    if (goal.direction === 'under') {
      // Lower is better (e.g. screen time)
      if (avg <= goal.targetValue)                          return 'achieved'
      if (avg <= goal.targetValue * 1.15)                   return 'on_target'
      if (avg <= goal.targetValue * 1.40)                   return 'behind'
      return 'dreadful'
    }
  }

  // ── CUMULATIVE walk goal (daily_logs) ────────────────────────────────────
  if (goal.type === 'cumulative' && goal.table === 'daily_logs') {
    const total = dailyLogs.reduce((sum, l) => sum + (l[goal.field] || 0), 0)
    if (total === 0) return 'dreadful'

    const expectedByNow = goal.targetValue * journeyFraction()

    if (total >= goal.targetValue)              return 'achieved'
    if (total >= expectedByNow * 0.90)          return 'on_target'
    if (total >= expectedByNow * 0.60)          return 'behind'
    return 'dreadful'
  }

  // ── Everything else — stub until later sessions ──────────────────────────
  // monthly, quarterly, cumulative from monthly_checkins, books, articles
  return 'dreadful'
}

// ─── Main hook ────────────────────────────────────────────────────────────────

export function useHomeData(userId) {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  useEffect(() => {
    if (!userId) return

    async function fetchAll() {
      setLoading(true)
      setError(null)

      try {
        // 1. Fetch all daily logs for this user
        const { data: logs, error: logsErr } = await supabase
          .from('daily_logs')
          .select('log_date, mobile_mins, social_mins, walk_km')
          .eq('user_id', userId)

        if (logsErr) throw logsErr

        // 2. Fetch all milestones for this user
        const { data: milestones, error: msErr } = await supabase
          .from('milestones')
          .select('goal_id, is_done')
          .eq('user_id', userId)

        if (msErr) throw msErr

        // 3. Build a quick lookup map: { goal_id: { is_done } }
        const milestoneMap = {}
        milestones.forEach(m => { milestoneMap[m.goal_id] = m })

        // 4. Classify every goal into a bucket
        const buckets = { achieved: [], on_target: [], behind: [], dreadful: [] }
        ALL_GOALS.forEach(goal => {
          const bucket = classifyGoal(goal, logs, milestoneMap)
          buckets[bucket].push(goal)
        })

        // 5. Quick stats
        const daysLogged = logs.length
        const walkTotal  = logs.reduce((sum, l) => sum + (l.walk_km || 0), 0)

        setData({
          buckets,
          daysLogged,
          walkTotal: Math.round(walkTotal * 10) / 10, // 1 decimal
          booksRead: 0, // stub until Session 10
        })

      } catch (err) {
        console.error('useHomeData error:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchAll()
  }, [userId])

  return { data, loading, error }
}