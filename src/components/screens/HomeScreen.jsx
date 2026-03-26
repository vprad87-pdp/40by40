// src/components/screens/HomeScreen.jsx
import { useState, useEffect } from 'react'
import { useHomeData } from '../../hooks/useHomeData'
import { BIRTHDAY } from '../../constants/goals'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getGreeting(name) {
  const hour = new Date().getHours()
  if (hour < 12) return `Good morning, ${name} 🌅`
  if (hour < 17) return `Good afternoon, ${name} ☀️`
  return `Good evening, ${name} 🌙`
}

function getDaysLeft() {
  const now = new Date()
  return Math.ceil((BIRTHDAY - now) / (1000 * 60 * 60 * 24))
}

// ─── Bucket config ────────────────────────────────────────────────────────────

const BUCKET_CONFIG = [
  {
    key:    'achieved',
    label:  'Achieved',
    emoji:  '🏆',
    bg:     '#f0fdf4',
    border: '#86efac',
    color:  '#15803d',
  },
  {
    key:    'on_target',
    label:  'On Target',
    emoji:  '🎯',
    bg:     '#eff6ff',
    border: '#93c5fd',
    color:  '#1d4ed8',
  },
  {
    key:    'behind',
    label:  'Behind',
    emoji:  '⚠️',
    bg:     '#fffbeb',
    border: '#fcd34d',
    color:  '#b45309',
  },
  {
    key:    'dreadful',
    label:  'Dreadful',
    emoji:  '🔴',
    bg:     '#fef2f2',
    border: '#fca5a5',
    color:  '#b91c1c',
  },
]

// ─── Sub-components ───────────────────────────────────────────────────────────

function GreetingBar({ name }) {
  return (
    <p style={{
      fontFamily:    'Outfit, sans-serif',
      fontSize:      '15px',
      color:         '#7A8F7A',
      margin:        '0 0 16px',
      letterSpacing: '0.01em',
    }}>
      {getGreeting(name)}
    </p>
  )
}

function CountdownCard() {
  const days = getDaysLeft()
  return (
    <div style={{
      background:    '#fff',
      border:        '1px solid #D8E4D8',
      borderRadius:  '16px',
      padding:       '20px 24px',
      marginBottom:  '20px',
      textAlign:     'center',
    }}>
      <p style={{
        fontFamily:    'Outfit, sans-serif',
        fontSize:      '11px',
        fontWeight:    600,
        color:         '#7A9E7E',
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        margin:        '0 0 6px',
      }}>
        Days until 40
      </p>
      <p style={{
        fontFamily: 'Lora, serif',
        fontSize:   '52px',
        fontWeight: 700,
        color:      '#B8860B',
        margin:     '0',
        lineHeight: 1,
      }}>
        {days}
      </p>
      <p style={{
        fontFamily: 'Outfit, sans-serif',
        fontSize:   '12px',
        color:      '#7A8F7A',
        margin:     '8px 0 0',
      }}>
        May 9, 2027 · Keep going 💪
      </p>
    </div>
  )
}

function BucketTile({ config, count, onTap }) {
  return (
    <button
      onClick={onTap}
      style={{
        background:    config.bg,
        border:        `1px solid ${config.border}`,
        borderRadius:  '14px',
        padding:       '16px 12px',
        display:       'flex',
        flexDirection: 'column',
        alignItems:    'center',
        gap:           '6px',
        cursor:        'pointer',
        width:         '100%',
        transition:    'opacity 0.15s',
      }}
    >
      <span style={{ fontSize: '22px', lineHeight: 1 }}>{config.emoji}</span>
      <span style={{
        fontFamily: 'Lora, serif',
        fontSize:   '28px',
        fontWeight: 700,
        color:      config.color,
        lineHeight: 1,
      }}>
        {count}
      </span>
      <span style={{
        fontFamily:    'Outfit, sans-serif',
        fontSize:      '10px',
        fontWeight:    600,
        color:         config.color,
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
      }}>
        {config.label}
      </span>
    </button>
  )
}

