import React, { Suspense, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useTheme } from './hooks/useTheme'
import { useWindowManager } from './hooks/useWindowManager'
import { APP_REGISTRY, getApp } from './config/appRegistry'
import { PERIODS } from './config/theme'
import './config/i18n'

/* ── Top bar ───────────────────────────────────────────────── */
function TopBar({ period }) {
  const [time, setTime] = React.useState(new Date())
  const [online, setOnline] = React.useState(navigator.onLine)

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 10_000)
    const up   = () => setOnline(true)
    const down = () => setOnline(false)
    window.addEventListener('online', up)
    window.addEventListener('offline', down)
    return () => { clearInterval(id); window.removeEventListener('online', up); window.removeEventListener('offline', down) }
  }, [])

  const hh = String(time.getHours()).padStart(2, '0')
  const mm = String(time.getMinutes()).padStart(2, '0')
  const dateStr = time.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })

  return (
    <div style={{
      height: 44, display:'flex', alignItems:'center', justifyContent:'space-between',
      padding:'0 20px', borderBottom:'1px solid var(--border)',
      flexShrink:0, background:'rgba(0,0,0,0.4)',
      backdropFilter:'blur(12px)', WebkitBackdropFilter:'blur(12px)',
    }}>
      <div style={{ display:'flex', alignItems:'center', gap:14 }}>
        <div style={{ display:'flex', gap:6 }}>
          {['#ff5f57','#ffbd2e','#28ca41'].map((c,i) => (
            <div key={i} style={{ width:12, height:12, borderRadius:'50%', background:c, cursor:'pointer' }} />
          ))}
        </div>
        <span style={{ fontFamily:'Syne', fontSize:13, fontWeight:600, color:'var(--text-pri)', letterSpacing:'.3px' }}>OS Shell</span>
      </div>

      <div style={{ fontFamily:'DM Mono', fontSize:13, color:'var(--text-ter)' }}>
        {hh}:{mm}
      </div>

      <div style={{ display:'flex', alignItems:'center', gap:14, fontSize:12, color:'var(--text-ter)' }}>
        <span style={{ color: online ? 'var(--accent)' : 'var(--text-ter)', fontSize:10 }}>◉</span>
        <span>{period.label?.en ?? period.name}</span>
        <span style={{ fontSize:11 }}>{dateStr}</span>
      </div>
    </div>
  )
}

