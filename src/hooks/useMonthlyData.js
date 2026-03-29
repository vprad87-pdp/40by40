// src/hooks/useMonthlyData.js
import { useState, useEffect } from 'react'
import { supabase } from '../supabase'

export function useMonthlyData(userId) {
  const [thisMonthCheckin, setThisMonthCheckin] = useState(null)
  const [shouldShowModal, setShouldShowModal]   = useState(false)
  const [hasCompletedThisMonth, setHasCompletedThisMonth] = useState(true) // NEW — default true to avoid flicker
  const [loading, setLoading]                   = useState(true)
  const [totalCharity, setTotalCharity]         = useState(0)
  const [totalNotes, setTotalNotes]             = useState(0)
  const [totalVaibhav, setTotalVaibhav]         = useState(0)  // NEW

  function getCurrentMonthKey() {
    const now = new Date()
    const y   = now.getFullYear()
    const m   = String(now.getMonth() + 1).padStart(2, '0')
    return `${y}-${m}-01`
  }

  function getTodayIST() {
    return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' })
  }

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

    // Fetch this month's check-in
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

    // NEW — track whether this month's check-in is completed
    setHasCompletedThisMonth(!!(data && data.completed_at))

    // Fetch all past months to compute cumulative totals (excluding current month)
    const { data: allMonths, error: allError } = await supabase
      .from('monthly_checkins')
      .select('charity_inr, notes_sent, vaibhav_inr')  // added vaibhav_inr
      .eq('user_id', userId)
      .lt('checkin_month', monthKey)

    if (!allError && allMonths) {
      const charitySum  = allMonths.reduce((sum, r) => sum + (r.charity_inr  || 0), 0)
      const notesSum    = allMonths.reduce((sum, r) => sum + (r.notes_sent   || 0), 0)
      const vaibhavSum  = allMonths.reduce((sum, r) => sum + (r.vaibhav_inr  || 0), 0)  // NEW
      setTotalCharity(charitySum)
      setTotalNotes(notesSum)
      setTotalVaibhav(vaibhavSum)  // NEW
    }

    // Decide whether to show modal
    const day   = getTodayDayIST()
    const today = getTodayIST()

    if (data && data.completed_at) {
      setShouldShowModal(false)
    } else if (data && data.snoozed_to) {
      setShouldShowModal(today >= data.snoozed_to)
    } else {
      setShouldShowModal(day === 2 || day === 3)
    }

    setLoading(false)
  }

  async function saveCheckin(fields) {
    const monthKey = getCurrentMonthKey()
    const now      = new Date().toISOString()

    const payload = {
      user_id:       userId,
      checkin_month: monthKey,
      ...fields,
      snoozed_to:    null,
      completed_at:  now,
    }

    const { error } = await supabase
      .from('monthly_checkins')
      .upsert(payload, { onConflict: 'user_id,checkin_month' })

    if (error) {
      console.error('useMonthlyData save error:', error)
      return false
    }

    setShouldShowModal(false)
    setHasCompletedThisMonth(true)  // NEW
    await fetchMonthlyData()
    return true
  }

  async function snoozeCheckin() {
    const monthKey = getCurrentMonthKey()
    const today    = getTodayIST()

    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    const snoozedTo = tomorrow.toLocaleDateString('en-CA', {
      timeZone: 'Asia/Kolkata',
    })

    const payload = {
      user_id:       userId,
      checkin_month: monthKey,
      snoozed_to:    snoozedTo,
      completed_at:  null,
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
    hasCompletedThisMonth,  // NEW
    loading,
    saveCheckin,
    snoozeCheckin,
    totalCharity,
    totalNotes,
    totalVaibhav,           // NEW
  }
}
