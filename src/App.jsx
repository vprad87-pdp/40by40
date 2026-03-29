import { useState, useEffect, useRef } from 'react'
import { useAuth } from './hooks/useAuth'
import LoginScreen from './components/screens/LoginScreen'
import HomeScreen from './components/screens/HomeScreen'
import LogScreen from './components/screens/LogScreen'
import GoalsScreen from './components/screens/GoalsScreen'
import HistoryScreen from './components/screens/HistoryScreen'
import MonthlyCheckin from './components/modals/MonthlyCheckin'
import { useMonthlyData } from './hooks/useMonthlyData'
import { useHomeData } from './hooks/useHomeData'
import DashboardScreen from './components/screens/DashboardScreen'
import BooksScreen from './components/screens/BooksScreen'
import ArticlesScreen from './components/screens/ArticlesScreen'
import ProjectsScreen from './components/screens/ProjectsScreen'

const TABS = [
  { id: 'home',      label: 'Home',      emoji: '🏠' },
  { id: 'goals',     label: 'Goals',     emoji: '🎯' },
  { id: 'log',       label: 'Log',       emoji: '✏️'  },
  { id: 'history',   label: 'History',   emoji: '📅' },
  { id: 'dashboard', label: 'Dashboard', emoji: '📊' },
]

// ─── Monthly reminder banner ──────────────────────────────────────────────────

function MonthlyReminderBanner({ onOpenCheckin, onDismiss }) {
  const monthLabel = new Date().toLocaleString('en-IN', { month: 'long' })
  return (
    <div style={{
      position:      'fixed',
      top:           0,
      left:          '50%',
      transform:     'translateX(-50%)',
      width:         '100%',
      maxWidth:      '480px',
      zIndex:        200,
      padding:       '52px 16px 0',
      pointerEvents: 'none',
    }}>
      <div style={{
        background:    '#fff',
        border:        '1.5px solid #B8860B',
        borderRadius:  '14px',
        padding:       '12px 14px',
        display:       'flex',
        alignItems:    'center',
        gap:           '10px',
        boxShadow:     '0 4px 16px rgba(0,0,0,0.10)',
        pointerEvents: 'all',
      }}>
        <span style={{ fontSize: '18px', flexShrink: 0 }}>📋</span>
        <div style={{ flex: 1 }}>
          <p style={{ fontFamily: 'Outfit, sans-serif', fontSize: '13px', fontWeight: 600, color: '#3D2B1F', margin: '0 0 2px' }}>
            {monthLabel} check-in pending
          </p>
          <p style={{ fontFamily: 'Outfit, sans-serif', fontSize: '12px', color: '#7A8F7A', margin: 0 }}>
            Takes 2 minutes — keep your goals on track.
          </p>
        </div>
        <button
          onClick={onOpenCheckin}
          style={{
            background: '#B8860B', border: 'none', borderRadius: '20px',
            padding: '6px 12px', fontSize: '12px', fontWeight: 600,
            fontFamily: 'Outfit, sans-serif', color: '#fff', cursor: 'pointer',
            whiteSpace: 'nowrap', flexShrink: 0,
          }}
        >
          Fill in
        </button>
        <button
          onClick={onDismiss}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: '16px', color: '#B8860B', padding: '0 2px',
            flexShrink: 0, lineHeight: 1,
          }}
          aria-label="Dismiss"
        >
          ✕
        </button>
      </div>
    </div>
  )
}

// ─── App ─────────────────────────────────────────────────────────────────────

