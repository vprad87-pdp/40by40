import { useState, useEffect, useRef } from 'react'
import { useAuth } from './hooks/useAuth'
import LoginScreen from './components/screens/LoginScreen'
import HomeScreen from './components/screens/HomeScreen'
import LogScreen from './components/screens/LogScreen'
import GoalsScreen from './components/screens/GoalsScreen'
import HistoryScreen from './components/screens/HistoryScreen'
import MonthlyCheckin from './components/modals/MonthlyCheckin'
import { useMonthlyData } from './hooks/useMonthlyData'
import DashboardScreen from './components/screens/DashboardScreen'
import BooksScreen from './components/screens/BooksScreen'
import ArticlesScreen from './components/screens/ArticlesScreen'

const TABS = [
  { id: 'home',      label: 'Home',      emoji: '🏠' },
  { id: 'goals',     label: 'Goals',     emoji: '🎯' },
  { id: 'log',       label: 'Log',       emoji: '✏️'  },
  { id: 'history',   label: 'History',   emoji: '📅' },
  { id: 'dashboard', label: 'Dashboard', emoji: '📊' },
]

function App() {
  const { user, loading, signInWithGoogle, signOut } = useAuth()
  const { shouldShowModal, saveCheckin, snoozeCheckin, thisMonthCheckin, totalCharity, totalNotes } = useMonthlyData(user?.id)
  const [activeTab, setActiveTab] = useState(() => {
  return localStorage.getItem('40by40-last-tab') || 'home'
})
  const [goalFilter, setGoalFilter]   = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const homeRefreshRef = useRef(null)
  

  useEffect(() => {
    if (shouldShowModal) setIsModalOpen(true)
  }, [shouldShowModal])

  function handleBucketTap(bucketKey) {
    setGoalFilter(bucketKey)
    setActiveTab('goals')
  }

 function handleTabPress(tabId) {
  if (tabId === 'goals') setGoalFilter(null)
  if (tabId === 'home' && homeRefreshRef.current) {
    homeRefreshRef.current()
  }
  setActiveTab(tabId)
  localStorage.setItem('40by40-last-tab', tabId)
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

  return (
    <div style={{ maxWidth: '480px', margin: '0 auto', position: 'relative' }}>

      {/* All screens mounted, only one visible at a time */}
      
      <div style={{ display: activeTab === 'home' ? 'block' : 'none', minHeight: '100dvh' }}>
  <HomeScreen user={user} onBucketTap={handleBucketTap} onRegisterRefresh={(fn) => { homeRefreshRef.current = fn }} />
</div>
      
      <div style={{ display: activeTab === 'goals' ? 'block' : 'none' }}>
  {user && <GoalsScreen goalFilter={goalFilter} onNavigate={setActiveTab} user={user} />}
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


      {/* Bottom Nav */}
      <nav style={{
        position:   'fixed',
        bottom:     0,
        left:       '50%',
        transform:  'translateX(-50%)',
        width:      '100%',
        maxWidth:   '480px',
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

      {/* Monthly Check-in Modal */}
      <MonthlyCheckin
  isOpen={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  onSave={saveCheckin}
  onSnooze={snoozeCheckin}
  thisMonthCheckin={thisMonthCheckin}
  totalCharity={totalCharity}
  totalNotes={totalNotes}
/>

    </div>
  )
}

export default App