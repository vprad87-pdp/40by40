// src/hooks/useHomeData.js
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../supabase'
import { ALL_GOALS, CATEGORIES, BIRTHDAY } from '../constants/goals'

function daysSinceStart() {
  const start = new Date('2026-01-01T00:00:00+05:30')
  const now   = new Date()
  return Math.max(1, Math.floor((now - start) / (1000 * 60 * 60 * 24)))
}

function totalJourneyDays() {
  const start = new Date('2026-01-01T00:00:00+05:30')
  return Math.floor((BIRTHDAY - start) / (1000 * 60 * 60 * 24))
}

function journeyFraction() {
  return daysSinceStart() / totalJourneyDays()
}

function classifyGoal(goal, dailyLogs, milestoneMap) {
  if (goal.type === 'milestone') {
    return milestoneMap[goal.id]?.is_done === true ? 'achieved' : 'dreadful'
  }

  if (goal.type === 'daily' && goal.table === 'daily_logs') {
    const logs = dailyLogs.filter(l => l[goal.field] != null)
    if (logs.length === 0) return 'dreadful'
    const avg = logs.reduce((sum, l) => sum + l[goal.field], 0) / logs.length
    if (goal.direction === 'under') {
      if (avg <= goal.targetValue)        return 'achieved'
      if (avg <= goal.targetValue * 1.15) return 'on_target'
      if (avg <= goal.targetValue * 1.40) return 'behind'
      return 'dreadful'
    }
  }

  if (goal.type === 'cumulative' && goal.table === 'daily_logs') {
    const total = dailyLogs.reduce((sum, l) => sum + (l[goal.field] || 0), 0)
    if (total === 0) return 'dreadful'
    const expectedByNow = goal.targetValue * journeyFraction()
    if (total >= goal.targetValue)     return 'achieved'
    if (total >= expectedByNow * 0.90) return 'on_target'
    if (total >= expectedByNow * 0.60) return 'behind'
    return 'dreadful'
  }

  return 'dreadful'
}

function pickRandom(arr, n) {
  const shuffled = [...arr].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, n)
}

export function useHomeData(userId) {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  const fetchAll = useCallback(async () => {
    if (!userId) {
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)

    try {
      const { data: logs, error: logsErr } = await supabase
        .from('daily_logs')
        .select('log_date, mobile_mins, social_mins, walk_km')
        .eq('user_id', userId)

      if (logsErr) throw logsErr

      const { data: milestones, error: msErr } = await supabase
        .from('milestones')
        .select('goal_id, is_done')
        .eq('user_id', userId)

      if (msErr) throw msErr

      const { data: books, error: booksErr } = await supabase
  .from('books')
  .select('id')
  .eq('user_id', userId)

if (booksErr) throw booksErr
const booksCount = books?.length ?? 0

      const milestoneMap = {}
      milestones.forEach(m => { milestoneMap[m.goal_id] = m })

      const buckets = { achieved: [], on_target: [], behind: [], dreadful: [] }
      ALL_GOALS.forEach(goal => {
        const bucket = classifyGoal(goal, logs, milestoneMap)
        buckets[bucket].push(goal)
      })

      const walkTotal = Math.round(
        logs.reduce((sum, l) => sum + (l.walk_km || 0), 0) * 10
      ) / 10

      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
      const walkThisWeek = Math.round(
        logs
          .filter(l => new Date(l.log_date) >= sevenDaysAgo)
          .reduce((sum, l) => sum + (l.walk_km || 0), 0) * 10
      ) / 10

      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      const recentLogs = logs.filter(l => new Date(l.log_date) >= thirtyDaysAgo)
      const avgMobile = recentLogs.length > 0
        ? Math.round(recentLogs.reduce((sum, l) => sum + (l.mobile_mins || 0), 0) / recentLogs.length)
        : 0
      const avgSocial = recentLogs.length > 0
        ? Math.round(recentLogs.reduce((sum, l) => sum + (l.social_mins || 0), 0) / recentLogs.length)
        : 0

      const travelGoals = CATEGORIES.find(c => c.id === 'travel')?.goals || []
      const travelDone  = travelGoals.filter(g => milestoneMap[g.id]?.is_done === true).length
      const milestonesDone = milestones.filter(m => m.is_done === true).length

      const statPool = [
        { key: 'mobile', label: 'Avg Mobile', value: `${Math.floor(avgMobile / 60)}h ${avgMobile % 60}m`, subtext: 'per day · last 30 days', good: avgMobile <= 240 },
        { key: 'social', label: 'Avg Social', value: `${Math.floor(avgSocial / 60)}h ${avgSocial % 60}m`, subtext: 'per day · last 30 days', good: avgSocial <= 60 },
        { key: 'books', label: 'Books Read', value: booksCount, subtext: 'of 40 target', good: booksCount >= Math.round(40 * journeyFraction()) },
        { key: 'walk_week', label: 'Walk This Week', value: `${walkThisWeek} km`, subtext: 'last 7 days', good: walkThisWeek >= 10 },
        { key: 'travel', label: 'Travel Done', value: `${travelDone} / ${travelGoals.length}`, subtext: 'experiences ticked', good: travelDone > 0 },
        { key: 'milestones', label: 'Milestones Done', value: milestonesDone, subtext: `of ${ALL_GOALS.filter(g => g.type === 'milestone').length} total`, good: milestonesDone > 0 },
      ]

      const quickStats = pickRandom(statPool, 4)
      setData({ buckets, walkTotal, quickStats })

    } catch (err) {
      console.error('useHomeData error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [userId])

 useEffect(() => {
    fetchAll()

    function handleVisibilityChange() {
  if (document.visibilityState === 'visible') {
    if (!data) {
      window.location.reload()
    } else {
      setTimeout(() => fetchAll(), 300)
    }
  }
}

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [fetchAll])

  return { data, loading, error, refresh: fetchAll  }
}