function App() {
  const { user, loading, signInWithGoogle } = useAuth()

  const {
    shouldShowModal, hasCompletedThisMonth,
    saveCheckin, snoozeCheckin,
    thisMonthCheckin, totalCharity, totalNotes, totalVaibhav,
  } = useMonthlyData(user?.id)

  // Single source of truth for home data + buckets
  const { data: homeData, loading: homeLoading, refresh: refreshHome } = useHomeData(user?.id)

  const [activeTab,  setActiveTab]  = useState(() => localStorage.getItem('40by40-last-tab') || 'home')
  const [goalFilter, setGoalFilter] = useState(null)   // bucket key or null
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [reminderBannerDismissed, setReminderBannerDismissed] = useState(false)

  const goalsRefreshRef = useRef(null)

  useEffect(() => {
    if (shouldShowModal) setIsModalOpen(true)
  }, [shouldShowModal])

  function handleBucketTap(bucketKey) {
    setGoalFilter(bucketKey)
    setActiveTab('goals')
  }

  // Called by GoalsScreen when the bucket sheet is closed — stay on Goals, just clear filter
  function handleBucketClose() {
    setGoalFilter(null)
  }

  function handleTabPress(tabId) {
    if (tabId === 'goals') {
      setGoalFilter(null)
      if (goalsRefreshRef.current) goalsRefreshRef.current()
    }
    if (tabId === 'home') refreshHome()
    setActiveTab(tabId)
    localStorage.setItem('40by40-last-tab', tabId)
  }

  const showReminderBanner =
    !!user && !hasCompletedThisMonth && !shouldShowModal && !isModalOpen && !reminderBannerDismissed

  function handleOpenCheckin() {
    setReminderBannerDismissed(true)
    setIsModalOpen(true)
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F0F4F0' }}>
        <p style={{ fontFamily: 'Outfit, sans-serif', color: '#7A8F7A' }}>Loading...</p>
      </div>
    )
  }

  if (!user) return <LoginScreen onSignIn={signInWithGoogle} />

  return (
    <div style={{ maxWidth: '480px', margin: '0 auto', position: 'relative' }}>

      {showReminderBanner && (
        <MonthlyReminderBanner
          onOpenCheckin={handleOpenCheckin}
          onDismiss={() => setReminderBannerDismissed(true)}
        />
      )}

      <div style={{ display: activeTab === 'home' ? 'block' : 'none', minHeight: '100dvh' }}>
        <HomeScreen
          user={user}
          homeData={homeData}
          homeLoading={homeLoading}
          onBucketTap={handleBucketTap}
        />
      </div>

      <div style={{ display: activeTab === 'goals' ? 'block' : 'none' }}>
        {user && (
          <GoalsScreen
            goalFilter={goalFilter}
            onBucketClose={handleBucketClose}
            onNavigate={setActiveTab}
            user={user}
            buckets={homeData?.buckets ?? null}
            onRegisterRefresh={(fn) => { goalsRefreshRef.current = fn }}
          />
        )}
      </div>

      <div style={{ display: activeTab === 'log' ? 'block' : 'none' }}>
        <LogScreen user={user} onOpenCheckin={() => setIsModalOpen(true)} />
      </div>

      <div style={{ display: activeTab === 'history' ? 'block' : 'none' }}>
        <HistoryScreen user={user} />
      </div>

      <div style={{ display: activeTab === 'dashboard' ? 'block' : 'none' }}>
        <DashboardScreen user={user} />
      </div>

      <div style={{ display: activeTab === 'books' ? 'block' : 'none' }}>
        {user && <BooksScreen />}
      </div>

      <div style={{ display: activeTab === 'articles' ? 'block' : 'none' }}>
        {user && <ArticlesScreen />}
      </div>

      <div style={{ display: activeTab === 'tech_projects' ? 'block' : 'none' }}>
        {user && <ProjectsScreen />}
      </div>

      {/* Bottom Nav */}
      <nav style={{
        position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
        width: '100%', maxWidth: '480px', background: '#fff',
        borderTop: '1px solid #D8E4D8', display: 'flex', zIndex: 50,
      }}>
        {TABS.map(tab => {
          const active = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => handleTabPress(tab.id)}
              style={{
                flex: 1, padding: '10px 0 12px', border: 'none', background: 'none',
                cursor: 'pointer', display: 'flex', flexDirection: 'column',
                alignItems: 'center', gap: '3px',
              }}
            >
              <span style={{ fontSize: '20px', lineHeight: 1 }}>{tab.emoji}</span>
              <span style={{
                fontSize: '10px', fontFamily: 'Outfit, sans-serif',
                fontWeight: active ? 700 : 400,
                color: active ? '#7A9E7E' : '#7A8F7A',
                letterSpacing: '0.04em', textTransform: 'uppercase',
              }}>
                {tab.label}
              </span>
              {active && (
                <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#7A9E7E', marginTop: '1px' }} />
              )}
            </button>
          )
        })}
      </nav>

      <MonthlyCheckin
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={saveCheckin}
        onSnooze={snoozeCheckin}
        thisMonthCheckin={thisMonthCheckin}
        totalCharity={totalCharity}
        totalNotes={totalNotes}
        totalVaibhav={totalVaibhav}
      />
    </div>
  )
}

export default App
