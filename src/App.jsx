import React, { Suspense, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useTheme } from './hooks/useTheme'
import { useWindowManager } from './hooks/useWindowManager'
import { APP_REGISTRY, getApp } from './config/appRegistry'
import { PERIODS } from './config/theme'
import { TimeProvider, useTime } from './contexts/TimeContext'
import TimeSettings from './components/TimeSettings'
import SplitView from './components/SplitView'
import AppSelector from './components/AppSelector'
import GuidedTutorial, { isTutorialNeeded } from './components/GuidedTutorial'
import './config/i18n'
import { 
  RiHome4Line,
  RiTimeLine,
  RiFileTextLine,
  RiFlashlightLine,
  RiMagicLine,
  RiSettings3Line,
  RiStackLine,
  RiNotification3Line,
  RiTimerLine,
  RiArtboardLine,
  RiCloseLine,
  RiArrowLeftRightLine,
  RiArrowUpSLine,
  RiArrowDownSLine,
} from '@remixicon/react'

function getIconForId(id) {
  switch(id) {
    case 'home': return RiHome4Line
    case 'clock': return RiTimeLine
    case 'notes': return RiFileTextLine
    case 'quadro': return RiArtboardLine
    case 'energy': return RiStackLine
    case 'chat': return RiMagicLine
    case 'settings': return RiSettings3Line
    default: return null
  }
}

