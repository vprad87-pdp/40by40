// src/components/screens/DashboardScreen.jsx
import { useDashboardData } from '../../hooks/useDashboardData'
import { SemiGauge, DonutGauge, BarGauge } from '../dashboard/Gauge'
import {
  LineChart, Line, XAxis, YAxis,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts'

// Daily targets (hours) — kept in sync with goals.js / useHomeData.js / LogScreen.jsx
// Mobile: 270 min = 4.5h · Social: 90 min = 1.5h  (updated Session 17)
const MOBILE_TARGET_H = 4.5
const SOCIAL_TARGET_H = 1.5

export default function DashboardScreen({user}) {
  const { data, loading } = useDashboardData(user)

  if (loading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center',
        justifyContent: 'center', minHeight: '60vh',
      }}>
        <p style={{ color: '#7A8F7A', fontFamily: 'Outfit, sans-serif' }}>
          Loading dashboard…
        </p>
      </div>
    )
  }

  const screenTimeData = data.recentLogs.map(r => ({
    date: new Date(r.log_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
    mobile: Math.round((r.mobile_mins || 0) / 60 * 10) / 10,
    social: Math.round((r.social_mins || 0) / 60 * 10) / 10,
    mobileTarget: MOBILE_TARGET_H,
    socialTarget: SOCIAL_TARGET_H,
  }))

  const card = {
    background: '#FFFFFF',
    border: '1px solid #D8E4D8',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  }

  const sectionLabel = {
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: '#7A9E7E',
    fontFamily: 'Outfit, sans-serif',
    marginBottom: 16,
  }

  return (
    <div style={{
      padding: '24px 16px 100px',
      maxWidth: 480,
      margin: '0 auto',
      background: '#F0F4F0',
      minHeight: '100vh',
    }}>

      {/* Header */}
      <h1 style={{
        fontSize: 26, margin: '0 0 4px',
        color: '#3D2B1F', fontFamily: 'Lora, serif',
      }}>
        Dashboard
      </h1>
      <p style={{
        fontSize: 13, margin: '0 0 20px',
        color: '#7A8F7A', fontFamily: 'Outfit, sans-serif',
      }}>
        Your progress at a glance
      </p>

      {/* ── Section 1: Key Goals — Semicircle Gauges ── */}
      <div style={card}>
        <p style={sectionLabel}>Key Goals</p>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 8,
        }}>
          <SemiGauge
            value={data.walkTotal} max={data.walkTarget}
            label="Walk km" unit=" km" color="#2E7D52"
          />
          <SemiGauge
            value={data.booksCount} max={data.booksTarget}
            label="Books read" color="#B8860B"
          />
          <SemiGauge
            value={data.articlesCount} max={data.articlesTarget}
            label="Articles" color="#7A9E7E"
          />
        </div>
      </div>

      {/* ── Section 2: Financial — Progress Bars ── */}
      <div style={card}>
        <p style={sectionLabel}>Financial Goals</p>
        <BarGauge
          value={parseFloat(data.savingsLacs).toFixed(1)}
          max={data.savingsTarget}
          label="Savings" unit=" L" color="#2E7D52"
        />
        <BarGauge
          value={data.charityInr}
          max={data.charityTarget}
          label="Charity ₹" color="#B8860B"
        />
      </div>

      {/* ── Section 3: Relationships & Lifestyle — Donuts ── */}
      <div style={card}>
        <p style={sectionLabel}>Relationships & Lifestyle</p>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 4,
          justifyItems: 'center',
        }}>
          <DonutGauge
            value={data.friendsMet} max={data.friendsTarget}
            label="Friends met" color="#2E7D52"
          />
          <DonutGauge
            value={data.notesSent} max={data.notesTarget}
            label="Notes sent" color="#B8860B"
          />
          <DonutGauge
            value={data.zeroSocialWeeks} max={data.zeroSocialTarget}
            label="Zero social wks" color="#7A9E7E"
          />
          <DonutGauge
            value={data.tamilBooksCount} max={data.tamilBooksTarget}
            label="Tamil books" color="#3D2B1F"
          />
        </div>
      </div>

      {/* ── Section 4: Screen Time Line Chart ── */}
      {screenTimeData.length > 0 && (
        <div style={card}>
          <p style={sectionLabel}>Screen Time — Last 30 Days</p>
          <p style={{ fontSize: 11, color: '#7A8F7A', marginBottom: 8, marginTop: -8 }}>
            Daily hours vs target
          </p>
          <ResponsiveContainer width="100%" height={210}>
            <LineChart data={screenTimeData} margin={{ top: 4, right: 8, left: -24, bottom: 0 }}>
              <XAxis
                dataKey="date"
                tick={{ fontSize: 9, fill: '#7A8F7A' }}
                interval={6}
              />
              <YAxis
                tick={{ fontSize: 9, fill: '#7A8F7A' }}
                tickFormatter={(v) => `${v}h`}
                width={32}
              />
              <Tooltip
                contentStyle={{
                  fontSize: 11, borderRadius: 8,
                  border: '1px solid #D8E4D8', background: '#fff',
                }}
                formatter={(v, n) => [`${v}h`, n]}
              />
              <Legend
                wrapperStyle={{ fontSize: 10, paddingTop: 4 }}
                iconType="plainline"
                iconSize={14}
              />

              {/* Actual usage */}
              <Line
                type="monotone" dataKey="mobile" name="Mobile"
                stroke="#7A9E7E" strokeWidth={2}
                dot={false} activeDot={{ r: 3 }}
              />
              <Line
                type="monotone" dataKey="social" name="Social"
                stroke="#B8860B" strokeWidth={2}
                dot={false} activeDot={{ r: 3 }}
              />

              {/* Targets (flat reference lines) */}
              <Line
                type="monotone" dataKey="mobileTarget" name="Mobile target"
                stroke="#2E7D52" strokeWidth={1.5} strokeDasharray="5 4"
                dot={false} activeDot={false}
              />
              <Line
                type="monotone" dataKey="socialTarget" name="Social target"
                stroke="#C0392B" strokeWidth={1.5} strokeDasharray="5 4"
                dot={false} activeDot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

    </div>
  )
}
