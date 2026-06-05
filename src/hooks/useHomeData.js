// src/hooks/useHomeData.js
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../supabase'
import { ALL_GOALS, CATEGORIES, BIRTHDAY } from '../constants/goals'

// ─── Journey timing ───────────────────────────────────────────────────────────

function daysSinceStart() {
  const start = new Date('2026-01-01T00:00:00+05:30')
  const now   = new Date()
  return Math.max(1, Math.floor((now - start) / (1000 * 60 * 60 * 24)))
}

function totalJourneyDays() {
  const start = new Date('2026-01-01T00:00:00+05:30')
  return Math.floor((BIRTHDAY - start) / (1000 * 60 * 60 * 24))
}

export function journeyFraction() {
  return daysSinceStart() / totalJourneyDays()
}

// ─── Cumulative classifier ────────────────────────────────────────────────────

export function classifyCumulative(actual, target) {
  if (actual <= 0) return 'dreadful'
  if (actual >= target) return 'achieved'
  const expected = target * journeyFraction()
  if (expected <= 0) return 'on_target'
  if (actual >= expected * 0.90) return 'on_target'
  if (actual >= expected * 0.60) return 'behind'
  return 'dreadful'
}

// ─── Main classifier ──────────────────────────────────────────────────────────

export function classifyGoal(goal, dailyLogs, milestoneMap, cumulatives) {
  // displayOnly goals (weight) — two-sided target around 70 kg
  // achieved:  exactly 70 kg
  // on_target: 68–72 kg (within 2 kg either side)
  // behind:    65–68 or 72–75 kg
  // dreadful:  below 65 or above 75, or not logged yet
  if (goal.displayOnly) {
    const current = cumulatives.latestCheckin?.[goal.field] ?? null
    if (current === null) return 'dreadful'
    if (current === 70)            return 'achieved'
    if (current >= 68 && current <= 72) return 'on_target'
    if (current >= 65 && current <= 75) return 'behind'
    return 'dreadful'
  }

  // Milestones
  if (goal.type === 'milestone') {
    return milestoneMap[goal.id]?.is_done === true ? 'achieved' : 'dreadful'
  }

  // Daily habits (mobile, social)
  if (goal.type === 'daily' && goal.table === 'daily_logs') {
    const logs = dailyLogs.filter(l => l[goal.field] != null)
    if (logs.length === 0) return 'dreadful'
    const avg = logs.reduce((sum, l) => sum + l[goal.field], 0) / logs.length
    if (goal.direction === 'under') {
      if (avg <= goal.targetValue)             return 'achieved'
      if (avg <= goal.targetValue * 1.15)      return 'on_target'
      if (avg <= goal.targetValue * 1.40)      return 'behind'
      return 'dreadful'
    }
    return 'dreadful'
  }

  // Monthly habits (sport, skincare)
  if (goal.type === 'monthly') {
    const latest = cumulatives.latestCheckin
    if (!latest) return 'dreadful'
    const val = latest[goal.field]
    if (val === true)  return 'achieved'
    if (val === false) return 'behind'
    return 'dreadful'
  }

  // Cumulative: daily_logs (walk)
  if (goal.type === 'cumulative' && goal.table === 'daily_logs') {
    const total = dailyLogs.reduce((sum, l) => sum + (parseFloat(l[goal.field]) || 0), 0)
    return classifyCumulative(total, goal.targetValue)
  }

  // Cumulative: books
  if (goal.type === 'cumulative' && goal.table === 'books') {
    return classifyCumulative(cumulatives.booksCount, goal.targetValue)
  }

  // Cumulative: articles
  if (goal.type === 'cumulative' && goal.table === 'articles') {
    return classifyCumulative(cumulatives.articlesCount, goal.targetValue)
  }

  // Cumulative: projects
  if (goal.type === 'cumulative' && goal.table === 'projects') {
    return classifyCumulative(cumulatives.projectsCount, goal.targetValue)
  }

  // Cumulative: monthly_checkins
  if (goal.type === 'cumulative' && goal.table === 'monthly_checkins') {
    // savings_inr is a snapshot (current balance), not accumulated
    if (goal.field === 'savings_inr') {
      const latestVal = cumulatives.latestCheckin?.[goal.field] ?? 0
      return classifyCumulative(latestVal, goal.targetValue)
    }
    const total = cumulatives.checkinTotals?.[goal.field] ?? 0
    return classifyCumulative(total, goal.targetValue)
  }

  return 'dreadful'
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

function pickRandom(arr, n) {
  const shuffled = [...arr].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, n)
}