/* ── Sidebar ───────────────────────────────────────────────── */
function Sidebar({ activeApp, onNavigate, period, onThemeOverride }) {
  const { t } = useTranslation()

  return (
    <div style={{
      width: 200, borderRight:'1px solid var(--border)',
      display:'flex', flexDirection:'column', flexShrink:0,
      background:'rgba(0,0,0,0.2)',
    }}>
      <div style={{ padding:'14px 16px 6px', fontSize:9, fontWeight:600, letterSpacing:1.8, color:'var(--text-ter)', textTransform:'uppercase' }}>
        {t('nav.home')}
      </div>

      {[{ id:'home', icon:'⌂', key:'nav.home' }, ...APP_REGISTRY.map(a => ({ id:a.id, icon:a.icon, key:a.navKey }))].map(item => (
        <button key={item.id} onClick={() => onNavigate(item.id)} style={{
          display:'flex', alignItems:'center', gap:10,
          padding:'9px 14px', background:'none', border:'none',
          borderLeft: activeApp === item.id ? '2px solid var(--accent)' : '2px solid transparent',
          cursor:'pointer', transition:'background .12s',
          backgroundColor: activeApp === item.id ? 'var(--surface-hover)' : 'transparent',
        }}
          onMouseEnter={e => { if(activeApp !== item.id) e.currentTarget.style.backgroundColor = 'var(--surface)' }}
          onMouseLeave={e => { if(activeApp !== item.id) e.currentTarget.style.backgroundColor = 'transparent' }}
        >
          <span style={{ fontSize:16, width:20, textAlign:'center', flexShrink:0 }}>{item.icon}</span>
          <span style={{ fontSize:13, color: activeApp===item.id ? 'var(--text-pri)' : 'var(--text-sec)', fontWeight: activeApp===item.id ? 500 : 400 }}>
            {t(item.key)}
          </span>
        </button>
      ))}

      <div style={{ marginTop:'auto', padding:12 }}>
        <div style={{ fontSize:9, fontWeight:600, letterSpacing:1.5, color:'var(--text-ter)', textTransform:'uppercase', marginBottom:8 }}>
          Theme
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:3 }}>
          {Object.values(PERIODS).map(p => (
            <button key={p.name} onClick={() => onThemeOverride(p)} style={{
              padding:'5px 8px', borderRadius:7, border: p.name===period.name ? `1px solid ${p.accent}44` : '1px solid transparent',
              background: p.name===period.name ? p.accentDim : 'transparent',
              color: p.name===period.name ? p.accent : 'var(--text-ter)',
              fontSize:11, cursor:'pointer', fontFamily:'inherit', fontWeight:500,
              textAlign:'left', transition:'all .15s',
            }}>
              {p.name}
            </button>
          ))}
          <button onClick={() => onThemeOverride(null)} style={{
            padding:'5px 8px', borderRadius:7, border:'1px solid transparent',
            background:'transparent', color:'var(--text-ter)', fontSize:11,
            cursor:'pointer', fontFamily:'inherit', textAlign:'left',
          }}>
            auto ↺
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Launcher (home) ───────────────────────────────────────── */
function Launcher({ period, onOpen }) {
  const { t } = useTranslation()
  const greetingKey = `greeting.${period.name}`
  const date = new Date().toLocaleDateString(undefined, { weekday:'long', month:'long', day:'numeric' })

  return (
    <motion.div
      key="launcher"
      initial={{ opacity:0 }}
      animate={{ opacity:1 }}
      exit={{ opacity:0 }}
      transition={{ duration:.2 }}
      style={{ padding:'40px 36px', overflowY:'auto', height:'100%' }}
    >
      <h1 style={{ fontFamily:'Syne', fontSize:42, fontWeight:700, color:'var(--text-pri)', letterSpacing:'-1px', lineHeight:1.1, marginBottom:6 }}>
        {t(greetingKey, { defaultValue: 'Hello' })}
      </h1>
      <p style={{ fontSize:14, color:'var(--text-ter)', fontWeight:300, marginBottom:40 }}>{date}</p>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(110px, 1fr))', gap:14 }}>
        {APP_REGISTRY.map((app, i) => (
          <motion.button
            key={app.id}
            onClick={() => onOpen(app.id)}
            initial={{ opacity:0, y:12 }}
            animate={{ opacity:1, y:0 }}
            transition={{ delay: i * 0.07, duration:.3, ease:[.22,1,.36,1] }}
            style={{
              display:'flex', flexDirection:'column', alignItems:'center', gap:10,
              padding:'20px 12px', borderRadius:16,
              border:'1px solid var(--border)', background:'var(--surface)',
              cursor:'pointer', fontFamily:'inherit',
            }}
            whileHover={{ backgroundColor:'var(--surface-hover)', borderColor:'var(--border2)', y:-2 }}
            whileTap={{ scale:.95 }}
          >
            <div style={{ width:52, height:52, borderRadius:14, background:`${app.color}18`, border:`1px solid ${app.color}28`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:26 }}>
              {app.icon}
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
          {[['1–4','Open apps'],['Esc','Go home'],['Ctrl+,','Settings'],['Ctrl+N','New note']].map(([k, v]) => (
            <div key={k} style={{ display:'flex', alignItems:'center', gap:8 }}>
              <kbd style={{ background:'var(--surface-hover)', border:'1px solid var(--border2)', borderRadius:5, padding:'2px 7px', fontSize:11, fontFamily:'DM Mono', color:'var(--text-sec)' }}>{k}</kbd>
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
  const { t } = useTranslation()
  if (!app) return null

  return (
    <motion.div
      key={appId}
      initial={{ opacity:0, x:16 }}
      animate={{ opacity:1, x:0 }}
      exit={{ opacity:0, x:-16 }}
      transition={{ duration:.22, ease:[.22,1,.36,1] }}
      style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column' }}
    >
      <div style={{
        display:'flex', alignItems:'center', justifyContent:'space-between',
        padding:'12px 20px', borderBottom:'1px solid var(--border)',
        flexShrink:0, background:'rgba(0,0,0,0.15)',
      }}>
        <div style={{ display:'flex', alignItems:'center', gap:9 }}>
          <span style={{ fontSize:18 }}>{app.icon}</span>
          <span style={{ fontFamily:'Syne', fontSize:16, fontWeight:600, color:'var(--text-pri)' }}>
            {t(app.appKey)}
          </span>
        </div>
        <button onClick={onClose} style={{
          background:'var(--surface)', border:'1px solid var(--border)',
          borderRadius:9, width:30, height:30, cursor:'pointer',
          color:'var(--text-sec)', fontSize:17,
          display:'flex', alignItems:'center', justifyContent:'center',
          transition:'background .12s',
        }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-hover)'}
          onMouseLeave={e => e.currentTarget.style.background = 'var(--surface)'}
        >
          ×
        </button>
      </div>

      <div style={{ flex:1, overflow:'hidden', position:'relative' }}>
        <Suspense fallback={
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100%', color:'var(--text-ter)', fontSize:13 }}>
            Loading...
          </div>
        }>
          <app.component onThemeOverride={onThemeOverride} />
        </Suspense>
      </div>
    </motion.div>
  )
}

/* ── Main App ──────────────────────────────────────────────── */
export default function App() {
  const { period, setOverride } = useTheme()
  const [activeApp, setActiveApp] = React.useState('home')

  const navigate = (id) => setActiveApp(id)

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') setActiveApp('home')
      if (e.key === '1') setActiveApp('clock')
      if (e.key === '2') setActiveApp('notes')
      if (e.key === '3') setActiveApp('calculator')
      if (e.key === '4') setActiveApp('settings')
      if (e.ctrlKey && e.key === ',') { e.preventDefault(); setActiveApp('settings') }
      if (e.ctrlKey && e.key === 'n') { e.preventDefault(); setActiveApp('notes') }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  return (
    <div style={{ width:'100vw', height:'100dvh', background:'var(--bg)', display:'flex', flexDirection:'column', overflow:'hidden', position:'relative' }}>
      <div style={{ position:'absolute', inset:0, background: period.bg, zIndex:0, transition:'background 1.5s ease', pointerEvents:'none' }} />
      <div style={{ position:'absolute', inset:0, background: period.orb, zIndex:0, pointerEvents:'none' }} />

      <div style={{ position:'relative', zIndex:1, display:'flex', flexDirection:'column', height:'100%' }}>
        <TopBar period={period} />

        <div style={{ flex:1, display:'flex', overflow:'hidden' }}>
          <Sidebar
            activeApp={activeApp}
            onNavigate={navigate}
            period={period}
            onThemeOverride={setOverride}
          />

          <div style={{ flex:1, position:'relative', overflow:'hidden' }}>
            <AnimatePresence mode="wait">
              {activeApp === 'home' ? (
                <Launcher key="home" period={period} onOpen={navigate} />
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
      </div>
    </div>
  )
}
