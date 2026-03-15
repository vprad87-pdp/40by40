import { useState, useMemo } from 'react'
import { useHistoryLogs } from '../../hooks/useHistoryLogs'
import { Search, X } from 'lucide-react'

// ── Colour helpers (same logic as LogScreen) ─────────────────────────────────
function mobileColor(mins) {
  if (mins == null) return 'var(--muted)'
  if (mins <= 120) return 'var(--green)'
  if (mins <= 180) return '#E67E22'
  return 'var(--red)'
}

function socialColor(mins) {
  if (mins == null) return 'var(--muted)'
  if (mins <= 30) return 'var(--green)'
  if (mins <= 60) return '#E67E22'
  return 'var(--red)'
}

function fmtMins(mins) {
  if (mins == null || mins === 0) return '—'
  const h = Math.floor(mins / 60)
  const m = mins % 60
  if (h === 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

function fmtDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-IN', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
  })
}

// ── Badge ─────────────────────────────────────────────────────────────────────
function Badge({ label, value, color }) {
  return (
    <div style={{ textAlign: 'center', minWidth: 64 }}>
      <div style={{
        fontSize: 13, fontWeight: 700, fontFamily: 'Outfit, sans-serif',
        color, background: color + '18',
        borderRadius: 8, padding: '3px 10px', display: 'inline-block'
      }}>
        {value}
      </div>
      <div style={{
        fontSize: 10, color: 'var(--muted)', marginTop: 3,
        fontFamily: 'Outfit, sans-serif', textTransform: 'uppercase', letterSpacing: 0.5
      }}>
        {label}
      </div>
    </div>
  )
}

// ── Log Card ──────────────────────────────────────────────────────────────────
function LogCard({ log }) {
  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: 14, padding: '14px 16px',
      display: 'flex', flexDirection: 'column', gap: 10
    }}>
      {/* Date row */}
      <div style={{
        fontFamily: 'Lora, serif', fontSize: 14, fontWeight: 600,
        color: 'var(--brown)'
      }}>
        {fmtDate(log.log_date)}
      </div>

      {/* Badges row */}
      <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
        <Badge
          label="Mobile"
          value={fmtMins(log.mobile_mins)}
          color={mobileColor(log.mobile_mins)}
        />
        <Badge
          label="Social"
          value={fmtMins(log.social_mins)}
          color={socialColor(log.social_mins)}
        />
        <div style={{ textAlign: 'center', minWidth: 64 }}>
          <div style={{
            fontSize: 13, fontWeight: 700, fontFamily: 'Outfit, sans-serif',
            color: 'var(--sage)', background: 'var(--sage)18',
            borderRadius: 8, padding: '3px 10px', display: 'inline-block'
          }}>
            {log.walk_km != null ? `${parseFloat(log.walk_km).toFixed(1)} km` : '—'}
          </div>
          <div style={{
            fontSize: 10, color: 'var(--muted)', marginTop: 3,
            fontFamily: 'Outfit, sans-serif', textTransform: 'uppercase', letterSpacing: 0.5
          }}>
            Walk
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Main Screen ───────────────────────────────────────────────────────────────
export default function HistoryScreen() {
  const { logs, loading, error, fromDate, toDate, setFromDate, setToDate } = useHistoryLogs()
  const [keyword, setKeyword] = useState('')

  // Keyword search — matches against the formatted date string
  // (e.g. "Mon", "Jan", "2026") so users can search by day or month
  const filtered = useMemo(() => {
    if (!keyword.trim()) return logs
    const kw = keyword.toLowerCase()
    return logs.filter(log => fmtDate(log.log_date).toLowerCase().includes(kw))
  }, [logs, keyword])

  return (
    <div style={{
      minHeight: '100dvh', background: 'var(--bg)',
      padding: '24px 16px 100px', fontFamily: 'Outfit, sans-serif'
    }}>

      {/* ── Header ── */}
      <h1 style={{
        fontFamily: 'Lora, serif', fontSize: 22, fontWeight: 700,
        color: 'var(--brown)', marginBottom: 20
      }}>
        History
      </h1>

      {/* ── Date range pickers ── */}
      <div style={{
        display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap'
      }}>
        {[
          { label: 'From', value: fromDate, set: setFromDate },
          { label: 'To', value: toDate, set: setToDate },
        ].map(({ label, value, set }) => (
          <div key={label} style={{ flex: 1, minWidth: 130 }}>
            <label style={{
              display: 'block', fontSize: 11, color: 'var(--muted)',
              textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4
            }}>
              {label}
            </label>
            <input
              type="date"
              value={value}
              onChange={e => set(e.target.value)}
              style={{
                width: '100%', padding: '8px 10px', borderRadius: 10,
                border: '1px solid var(--border)', background: 'var(--surface2)',
                color: 'var(--text)', fontFamily: 'Outfit, sans-serif', fontSize: 14,
                boxSizing: 'border-box'
              }}
            />
          </div>
        ))}
      </div>

      {/* ── Search bar ── */}
      <div style={{
        position: 'relative', marginBottom: 20
      }}>
        <Search size={15} style={{
          position: 'absolute', left: 11, top: '50%',
          transform: 'translateY(-50%)', color: 'var(--muted)'
        }} />
        <input
          type="text"
          placeholder="Search by day or month…"
          value={keyword}
          onChange={e => setKeyword(e.target.value)}
          style={{
            width: '100%', padding: '9px 36px 9px 34px',
            borderRadius: 10, border: '1px solid var(--border)',
            background: 'var(--surface2)', color: 'var(--text)',
            fontFamily: 'Outfit, sans-serif', fontSize: 14,
            boxSizing: 'border-box'
          }}
        />
        {keyword && (
          <button
            onClick={() => setKeyword('')}
            style={{
              position: 'absolute', right: 10, top: '50%',
              transform: 'translateY(-50%)', background: 'none',
              border: 'none', cursor: 'pointer', padding: 2
            }}
          >
            <X size={14} color="var(--muted)" />
          </button>
        )}
      </div>

      {/* ── Results count ── */}
      {!loading && (
        <p style={{
          fontSize: 12, color: 'var(--muted)', marginBottom: 14
        }}>
          {filtered.length} {filtered.length === 1 ? 'entry' : 'entries'}
          {keyword ? ` matching "${keyword}"` : ''}
        </p>
      )}

      {/* ── States ── */}
      {loading && (
        <p style={{ color: 'var(--muted)', fontSize: 14, textAlign: 'center', marginTop: 40 }}>
          Loading…
        </p>
      )}

      {error && (
        <p style={{ color: 'var(--red)', fontSize: 14, textAlign: 'center', marginTop: 40 }}>
          Error: {error}
        </p>
      )}

      {!loading && !error && filtered.length === 0 && (
        <p style={{ color: 'var(--muted)', fontSize: 14, textAlign: 'center', marginTop: 40 }}>
          No entries found.
        </p>
      )}

      {/* ── Log list ── */}
      {!loading && !error && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map(log => (
            <LogCard key={log.id} log={log} />
          ))}
        </div>
      )}

    </div>
  )
}