export function useHomeData(userId) {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  const fetchAll = useCallback(async () => {
    if (!userId) { setLoading(false); return }
    setLoading(true)
    setError(null)

    try {
      // Daily logs
      const { data: logs, error: logsErr } = await supabase
        .from('daily_logs')
        .select('log_date, mobile_mins, social_mins, walk_km')
        .eq('user_id', userId)
      if (logsErr) throw logsErr

      // Milestones
      const { data: milestones, error: msErr } = await supabase
        .from('milestones')
        .select('goal_id, is_done')
        .eq('user_id', userId)
      if (msErr) throw msErr

      // Books
      const { data: books, error: booksErr } = await supabase
        .from('books').select('id').eq('user_id', userId)
      if (booksErr) throw booksErr
      const booksCount = books?.length ?? 0

      // Articles
      const { data: articles, error: artErr } = await supabase
        .from('articles').select('id').eq('user_id', userId)
      if (artErr) throw artErr
      const articlesCount = articles?.length ?? 0

      // Projects
      const { data: projects, error: projErr } = await supabase
        .from('projects').select('id').eq('user_id', userId)
      if (projErr) throw projErr
      const projectsCount = projects?.length ?? 0

      // Latest completed checkin (for savings snapshot + sport/skincare)
      const { data: latestCheckinArr } = await supabase
        .from('monthly_checkins')
        .select('*')
        .eq('user_id', userId)
        .not('completed_at', 'is', null)
        .order('checkin_month', { ascending: false })
        .limit(1)
      const latestCheckin = latestCheckinArr?.[0] ?? null

      // All completed checkins (for cumulative fields)
      const { data: allCheckins } = await supabase
        .from('monthly_checkins')
        .select('charity_inr, friends_met, notes_sent, zero_social_weeks, vaibhav_inr')
        .eq('user_id', userId)
        .not('completed_at', 'is', null)

      const sumField = (field) =>
        allCheckins?.reduce((sum, r) => sum + (r[field] || 0), 0) ?? 0

      const checkinTotals = {
        charity_inr:       sumField('charity_inr'),
        friends_met:       sumField('friends_met'),
        notes_sent:        sumField('notes_sent'),
        zero_social_weeks: sumField('zero_social_weeks'),
        vaibhav_inr:       sumField('vaibhav_inr'),
      }

      const cumulatives = { booksCount, articlesCount, projectsCount, latestCheckin, checkinTotals }

      // Milestone map
      const milestoneMap = {}
      milestones.forEach(m => { milestoneMap[m.goal_id] = m })

      // Classify all goals — single source of truth
      const buckets = { achieved: [], on_target: [], behind: [], dreadful: [] }
      ALL_GOALS.forEach(goal => {
        const bucket = classifyGoal(goal, logs, milestoneMap, cumulatives)
        if (bucket) buckets[bucket].push(goal)
      })

      // Walk totals
      const walkTotal = Math.round(
        logs.reduce((sum, l) => sum + (parseFloat(l.walk_km) || 0), 0) * 10
      ) / 10

      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
      const walkThisWeek = Math.round(
        logs
          .filter(l => new Date(l.log_date) >= sevenDaysAgo)
          .reduce((sum, l) => sum + (parseFloat(l.walk_km) || 0), 0) * 10
      ) / 10

      // Screen time averages (only logs with that field filled)
      const logsWithMobile = logs.filter(l => l.mobile_mins != null)
      const logsWithSocial = logs.filter(l => l.social_mins != null)
      const avgMobile = logsWithMobile.length > 0
        ? Math.round(logsWithMobile.reduce((s, l) => s + l.mobile_mins, 0) / logsWithMobile.length) : 0
      const avgSocial = logsWithSocial.length > 0
        ? Math.round(logsWithSocial.reduce((s, l) => s + l.social_mins, 0) / logsWithSocial.length) : 0

      const travelGoals    = CATEGORIES.find(c => c.id === 'travel')?.goals || []
      const travelDone     = travelGoals.filter(g => milestoneMap[g.id]?.is_done === true).length
      const milestonesDone = milestones.filter(m => m.is_done === true).length
      const jf             = journeyFraction()

      const statPool = [
        { key: 'mobile',     label: 'Avg Mobile',      value: `${Math.floor(avgMobile/60)}h ${avgMobile%60}m`, subtext: 'per day · all time',           good: avgMobile <= 270 },
        { key: 'social',     label: 'Avg Social',       value: `${Math.floor(avgSocial/60)}h ${avgSocial%60}m`, subtext: 'per day · all time',           good: avgSocial <= 90 },
        { key: 'books',      label: 'Books Read',       value: booksCount,                                       subtext: 'of 40 target',                  good: booksCount >= Math.round(40 * jf) },
        { key: 'walk_week',  label: 'Walk This Week',   value: `${walkThisWeek} km`,                             subtext: 'last 7 days',                   good: walkThisWeek >= 10 },
        { key: 'travel',     label: 'Travel Done',      value: `${travelDone} / ${travelGoals.length}`,          subtext: 'experiences ticked',            good: travelDone > 0 },
        { key: 'milestones', label: 'Milestones Done',  value: milestonesDone,                                   subtext: `of ${ALL_GOALS.filter(g => g.type === 'milestone').length} total`, good: milestonesDone > 0 },
        { key: 'savings',    label: 'Savings',          value: `₹${((latestCheckin?.savings_inr||0)/100000).toFixed(1)}L`, subtext: 'of ₹40L target',   good: (latestCheckin?.savings_inr||0) >= 4000000 * jf * 0.9 },
        { key: 'charity',    label: 'Charity',          value: `₹${checkinTotals.charity_inr.toLocaleString('en-IN')}`, subtext: 'of ₹50K target',       good: checkinTotals.charity_inr >= 50000 * jf * 0.9 },
      ]

      setData({ buckets, walkTotal, quickStats: pickRandom(statPool, 4) })

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
        if (!data) window.location.reload()
        else setTimeout(() => fetchAll(), 300)
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [fetchAll])

  return { data, loading, error, refresh: fetchAll }
}