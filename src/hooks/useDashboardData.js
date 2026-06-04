// src/hooks/useDashboardData.js
import { useState, useEffect } from 'react'
import { supabase } from '../supabase'

export function useDashboardData(user) {  // ← accept user as param
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    fetchAll()
  }, [user])

  async function fetchAll() {
    setLoading(true)

    const { data: logs } = await supabase
      .from('daily_logs')
      .select('walk_km, mobile_mins, social_mins, log_date')
      .eq('user_id', user.id)
      .order('log_date', { ascending: false })

    const walkTotal = logs?.reduce((sum, r) => sum + (parseFloat(r.walk_km) || 0), 0) || 0

    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const recentLogs = logs?.filter(r => new Date(r.log_date) >= thirtyDaysAgo) || []

    const { count: booksCount } = await supabase
      .from('books')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    const { count: tamilBooksCount } = await supabase
      .from('books')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('is_tamil', true)

    const { count: articlesCount } = await supabase
      .from('articles')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    // ── Monthly check-ins ───────────────────────────────────────────────
    // Only COMPLETED check-ins count — matches Home and Goals screens.
    // savings_inr is a SNAPSHOT (current balance) → use the latest completed month.
    // charity / friends / notes / zero-social are CUMULATIVE → sum across ALL completed months.
    const { data: checkins } = await supabase
      .from('monthly_checkins')
      .select('savings_inr, charity_inr, friends_met, notes_sent, zero_social_weeks, checkin_month, completed_at')
      .eq('user_id', user.id)
      .not('completed_at', 'is', null)
      .order('checkin_month', { ascending: false })

    const completed = checkins || []
    const latest    = completed[0] || {}                 // most recent completed month (savings snapshot)
    const sum       = (field) => completed.reduce((acc, r) => acc + (r[field] || 0), 0)

    setData({
      walkTotal: Math.round(walkTotal * 10) / 10,
      walkTarget: 600,
      booksCount: booksCount || 0,
      tamilBooksCount: tamilBooksCount || 0,
      booksTarget: 40,
      tamilBooksTarget: 4,
      articlesCount: articlesCount || 0,
      articlesTarget: 14,
      savingsLacs: latest.savings_inr ? (latest.savings_inr / 100000) : 0,  // snapshot
      savingsTarget: 40,
      charityInr: sum('charity_inr'),          // cumulative
      charityTarget: 50000,
      friendsMet: sum('friends_met'),          // cumulative
      friendsTarget: 4,
      notesSent: sum('notes_sent'),            // cumulative
      notesTarget: 14,
      zeroSocialWeeks: sum('zero_social_weeks'), // cumulative
      zeroSocialTarget: 4,
      recentLogs: recentLogs.reverse(),
    })

    setLoading(false)
  }

  return { data, loading }
}