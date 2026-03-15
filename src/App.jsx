// src/App.jsx
import { useState } from 'react'
import { useAuth } from './hooks/useAuth'
import LoginScreen from './components/screens/LoginScreen'
import HomeScreen from './components/screens/HomeScreen'
import LogScreen from './components/screens/LogScreen'
import GoalsScreen from './components/screens/GoalsScreen'

// Placeholder for Session 6
function HistoryScreen() {
  return (
    <div style={{
      minHeight:      '100dvh',
      display:        'flex',
      alignItems:     'center',
      justifyContent: 'center',
      fontFamily:     'Outfit, sans-serif',
      color:          '#7A8F7A',
      fontSize:       '16px',
      background:     '#F0F4F0',
    }}>
      📅 History — Session 6
    </div>
  )
}

const TABS = [
  { id: 'home',    label: 'Home',    emoji: '🏠' },
  { id: 'goals',   label: 'Goals',   emoji: '🎯' },
  { id: 'log',     label: 'Log',     emoji: '✏️'  },
  { id: 'history', label: 'History', emoji: '📅' },
]

function App() {
  const { user, loading, signInWithGoogle, signOut } = useAuth()
  const [activeTab, setActiveTab]   = useState('home')  // ← changed default to home
  const [goalFilter, setGoalFilter] = useState(null)    // ← new: bucket filter state

  // Handle bucket tap on Home screen:
  // saves which bucket was tapped, then switches to Goals tab
  function handleBucketTap(bucketKey) {
    setGoalFilter(bucketKey)
    setActiveTab('goals')
  }

  // When user manually taps Goals tab, clear any active filter
  function handleTabPress(tabId) {
    if (tabId === 'goals') setGoalFilter(null)
    setActiveTab(tabId)
  }

  if (loading) {
    return (
      <div style={{
        minHeight:      '100vh',
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        background:     '#F0F4F0',
      }}>
        <p style={{ fontFamily: 'Outfit, sans-serif', color: '#7A8F7A' }}>
          Loading...
        </p>
      </div>
    )
  }

  if (!user) {
    return <LoginScreen onSignIn={signInWithGoogle} />
  }

  function renderScreen() {
    switch (activeTab) {
      case 'home':
        return (
          <HomeScreen
            user={user}
            onBucketTap={handleBucketTap}
          />
        )
      case 'goals':
        return (
          <GoalsScreen
            goalFilter={goalFilter}  // wired now, GoalsScreen will use in future session
          />
        )
      case 'log':
        return <LogScreen user={user} />
      case 'history':
        return <HistoryScreen />
      default:
        return <HomeScreen user={user} onBucketTap={handleBucketTap} />
    }
  }

  return (
    <div style={{ maxWidth: '480px', margin: '0 auto', position: 'relative' }}>

      {/* Screen */}
      {renderScreen()}

      {/* Bottom Nav */}
      <nav style={{
        position:  'fixed',
        bottom:    0,
        left:      '50%',
        transform: 'translateX(-50%)',
        width:     '100%',
        maxWidth:  '480px',
        background: '#fff',
        borderTop:  '1px solid #D8E4D8',
        display:    'flex',
        zIndex:     50,
      }}>
        {TABS.map(tab => {
          const active = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => handleTabPress(tab.id)}
              style={{
                flex:          1,
                padding:       '10px 0 12px',
                border:        'none',
                background:    'none',
                cursor:        'pointer',
                display:       'flex',
                flexDirection: 'column',
                alignItems:    'center',
                gap:           '3px',
              }}
            >
              <span style={{ fontSize: '20px', lineHeight: 1 }}>{tab.emoji}</span>
              <span style={{
                fontSize:      '10px',
                fontFamily:    'Outfit, sans-serif',
                fontWeight:    active ? 700 : 400,
                color:         active ? '#7A9E7E' : '#7A8F7A',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
              }}>
                {tab.label}
              </span>
              {active && (
                <span style={{
                  width:        '4px',
                  height:       '4px',
                  borderRadius: '50%',
                  background:   '#7A9E7E',
                  marginTop:    '1px',
                }} />
              )}
            </button>
          )
        })}
      </nav>

    </div>
  )
}

export default App