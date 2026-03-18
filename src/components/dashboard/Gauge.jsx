// src/components/dashboard/Gauge.jsx

// ── Semicircle Gauge (pure CSS/SVG — reliable) ─────────────────
export function SemiGauge({ value, max, label, color = '#2E7D52', unit = '' }) {
  const pct = Math.min(value / max, 1)
  const radius = 54
  const circumference = Math.PI * radius // half circle
  const filled = pct * circumference

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ position: 'relative', width: 120, height: 68 }}>
        <svg width="120" height="68" viewBox="0 0 120 68">
          {/* Background arc */}
          <path
            d="M 6 66 A 54 54 0 0 1 114 66"
            fill="none"
            stroke="#E8EEE8"
            strokeWidth="10"
            strokeLinecap="round"
          />
          {/* Filled arc */}
          <path
            d="M 6 66 A 54 54 0 0 1 114 66"
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={`${filled} ${circumference}`}
          />
        </svg>
        {/* Centre text */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          width: '100%',
          textAlign: 'center',
        }}>
          <span style={{
            fontSize: 18,
            fontWeight: 700,
            color,
            fontFamily: 'Lora, serif',
            lineHeight: 1,
          }}>
            {value}{unit}
          </span>
          <br />
          <span style={{ fontSize: 10, color: '#7A8F7A', fontFamily: 'Outfit, sans-serif' }}>
            of {max}{unit}
          </span>
        </div>
      </div>
      <p style={{
        fontSize: 11,
        marginTop: 6,
        textAlign: 'center',
        color: '#7A8F7A',
        fontFamily: 'Outfit, sans-serif',
      }}>
        {label}
      </p>
    </div>
  )
}

// ── Donut Gauge (pure SVG) ────────────────────────────────────────
export function DonutGauge({ value, max, label, color = '#B8860B' }) {
  const pct = Math.min(value / max, 1)
  const radius = 30
  const circumference = 2 * Math.PI * radius
  const filled = pct * circumference

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ position: 'relative', width: 76, height: 76 }}>
        <svg width="76" height="76" viewBox="0 0 76 76">
          {/* Background circle */}
          <circle cx="38" cy="38" r={radius} fill="none" stroke="#E8EEE8" strokeWidth="8" />
          {/* Filled arc */}
          <circle
            cx="38"
            cy="38"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${filled} ${circumference}`}
            strokeDashoffset={circumference * 0.25}
            transform="rotate(-90 38 38)"
          />
        </svg>
        {/* Centre text */}
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <span style={{
            fontSize: 15,
            fontWeight: 700,
            color,
            fontFamily: 'Lora, serif',
            lineHeight: 1,
          }}>
            {value}
          </span>
          <span style={{ fontSize: 9, color: '#7A8F7A' }}>/{max}</span>
        </div>
      </div>
      <p style={{
        fontSize: 10,
        marginTop: 4,
        textAlign: 'center',
        color: '#7A8F7A',
        fontFamily: 'Outfit, sans-serif',
        maxWidth: 70,
      }}>
        {label}
      </p>
    </div>
  )
}

// ── Horizontal Progress Bar (pure CSS) ───────────────────────────
export function BarGauge({ value, max, label, color = '#2E7D52', unit = '' }) {
  const pct = Math.min((value / max) * 100, 100)

  return (
    <div style={{ width: '100%', marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: 13, color: '#1C2B1C', fontFamily: 'Outfit, sans-serif' }}>
          {label}
        </span>
        <span style={{ fontSize: 13, fontWeight: 700, color, fontFamily: 'Lora, serif' }}>
          {value}{unit}
          <span style={{ fontWeight: 400, color: '#7A8F7A', fontSize: 12 }}> / {max}{unit}</span>
        </span>
      </div>
      <div style={{
        width: '100%',
        height: 10,
        borderRadius: 99,
        background: '#E8EEE8',
        overflow: 'hidden',
      }}>
        <div style={{
          width: `${pct}%`,
          height: '100%',
          borderRadius: 99,
          background: color,
          transition: 'width 0.7s ease',
        }} />
      </div>
      <p style={{ fontSize: 11, marginTop: 3, textAlign: 'right', color: '#7A8F7A' }}>
        {pct.toFixed(1)}% complete
      </p>
    </div>
  )
}