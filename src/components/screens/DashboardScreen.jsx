// src/components/screens/DashboardScreen.jsx
import { useDashboardData } from '../../hooks/useDashboardData'
import { SemiGauge, DonutGauge, BarGauge } from '../dashboard/Gauge'
import {
  BarChart, Bar, XAxis, YAxis, ReferenceLine,
  Tooltip, ResponsiveContainer
} from 'recharts'

export default function DashboardScreen() {
  const { data, loading } = useDashboardData()

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

      {/* ── Section 4: Screen Time Bar Chart ── */}
      {screenTimeData.length > 0 && (
        <div style={card}>
          <p style={sectionLabel}>Screen Time — Last 30 Days</p>
          <p style={{ fontSize: 11, color: '#7A8F7A', marginBottom: 12, marginTop: -8 }}>
            — Mobile target: 4h &nbsp;|&nbsp; — Social target: 1h
          </p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={screenTimeData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
              <XAxis
                dataKey="date"
                tick={{ fontSize: 9, fill: '#7A8F7A' }}
                interval={6}
              />
              <YAxis tick={{ fontSize: 9, fill: '#7A8F7A' }} />
              <Tooltip
                contentStyle={{
                  fontSize: 11, borderRadius: 8,
                  border: '1px solid #D8E4D8', background: '#fff',
                }}
                formatter={(v, n) => [`${v}h`, n === 'mobile' ? 'Mobile' : 'Social']}
              />
              <ReferenceLine y={4} stroke="#2E7D52" strokeDasharray="4 2" label="" />
              <ReferenceLine y={1} stroke="#C0392B" strokeDasharray="4 2" label="" />
              <Bar dataKey="mobile" fill="#7A9E7E" radius={[3, 3, 0, 0]} maxBarSize={12} />
              <Bar dataKey="social" fill="#B8860B" radius={[3, 3, 0, 0]} maxBarSize={12} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

    </div>
  )
}