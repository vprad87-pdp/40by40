// src/hooks/useMonthlyData.js
import { useState, useEffect } from 'react'
import { supabase } from '../supabase'

export function useMonthlyData(userId) {
  const [thisMonthCheckin, setThisMonthCheckin] = useState(null)
  const [shouldShowModal, setShouldShowModal] = useState(false)
  const [loading, setLoading] = useState(true)

  // Returns first day of current month as 'YYYY-MM-01'
  function getCurrentMonthKey() {
    const now = new Date()
    const y = now.getFullYear()
    const m = String(now.getMonth() + 1).padStart(2, '0')
    return `${y}-${m}-01`
  }

  // Returns today's date in IST as 'YYYY-MM-DD'
  function getTodayIST() {
    return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' })
  }

  // Returns day-of-month in IST (1–31)
  function getTodayDayIST() {
    return parseInt(
      new Date().toLocaleDateString('en-GB', {
        timeZone: 'Asia/Kolkata',
        day: 'numeric',
      })
    )
  }

  useEffect(() => {
    if (!userId) return
    fetchMonthlyData()
  }, [userId])

  async function fetchMonthlyData() {
    setLoading(true)
    const monthKey = getCurrentMonthKey()

    const { data, error } = await supabase
      .from('monthly_checkins')
      .select('*')
      .eq('user_id', userId)
      .eq('checkin_month', monthKey)
      .maybeSingle()

    if (error) {
      console.error('useMonthlyData fetch error:', error)
      setLoading(false)
      return
    }

    setThisMonthCheckin(data)

    // Decide whether to show modal
    const day = getTodayDayIST()
    const today = getTodayIST()

    if (data && data.completed_at) {
      // Already completed this month — don't show
      setShouldShowModal(false)
    } else if (data && data.snoozed_to) {
      // Snoozed — show only if today >= snoozed_to date
      setShouldShowModal(today >= data.snoozed_to)
    } else {
      // No check-in yet — show on 2nd or 3rd of month
      setShouldShowModal(day === 2 || day === 3)
    }

    setLoading(false)
  }

  async function saveCheckin(fields) {
    const monthKey = getCurrentMonthKey()
    const now = new Date().toISOString()

    const payload = {
      user_id: userId,
      checkin_month: monthKey,
      ...fields,
      snoozed_to: null,
      completed_at: now,
    }

    const { error } = await supabase
      .from('monthly_checkins')
      .upsert(payload, { onConflict: 'user_id,checkin_month' })

    if (error) {
      console.error('useMonthlyData save error:', error)
      return false
    }

    setShouldShowModal(false)
    await fetchMonthlyData()
    return true
  }

  async function snoozeCheckin() {
    const monthKey = getCurrentMonthKey()
    const today = getTodayIST()

    // Snooze to tomorrow (works correctly whether today is 2nd or 3rd)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    const snoozedTo = tomorrow.toLocaleDateString('en-CA', {
      timeZone: 'Asia/Kolkata',
    })

    const payload = {
      user_id: userId,
      checkin_month: monthKey,
      snoozed_to: snoozedTo,
      completed_at: null,
    }

    const { error } = await supabase
      .from('monthly_checkins')
      .upsert(payload, { onConflict: 'user_id,checkin_month' })

    if (error) {
      console.error('useMonthlyData snooze error:', error)
      return false
    }

    setShouldShowModal(false)
    return true
  }

  return {
    thisMonthCheckin,
    shouldShowModal,
    loading,
    saveCheckin,
    snoozeCheckin,
  }
}