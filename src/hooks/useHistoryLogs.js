import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../supabase'
import { useAuth } from './useAuth'

export function useHistoryLogs() {
  const { user } = useAuth()

  const today = new Date()
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(today.getDate() - 29)

  const fmt = (d) => d.toISOString().split('T')[0]

  const [fromDate, setFromDate] = useState(fmt(thirtyDaysAgo))
  const [toDate, setToDate] = useState(fmt(today))
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

const fetchLogs = useCallback(async () => {
    if (!user) {
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)

    const { data, error } = await supabase
      .from('daily_logs')
      .select('*')
      .eq('user_id', user.id)
      .gte('log_date', fromDate)
      .lte('log_date', toDate)
      .order('log_date', { ascending: false })

    if (error) setError(error.message)
    else setLogs(data || [])
    setLoading(false)
  }, [user, fromDate, toDate])

  useEffect(() => {
    fetchLogs()
  }, [fetchLogs])

  return { logs, loading, error, fromDate, toDate, setFromDate, setToDate }
}