function QuickStats({ stats }) {
  return (
    <div style={{ marginTop: '20px' }}>
      <p style={{
        fontFamily:    'Outfit, sans-serif',
        fontSize:      '11px',
        fontWeight:    600,
        color:         '#7A9E7E',
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        margin:        '0 0 10px',
      }}>
        Quick Stats
      </p>
      <div style={{
        display:             'grid',
        gridTemplateColumns: '1fr 1fr',
        gap:                 '10px',
      }}>
        {stats.map(s => (
          <div key={s.key} style={{
            background:   '#fff',
            border:       `1px solid ${s.good ? '#86efac' : '#D8E4D8'}`,
            borderRadius: '14px',
            padding:      '14px 16px',
          }}>
            <p style={{
              fontFamily:    'Outfit, sans-serif',
              fontSize:      '10px',
              fontWeight:    600,
              color:         '#7A9E7E',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              margin:        '0 0 4px',
            }}>
              {s.label}
            </p>
            <p style={{
              fontFamily: 'Lora, serif',
              fontSize:   '22px',
              fontWeight: 700,
              color:      s.good ? '#15803d' : '#3D2B1F',
              margin:     '0 0 2px',
              lineHeight: 1.1,
            }}>
              {s.value}
            </p>
            <p style={{
              fontFamily: 'Outfit, sans-serif',
              fontSize:   '11px',
              color:      '#7A8F7A',
              margin:     0,
            }}>
              {s.subtext}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function HomeScreen({ user, onBucketTap, onRegisterRefresh }) {
  const firstName = user?.user_metadata?.full_name?.split(' ')[0] || 'Pradeep'
  const { data, loading, error, refresh } = useHomeData(user?.id)

  useEffect(() => {
  if (onRegisterRefresh) onRegisterRefresh(refresh)
}, [refresh])

  if (loading) {
    return (
      <div style={centeredStyle}>
        <p style={{ fontFamily: 'Outfit, sans-serif', color: '#7A8F7A' }}>
          Loading your goals...
        </p>
      </div>
    )
  }

  if (!data) {
  return (
    <div style={centeredStyle}>
      <p style={{ fontFamily: 'Outfit, sans-serif', color: '#C0392B' }}>
        No data. Please refresh.
      </p>
    </div>
  )
}

  if (error) {
    return (
      <div style={centeredStyle}>
        <p style={{ fontFamily: 'Outfit, sans-serif', color: '#C0392B' }}>
          Something went wrong. Please refresh.
        </p>
      </div>
    )
  }

  return (
    <div style={{
      minHeight:  '100dvh',
      background: '#F0F4F0',
      padding:    '56px 16px 88px',
    }}>

      {/* Greeting */}
      <GreetingBar name={firstName} />

      {/* Countdown */}
      <CountdownCard />

      {/* Buckets heading */}
      <p style={{
        fontFamily:    'Outfit, sans-serif',
        fontSize:      '11px',
        fontWeight:    600,
        color:         '#7A9E7E',
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        margin:        '0 0 10px',
      }}>
        Goal Status
      </p>

      {/* 2×2 bucket grid */}
      <div style={{
        display:             'grid',
        gridTemplateColumns: '1fr 1fr',
        gap:                 '10px',
        marginBottom:        '4px',
      }}>
        {BUCKET_CONFIG.map(cfg => (
          <BucketTile
            key={cfg.key}
            config={cfg}
            count={data.buckets[cfg.key].length}
            onTap={() => onBucketTap?.(cfg.key)}
          />
        ))}
      </div>

      {/* Tap hint */}
      <p style={{
        fontFamily: 'Outfit, sans-serif',
        fontSize:   '11px',
        color:      '#7A8F7A',
        textAlign:  'center',
        margin:     '8px 0 0',
      }}>
        Tap a bucket to filter Goals
      </p>

      {/* Quick stats */}
      <QuickStats stats={data.quickStats} />

    </div>
  )
}

const centeredStyle = {
  minHeight:      '100dvh',
  display:        'flex',
  alignItems:     'center',
  justifyContent: 'center',
  background:     '#F0F4F0',
}