/* ── Top bar ─────────────────────────────────────────────────── */
function TopBar({ period, onToggleMenu, menuOpen, onPomodoroClick }) {
  const { t, i18n } = useTranslation()
  const [time, setTime] = React.useState(new Date())
  const [online, setOnline] = React.useState(navigator.onLine)
  const [blurEnabled, setBlurEnabled] = React.useState(() => {
    const saved = localStorage.getItem('clock_blur_enabled')
    return saved !== null ? saved === 'true' : false
  })
  const [pomodoroState, setPomodoroState] = React.useState(null)

  useEffect(() => {
    localStorage.setItem('clock_blur_enabled', String(blurEnabled))
  }, [blurEnabled])

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 10_000)
    const up   = () => setOnline(true)
    const down = () => setOnline(false)
    window.addEventListener('online', up)
    window.addEventListener('offline', down)
    return () => { clearInterval(id); window.removeEventListener('online', up); window.removeEventListener('offline', down) }
  }, [])

  useEffect(() => {
    const checkPomodoro = () => {
      try {
        const saved = localStorage.getItem('clock_pomodoro_state')
        if (saved) {
          const state = JSON.parse(saved)
          if (state.isRunning || state.showNotification) {
            const remaining = state.startTime ? Math.max(0, Math.floor((state.startTime + state.timeLeft * 1000 - Date.now()) / 1000)) : state.timeLeft
            setPomodoroState({ timeLeft: remaining, showNotification: state.showNotification })
          } else {
            setPomodoroState(null)
          }
        }
      } catch (e) { setPomodoroState(null) }
    }
    checkPomodoro()
    const interval = setInterval(checkPomodoro, 1000)
    return () => clearInterval(interval)
  }, [])

  const dateStr = time.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })

  return (
    <div style={{
      height: 44, display:'flex', alignItems:'center', justifyContent:'space-between',
      padding:'0 20px', borderBottom:'1px solid var(--border)',
      flexShrink:0, background:'rgba(0,0,0,0.4)',
      backdropFilter:'blur(12px)', WebkitBackdropFilter:'blur(12px)',
    }}>
      <div style={{ display:'flex', alignItems:'center', gap:14 }}>
        <button onClick={onToggleMenu} style={{
          background:'none', border:'none', cursor:'pointer',
          color:'var(--text-sec)', padding:6,
          display:'flex', alignItems:'center', justifyContent:'center',
          transition:'color .15s',
          fontSize: 20,
          fontFamily: 'inherit',
          position:'relative',
          width: 28,
          height: 28,
        }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--text-pri)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-sec)'}
        >
          <span className={`hamburger-line ${menuOpen ? 'open' : ''}`} style={{
            position:'absolute',
            width: 18,
            height: 2,
            background:'currentColor',
            borderRadius: 1,
            transition:'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          }} />
          <span className={`hamburger-line ${menuOpen ? 'open' : ''}`} style={{
            position:'absolute',
            width: 18,
            height: 2,
            background:'currentColor',
            borderRadius: 1,
            transition:'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          }} />
          <span className={`hamburger-line ${menuOpen ? 'open' : ''}`} style={{
            position:'absolute',
            width: 18,
            height: 2,
            background:'currentColor',
            borderRadius: 1,
            transition:'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          }} />
          <span className={`close-icon ${menuOpen ? 'open' : ''}`} style={{
            position:'absolute',
            width: 20,
            height: 20,
            opacity: menuOpen ? 1 : 0,
            transform: menuOpen ? 'rotate(0deg) scale(1)' : 'rotate(-90deg) scale(0)',
            transition:'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            fontSize: 20,
            lineHeight: '20px',
            display:'flex',
            alignItems:'center',
            justifyContent:'center',
          }}>
            ✕
          </span>
          <style>{`
            .hamburger-line:nth-child(1) {
              top: 8px;
              transform-origin: center;
            }
            .hamburger-line:nth-child(2) {
              top: 50%;
              transform: translateY(-50%);
              transform-origin: center;
            }
            .hamburger-line:nth-child(3) {
              bottom: 8px;
              transform-origin: center;
            }
            .hamburger-line.open:nth-child(1) {
              top: 50%;
              transform: translateY(-50%) rotate(45deg);
            }
            .hamburger-line.open:nth-child(2) {
              opacity: 0;
              transform: translateY(-50%) scaleX(0);
            }
            .hamburger-line.open:nth-child(3) {
              bottom: 50%;
              transform: translateY(50%) rotate(-45deg);
            }
            .close-icon.open {
              transform: rotate(0deg) scale(1);
            }
          `}</style>
        </button>
      </div>

      <div style={{ display:'flex', alignItems:'center', gap:14, fontSize:12, color:'var(--text-ter)' }}>
        <span style={{ color: online ? 'var(--accent)' : 'var(--text-ter)', fontSize:10 }}>◉</span>
        <span>{period.label?.[i18n.language] ?? period.label?.en ?? period.name}</span>
        {pomodoroState && pomodoroState.showNotification && (
          <span 
            onClick={onPomodoroClick}
            style={{ color:'var(--accent)', cursor:'pointer', display:'flex', alignItems:'center', gap:4 }}
          >
            <span style={{ width:6, height:6, borderRadius:'50%', background:'var(--accent)', animation:'pulse 1s infinite' }} />
            {Math.floor(pomodoroState.timeLeft / 60)}:{String(pomodoroState.timeLeft % 60).padStart(2, '0')}
          </span>
        )}
        <span
          onClick={() => setBlurEnabled(!blurEnabled)}
          style={{ fontSize:11, filter: blurEnabled ? 'blur(2px)' : 'none', cursor:'pointer', transition:'filter .3s', userSelect:'none' }}
        >
          {dateStr}
        </span>
      </div>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  )
}

/* ── Horizontal Menu ─────────────────────────────────────────── */
function HorizontalMenu({ activeApp, onNavigate, menuOpen, period, onThemeOverride, onLongPress, splitMode }) {
  const { t, i18n } = useTranslation()
  const lang = i18n.language
  const [menuOrder, setMenuOrder] = React.useState(() => {
    const saved = localStorage.getItem('menuOrder')
    if (saved) {
      return JSON.parse(saved)
    }
    return ['home', ...APP_REGISTRY.map(a => a.id)]
  })
  const [draggedItem, setDraggedItem] = React.useState(null)
  const [isDragging, setIsDragging] = React.useState(false)
  const dragStartPos = React.useRef({ x: 0, y: 0 })
  const longPressTimer = React.useRef(null)

  const handleDragStart = (e, itemId) => {
    setDraggedItem(itemId)
    setIsDragging(false)
    dragStartPos.current = { x: e.clientX, y: e.clientY }
    e.dataTransfer.effectAllowed = 'move'
    setTimeout(() => setIsDragging(true), 100)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e, targetId) => {
    e.preventDefault()
    if (draggedItem && draggedItem !== targetId) {
      const newOrder = [...menuOrder]
      const draggedIndex = newOrder.indexOf(draggedItem)
      const targetIndex = newOrder.indexOf(targetId)
      
      newOrder.splice(draggedIndex, 1)
      newOrder.splice(targetIndex, 0, draggedItem)
      
      setMenuOrder(newOrder)
      localStorage.setItem('menuOrder', JSON.stringify(newOrder))
    }
    setDraggedItem(null)
  }

  const handleDragEnd = () => {
    setDraggedItem(null)
    setTimeout(() => setIsDragging(false), 0)
  }

  const handleClick = (e, itemId) => {
    if (!isDragging && !longPressTimer.current) {
      onNavigate(itemId)
    }
  }

  const handleMouseDown = (e, itemId) => {
    if (itemId === 'home') return
    longPressTimer.current = setTimeout(() => {
      onLongPress(itemId)
      longPressTimer.current = null
    }, 400)
  }

  const handleMouseUp = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }
  }

  const handleTouchStart = (e, itemId) => {
    if (itemId === 'home') return
    longPressTimer.current = setTimeout(() => {
      onLongPress(itemId)
      longPressTimer.current = null
    }, 400)
  }

  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }
  }

  const getItemById = (id) => {
    if (id === 'home') return { id:'home', key:'nav.home', Icon: RiHome4Line }
    return APP_REGISTRY.find(a => a.id === id)
  }

  const isInSplit = (itemId) => {
    return splitMode.active && (splitMode.leftApp === itemId || splitMode.rightApp === itemId)
  }

  return (
    <AnimatePresence>
      {menuOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          style={{
            background: 'rgba(0,0,0,0.3)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            borderBottom: '1px solid var(--border)',
            overflow: 'hidden',
          }}
        >
          <div style={{
            display:'grid',
            gridTemplateColumns:'repeat(auto-fill, minmax(70px, 1fr))',
            gap:8,
            padding:'12px 16px',
            justifyContent:'center',
            justifyItems:'center',
          }}>
            {menuOrder.map(itemId => {
              const item = getItemById(itemId)
              if (!item) return null
              const inSplit = isInSplit(itemId)
              return (
<div
                    key={item.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, item.id)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, item.id)}
                    onDragEnd={handleDragEnd}
                    onClick={(e) => handleClick(e, item.id)}
                    onMouseDown={(e) => handleMouseDown(e, item.id)}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    onTouchStart={(e) => handleTouchStart(e, item.id)}
                    onTouchEnd={handleTouchEnd}
                    style={{
                      display:'flex',
                      flexDirection:'column',
                      alignItems:'center',
                      gap:4,
                      padding:'8px 10px',
                      borderRadius:10,
                      background: activeApp === item.id ? 'var(--surface-hover)' : 'transparent',
                      border: inSplit ? `1px solid var(--accent)` : activeApp === item.id ? '1px solid var(--border2)' : '1px solid transparent',
                      boxShadow: inSplit ? `0 0 8px var(--accent)40` : 'none',
                      cursor:'grab',
                      transition:'all .15s',
                      minWidth: 70,
                      userSelect:'none',
                      textAlign:'center',
                    }}
                    onMouseEnter={e => { if(activeApp !== item.id) e.currentTarget.style.background = 'var(--surface)' }}
                  >
                    {(() => {
                      const Icon = getIconForId(item.id)
                      return Icon ? <Icon 
                        size={20}
                        color={activeApp === item.id ? 'var(--text-pri)' : 'var(--text-sec)'}
                        style={{ pointerEvents:'none', minHeight: 24, display:'flex', alignItems:'center', justifyContent:'center' }}
                      /> : null
                    })()}
                  </div>
              )
            })}
          </div>

          <div style={{ padding:'12px 16px', borderTop:'1px solid var(--border)', marginTop:8 }}>
            <div style={{ fontSize:9, fontWeight:600, letterSpacing:1.5, color:'var(--text-ter)', textTransform:'uppercase', marginBottom:8 }}>
              {t('settings.session')}
            </div>
            <div style={{ display:'flex', flexDirection:'row', flexWrap:'wrap', gap:8 }}>
              {Object.values(PERIODS).map(p => (
                <button key={p.name} onClick={() => onThemeOverride(p)} style={{
                  padding:'5px 8px', borderRadius:7, border: p.name===period.name ? `1px solid ${p.accent}44` : '1px solid transparent',
                  background: p.name===period.name ? p.accentDim : 'transparent',
                  color: p.name===period.name ? p.accent : 'var(--text-ter)',
                  fontSize:11, cursor:'pointer', fontFamily:'inherit', fontWeight:500,
                  transition:'all .15s',
                }}>
                  {p.label?.[lang] ?? p.label?.en ?? p.name}
                </button>
              ))}
              <button onClick={() => onThemeOverride(null)} style={{
                padding:'5px 8px', borderRadius:7, border:'1px solid transparent',
                background:'transparent', color:'var(--text-ter)', fontSize:11,
                cursor:'pointer', fontFamily:'inherit',
                transition:'all .15s',
              }}>
                auto ↺
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/* ── Launcher (home) ───────────────────────────────────────── */
function Launcher({ period, onOpen }) {
  const { t } = useTranslation()
  const { currentTime, online } = useTime()
  const greetingKey = `greeting.${period.name}`
  const [blurEnabled, setBlurEnabled] = React.useState(() => {
    const saved = localStorage.getItem('clock_blur_enabled')
    return saved !== null ? saved === 'true' : false
  })

  React.useEffect(() => {
    localStorage.setItem('clock_blur_enabled', String(blurEnabled))
  }, [blurEnabled])

  const formatDate = () => {
    const options = { weekday:'long', year:'numeric', month:'long', day:'numeric' }
    return currentTime.toLocaleDateString(undefined, options)
  }

  const formatTime = () => {
    const h = currentTime.getHours()
    const m = currentTime.getMinutes()
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
  }

  return (
    <motion.div
      key="launcher"
      initial={{ opacity:0 }}
      animate={{ opacity:1 }}
      exit={{ opacity:0 }}
      transition={{ duration:.2 }}
      style={{ padding:'40px 36px', overflowY:'auto', height:'100%', paddingBottom:'calc(env(safe-area-inset-bottom, 20px) + 20px)' }}
    >
      <h1 style={{ fontFamily:'Syne', fontSize:42, fontWeight:700, color:'var(--text-pri)', letterSpacing:'-1px', lineHeight:1.1, marginBottom:6 }}>
        {t(greetingKey, { defaultValue: 'Hello' })}
      </h1>
      <div
        onClick={() => setBlurEnabled(!blurEnabled)}
        style={{ fontSize:14, color:'var(--text-ter)', fontWeight:300, marginBottom:40, filter: blurEnabled ? 'blur(2px)' : 'none', userSelect:'none', cursor:'pointer', transition:'filter .3s' }}
      >
        {formatTime()} · {formatDate()}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(110px, 1fr))', gap:14 }}>
        {APP_REGISTRY.map((app, i) => (
          <motion.button
            key={app.id}
            onClick={() => !app.disabled && onOpen(app.id)}
            initial={{ opacity:0, y:12 }}
            animate={{ opacity:1, y:0 }}
            transition={{ delay: i * 0.07, duration:.3, ease:[.22,1,.36,1] }}
            style={{
              display:'flex', flexDirection:'column', alignItems:'center', gap:10,
              padding:'20px 12px', borderRadius:16,
              border: app.disabled ? '1px dashed var(--border)' : '1px solid var(--border)',
              background: app.disabled ? 'transparent' : 'var(--surface)',
              cursor: app.disabled ? 'not-allowed' : 'pointer',
              fontFamily:'inherit',
              opacity: app.disabled ? 0.4 : 1,
            }}
            whileHover={!app.disabled ? { backgroundColor:'var(--surface-hover)', borderColor:'var(--border2)', y:-2 } : {}}
            whileTap={!app.disabled ? { scale:.95 } : {}}
           >
              <div style={{ width:52, height:52, borderRadius:14, background: app.disabled ? `${app.color}08` : `${app.color}18`, border:`1px solid ${app.color}28`, display:'flex', alignItems:'center', justifyContent:'center', color: 'var(--text-pri)' }}>
                 {(() => {
                   const Icon = getIconForId(app.id)
                   return Icon ? <Icon size={app.iconSize ?? 26} /> : null
                 })()}
              </div>
             <span style={{ fontSize:12, color:'var(--text-sec)' }}>{t(app.appKey)}</span>
           </motion.button>
        ))}
      </div>

      <div style={{ marginTop:40, padding:'16px 20px', borderRadius:14, background:'var(--surface)', border:'1px solid var(--border)' }}>
        <div style={{ fontSize:10, fontWeight:600, letterSpacing:1.5, color:'var(--text-ter)', textTransform:'uppercase', marginBottom:12 }}>
          {t('shortcuts.title')}
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
          {[['1–6',t('shortcuts.apps')],['Esc',t('shortcuts.home')],['Ctrl+,',t('shortcuts.settings')],['Ctrl+N',t('shortcuts.newNote')]].map(([k, v]) => (
            <div key={k} style={{ display:'flex', alignItems:'center', gap:8 }}>
              <kbd style={{ background:'var(--surface-hover)', border:'1px solid var(--border2)', borderRadius:5, padding:'2px 7px', fontSize:11, fontFamily:'var(--font-mono)', color:'var(--text-sec)' }}>{k}</kbd>
              <span style={{ fontSize:12, color:'var(--text-ter)' }}>{v}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

/* ── App window ────────────────────────────────────────────── */
function AppWindow({ appId, onClose, onThemeOverride }) {
  const app = getApp(appId)
  const [touchStart, setTouchStart] = React.useState(null)

  const handleTouchStart = (e) => {
    setTouchStart({ x: e.touches[0].clientX, y: e.touches[0].clientY })
  }

  const handleTouchEnd = (e) => {
    if (!touchStart) return
    const dx = e.changedTouches[0].clientX - touchStart.x
    const dy = e.changedTouches[0].clientY - touchStart.y
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) && dx > 0) {
      onClose()
    }
    setTouchStart(null)
  }

  return (
    <motion.div
      key={appId}
      initial={{ opacity:0, x:16 }}
      animate={{ opacity:1, x:0 }}
      exit={{ opacity:0, x:-16 }}
      transition={{ duration:.22, ease:[.22,1,.36,1] }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', touchAction: 'manipulation' }}
    >
      <div style={{ flex:1, overflow:'hidden', position:'relative', paddingBottom:'env(safe-area-inset-bottom, 0px)' }}>
        <Suspense fallback={
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100%', color:'var(--text-ter)', fontSize:13 }}>
            Loading...
          </div>
        }>
          <app.component onThemeOverride={onThemeOverride} onClose={onClose} />
        </Suspense>
      </div>
    </motion.div>
  )
}

/* ── Split Top Bar ─────────────────────────────────────────── */
function SplitTopBar({ leftApp, rightApp, onClose, onSwapApp, onToggleNavbar, navbarVisible }) {
  const LeftIcon = getIconForId(leftApp)
  const RightIcon = getIconForId(rightApp)

  return (
    <div style={{
      height: 44, display:'flex', alignItems:'center', justifyContent:'space-between',
      padding:'0 16px', borderBottom:'1px solid var(--border)',
      flexShrink:0, background:'rgba(0,0,0,0.4)',
      backdropFilter:'blur(12px)', WebkitBackdropFilter:'blur(12px)',
    }}>
      <button 
        onClick={onClose}
        style={{
          background:'var(--surface)', border:'1px solid var(--border)',
          borderRadius:8, width:28, height:28, cursor:'pointer',
          color:'var(--text-sec)', fontSize:15,
          display:'flex', alignItems:'center', justifyContent:'center',
          transition:'background .12s',
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-hover)'}
        onMouseLeave={e => e.currentTarget.style.background = 'var(--surface)'}
      >
        ×
      </button>

      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
        <div style={{
          display:'flex', alignItems:'center', gap:6,
          padding:'6px 12px', borderRadius:20,
          background:'var(--accent)', color:'#fff',
        }}>
          {LeftIcon && <LeftIcon size={16} />}
        </div>
        
        <RiArrowLeftRightLine size={16} color="var(--text-ter)" />
        
        <button 
          onClick={onSwapApp}
          style={{
            display:'flex', alignItems:'center', gap:6,
            padding:'6px 12px', borderRadius:20,
            background:'var(--surface)', border:'1px solid var(--border)',
            color:'var(--text-sec)', cursor:'pointer',
            transition:'all .15s',
          }}
          onMouseEnter={e => { 
            e.currentTarget.style.background = 'var(--surface-hover)'
            e.currentTarget.style.borderColor = 'var(--accent)'
          }}
          onMouseLeave={e => { 
            e.currentTarget.style.background = 'var(--surface)'
            e.currentTarget.style.borderColor = 'var(--border)'
          }}
        >
          {RightIcon && <RightIcon size={16} />}
        </button>

        <button 
          onClick={onToggleNavbar}
          style={{
            display:'flex', alignItems:'center', gap:6,
            padding:'6px 8px', borderRadius:8,
            background:'var(--surface)', border:'1px solid var(--border)',
            color:'var(--text-sec)', cursor:'pointer',
            transition:'all .15s',
          }}
          onMouseEnter={e => { 
            e.currentTarget.style.background = 'var(--surface-hover)'
          }}
          onMouseLeave={e => { 
            e.currentTarget.style.background = 'var(--surface)'
          }}
        >
          {navbarVisible ? <RiArrowUpSLine size={16} /> : <RiArrowDownSLine size={16} />}
        </button>
      </div>

      <div style={{ width:28 }} />
    </div>
  )
}

/* ── Main App ──────────────────────────────────────────────── */
function AppContent() {
  const { currentTime } = useTime()
  const { period, setOverride } = useTheme(currentTime)
  const [activeApp, setActiveApp] = React.useState('home')
  const [menuOpen, setMenuOpen] = React.useState(false)
  const [splitMode, setSplitMode] = React.useState(() => {
    try {
      const saved = localStorage.getItem('splitMode')
      return saved ? JSON.parse(saved) : { active: false, leftApp: null, rightApp: null }
    } catch { return { active: false, leftApp: null, rightApp: null } }
  })
  const [showAppSelector, setShowAppSelector] = React.useState(false)
  const [pendingSplitApp, setPendingSplitApp] = React.useState(null)
  const [showTutorial, setShowTutorial] = React.useState(false)
  const [swappingApp, setSwappingApp] = React.useState(null)
  const [navbarVisible, setNavbarVisible] = React.useState(true)

  const navigate = (id) => {
    setActiveApp(id)
    setMenuOpen(false)
  }

  const handleLongPress = (appId) => {
    if (appId === 'home') return
    setPendingSplitApp(appId)
    setShowTutorial(true)
  }

  const handleTutorialComplete = () => {
    setShowTutorial(false)
    setShowAppSelector(true)
  }

  const handleTutorialSkip = () => {
    setShowTutorial(false)
    setShowAppSelector(true)
  }

  const handleSelectSplitApp = (secondAppId) => {
    setSplitMode({
      active: true,
      leftApp: pendingSplitApp,
      rightApp: secondAppId,
    })
    localStorage.setItem('splitMode', JSON.stringify({
      active: true,
      leftApp: pendingSplitApp,
      rightApp: secondAppId,
    }))
    setShowAppSelector(false)
    setPendingSplitApp(null)
  }

  const handleSwapApp = (appToSwap) => {
    setSwappingApp(appToSwap)
    setPendingSplitApp(appToSwap === 'left' ? splitMode.leftApp : splitMode.rightApp)
    setShowAppSelector(true)
  }

  const handleSwapComplete = (newAppId) => {
    if (swappingApp === 'right') {
      setSplitMode(prev => ({
        ...prev,
        rightApp: newAppId,
      }))
      localStorage.setItem('splitMode', JSON.stringify({
        ...splitMode,
        rightApp: newAppId,
      }))
    }
    setShowAppSelector(false)
    setSwappingApp(null)
    setPendingSplitApp(null)
  }

  const handleCloseSplit = () => {
    setSplitMode({ active: false, leftApp: null, rightApp: null })
    localStorage.setItem('splitMode', JSON.stringify({ active: false, leftApp: null, rightApp: null }))
    navigate('home')
  }

  const handleCloseOneApp = (appToClose) => {
    if (appToClose === splitMode.leftApp) {
      if (splitMode.rightApp) {
        setSplitMode({ active: false, leftApp: null, rightApp: null })
        localStorage.setItem('splitMode', JSON.stringify({ active: false, leftApp: null, rightApp: null }))
        navigate(splitMode.rightApp)
      } else {
        handleCloseSplit()
      }
    } else {
      setSplitMode(prev => ({
        ...prev,
        rightApp: null,
      }))
      localStorage.setItem('splitMode', JSON.stringify({
        ...splitMode,
        rightApp: null,
      }))
    }
  }

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') {
        if (splitMode.active) {
          handleCloseSplit()
        } else {
          setActiveApp('home')
        }
      }
      if (e.key === '1') setActiveApp('clock')
      if (e.key === '2') setActiveApp('notes')
      if (e.key === '3') setActiveApp('energy')
      if (e.key === '4') setActiveApp('chat')
      if (e.key === '5') setActiveApp('settings')
      if (e.key === '6') setActiveApp('quadro')
      if (e.ctrlKey && e.key === ',') { e.preventDefault(); setActiveApp('settings') }
      if (e.ctrlKey && e.key === 'n') { e.preventDefault(); setActiveApp('notes') }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [splitMode])

  return (
    <div style={{ width:'100vw', height:'100dvh', background:'var(--bg)', display:'flex', flexDirection:'column', overflow:'hidden', position:'relative' }}>
      <div style={{ position:'absolute', inset:0, background: period.bg, zIndex:0, transition:'background 1.5s ease', pointerEvents:'none' }} />
      <div style={{ position:'absolute', inset:0, background: period.orb, zIndex:0, pointerEvents:'none' }} />

      <div style={{ position:'relative', zIndex:1, display:'flex', flexDirection:'column', height:'100%', paddingBottom:'env(safe-area-inset-bottom, 0px)' }}>
        {!splitMode.active && (
          <TopBar 
            period={period} 
            onToggleMenu={() => setMenuOpen(v => !v)} 
            menuOpen={menuOpen} 
            onPomodoroClick={() => navigate('clock')}
          />
        )}

        {splitMode.active && (
          <SplitTopBar
            leftApp={splitMode.leftApp}
            rightApp={splitMode.rightApp}
            onClose={handleCloseSplit}
            onSwapApp={() => handleSwapApp('right')}
            onToggleNavbar={() => setNavbarVisible(v => !v)}
            navbarVisible={navbarVisible}
          />
        )}

        {(!splitMode.active || navbarVisible) && (
          <HorizontalMenu 
            activeApp={activeApp} 
            onNavigate={navigate} 
            menuOpen={menuOpen} 
            period={period} 
            onThemeOverride={setOverride}
            onLongPress={handleLongPress}
            splitMode={splitMode}
          />
        )}

        <div style={{ flex:1, position:'relative', overflow:'hidden' }}>
          <AnimatePresence mode="wait">
            {activeApp === 'home' && !splitMode.active ? (
              <Launcher key="home" period={period} onOpen={navigate} />
            ) : splitMode.active ? (
              <SplitView
                key="split"
                leftApp={splitMode.leftApp}
                rightApp={splitMode.rightApp}
                onCloseOneApp={handleCloseOneApp}
                onCloseAll={() => handleCloseSplit()}
                onThemeOverride={setOverride}
              />
            ) : (
              <AppWindow
                key={activeApp}
                appId={activeApp}
                onClose={() => navigate('home')}
                onThemeOverride={setOverride}
              />
            )}
          </AnimatePresence>
        </div>
      </div>

      <AppSelector
        isOpen={showAppSelector}
        currentAppId={pendingSplitApp}
        onSelect={swappingApp ? handleSwapComplete : handleSelectSplitApp}
        onClose={() => {
          setShowAppSelector(false)
          setPendingSplitApp(null)
          setSwappingApp(null)
        }}
      />

      <GuidedTutorial
        isOpen={showTutorial}
        onComplete={handleTutorialComplete}
        onSkip={handleTutorialSkip}
      />
    </div>
  )
}

export default function App() {
  return (
    <TimeProvider>
      <AppContent />
    </TimeProvider>
  )
}
