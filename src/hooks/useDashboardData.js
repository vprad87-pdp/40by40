import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import { useAuth } from './useAuth'

export function useDashboardData() {
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    fetchAll()
  }, [user])

  async function fetchAll() {
    setLoading(true)

    // 1. Walk total from daily_logs
    const { data: logs } = await supabase
      .from('daily_logs')
      .select('walk_km, mobile_mins, social_mins, log_date')
      .eq('user_id', user.id)
      .order('log_date', { ascending: false })

    const walkTotal = logs?.reduce((sum, r) => sum + (parseFloat(r.walk_km) || 0), 0) || 0

    // Last 30 days for screen time chart
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const recentLogs = logs?.filter(r => new Date(r.log_date) >= thirtyDaysAgo) || []

    // 2. Books count
    const { count: booksCount } = await supabase
      .from('books')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    const { count: tamilBooksCount } = await supabase
      .from('books')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('is_tamil', true)

    // 3. Articles count
    const { count: articlesCount } = await supabase
      .from('articles')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    // 4. Latest monthly check-in for savings + cumulative fields
    const { data: checkins } = await supabase
      .from('monthly_checkins')
      .select('savings_inr, charity_inr, friends_met, notes_sent, zero_social_weeks, checkin_month')
      .eq('user_id', user.id)
      .order('checkin_month', { ascending: false })
      .limit(1)

    const latest = checkins?.[0] || {}

    setData({
      walkTotal: Math.round(walkTotal * 10) / 10,
      walkTarget: 600,
      booksCount: booksCount || 0,
      tamilBooksCount: tamilBooksCount || 0,
      booksTarget: 40,
      tamilBooksTarget: 4,
      articlesCount: articlesCount || 0,
      articlesTarget: 14,
      savingsLacs: latest.savings_inr ? (latest.savings_inr / 100000) : 0,
      savingsTarget: 40,
      charityInr: latest.charity_inr || 0,
      charityTarget: 50000,
      friendsMet: latest.friends_met || 0,
      friendsTarget: 4,
      notesSent: latest.notes_sent || 0,
      notesTarget: 14,
      zeroSocialWeeks: latest.zero_social_weeks || 0,
      zeroSocialTarget: 4,
      recentLogs: recentLogs.reverse(), // oldest first for chart
    })

    setLoading(false)
  }

  return { data, loading }
}