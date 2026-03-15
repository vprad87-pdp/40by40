import { useEffect, useState } from 'react'

const TARGET_DATE = new Date('2027-05-09T00:00:00')

function getCountdown() {
  const now = new Date()
  const diff = TARGET_DATE - now
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  return { days }
}

export default function LoginScreen({ onSignIn }) {
  const [countdown, setCountdown] = useState(getCountdown())

  useEffect(() => {
    const timer = setInterval(() => setCountdown(getCountdown()), 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div style={{
      minHeight: '100vh',
      background: '#F0F4F0',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      fontFamily: 'Outfit, sans-serif'
    }}>

     {/* Signature */}
      <img
        src="/signature.jpg"
        alt="40by40"
        style={{
          width: '180px',
          marginBottom: '0.25rem',
        }}
      />

      {/* Subtitle */}
      <p style={{
        fontFamily: 'Lora, serif',
        fontStyle: 'italic',
        color: '#7A8F7A',
        fontSize: '1.1rem',
        margin: '0 0 0.5rem 0'
      }}>
        Journey to 40
      </p>

      {/* Mission line */}
      <p style={{
        color: '#7A8F7A',
        fontSize: '0.85rem',
        letterSpacing: '0.05em',
        margin: '0 0 2rem 0'
      }}>
        1 Mission · 38 Goals · May 9, 2027
      </p>

      {/* Countdown */}
      <div style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
  <div style={{
    fontFamily: 'Lora, serif',
    fontSize: '3.5rem',
    color: '#B8860B',
    fontWeight: '700',
    lineHeight: 1
  }}>
    {countdown.days}
  </div>
  <div style={{
    fontSize: '0.75rem',
    color: '#7A8F7A',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    marginTop: '0.25rem'
  }}>
    Days to go
  </div>
</div>

      {/* Sign in button */}
      <button
        onClick={onSignIn}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          background: '#FFFFFF',
          border: '1px solid #D8E4D8',
          borderRadius: '0.75rem',
          padding: '0.85rem 1.75rem',
          fontSize: '0.95rem',
          color: '#1C2B1C',
          cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          fontFamily: 'Outfit, sans-serif'
        }}
      >
        <img
          src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
          alt="Google"
          style={{ width: '20px', height: '20px' }}
        />
        Sign in with Google
      </button>

    </div>
  )
}