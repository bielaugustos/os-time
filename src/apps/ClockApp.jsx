import React, { useEffect, useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useTheme } from '../hooks/useTheme'
import { 
  RiMoonLine,
  RiSunLine,
  RiTimeLine,
  RiAlarmWarningLine,
  RiDeleteBinLine,
  RiCompassDiscoverLine,
  RiGlobalLine,
  RiTornadoLine,
  RiAlarmLine,
  RiFireLine,
  RiCalendarLine,
  RiAddCircleLine,
  RiSubtractLine,
  RiEdit2Line,
  RiNotification3Line,
  RiCloseLine,
} from '@remixicon/react'

const TABS = ['worldClock', 'stopwatchTimer', 'alarm', 'compass']

function WorldClock({ now, period }) {
  const { t } = useTranslation()
  const [atomicTime, setAtomicTime] = useState(new Date())
  const pad = n => String(n).padStart(2, '0')
  const padMs = n => String(n).padStart(3, '0')
  
  useEffect(() => {
    const SYNC_INTERVAL = 3600000 // 1 hour
    let lastSyncTime = null
    let offsetMs = 0
    
    const syncTime = async () => {
      try {
        const start = performance.now()
        const res = await fetch('https://worldtimeapi.org/api/timezone/Etc/UTC')
        const data = await res.json()
        const end = performance.now()
        const roundTrip = end - start
        const serverUnix = data.unixtime * 1000 + data.raw_offset + data.dst_offset + data.dst
        const serverTime = new Date(serverUnix + roundTrip / 2)
        lastSyncTime = Date.now()
        offsetMs = serverTime.getTime() - Date.now()
        setAtomicTime(serverTime)
      } catch (e) {
        if (lastSyncTime && offsetMs !== 0) {
          setAtomicTime(new Date(Date.now() + offsetMs))
        }
      }
    }
    syncTime()
    const interval = setInterval(() => {
      if (offsetMs !== 0) {
        setAtomicTime(new Date(Date.now() + offsetMs))
      }
    }, 1000)
    const syncInterval = setInterval(syncTime, SYNC_INTERVAL)
    return () => { clearInterval(interval); clearInterval(syncInterval) }
  }, [])
  
  const deg = { h: (atomicTime.getHours() % 12) * 30 + atomicTime.getMinutes() * 0.5, m: atomicTime.getMinutes() * 6, s: atomicTime.getSeconds() * 6 }
  const hand = (deg, r) => { const rad = deg * Math.PI / 180; return { x: 90 + r * Math.sin(rad), y: 90 - r * Math.cos(rad) } }

  const timeZones = [
    { city:'UTC', offset:0, flag:'🌍' },
    { city:'New York', offset:-4, flag:'🇺🇸' },
    { city:'London', offset:1, flag:'🇬🇧' },
    { city:'Paris', offset:2, flag:'🇫🇷' },
    { city:'Tokyo', offset:9, flag:'🇯🇵' },
    { city:'Sydney', offset:10, flag:'🇦🇺' },
    { city:'Dubai', offset:4, flag:'🇦🇪' },
    { city:'São Paulo', offset:-3, flag:'🇧🇷' },
    { city:'Los Angeles', offset:-7, flag:'🇺🇸' },
    { city:'Singapore', offset:8, flag:'🇸🇬' },
  ]

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', overflow:'auto', padding:20 }}>
      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:16, marginBottom:24 }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, padding:'6px 12px', borderRadius:20, background:'var(--surface)', border:'1px solid var(--border)' }}>
          <div style={{ width:8, height:8, borderRadius:'50%', background:'#10b981', animation:'pulse 2s infinite' }} />
          <span style={{ fontSize:11, color:'var(--text-sec)', fontWeight:500 }}>{t('clock.atomicClock')}</span>
        </div>

        <svg viewBox="0 0 180 180" style={{ width:160, height:160 }}>
          <defs>
            <linearGradient id="secGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={period.accent} />
              <stop offset="100%" stopColor={period.accentDim || period.accent} />
            </linearGradient>
          </defs>
          <circle cx="90" cy="90" r="85" fill="none" stroke="var(--border)" strokeWidth="1" />
          {Array.from({ length: 60 }).map((_, i) => {
            const a = i * 6 * Math.PI / 180
            const r1 = i % 5 === 0 ? 70 : 76
            const x1 = 90 + r1 * Math.sin(a)
            const y1 = 90 - r1 * Math.cos(a)
            const x2 = 80 * Math.sin(a)
            const y2 = 80 * Math.cos(a)
            return <line key={i} x1={90 + x2} y1={90 - y2} x2={x1} y2={y1} stroke={i % 5 === 0 ? 'var(--text-sec)' : 'var(--border)'} strokeWidth={i % 5 === 0 ? 1.5 : 0.5} />
          })}
          <line x1="90" y1="90" x2={hand(deg.h, 40).x} y2={hand(deg.h, 40).y} stroke="var(--text-pri)" strokeWidth="3" strokeLinecap="round" />
          <line x1="90" y1="90" x2={hand(deg.m, 55).x} y2={hand(deg.m, 55).y} stroke="var(--text-pri)" strokeWidth="2" strokeLinecap="round" />
          <line x1="90" y1="90" x2={hand(deg.s, 65).x} y2={hand(deg.s, 65).y} stroke="url(#secGrad)" strokeWidth="2" strokeLinecap="round" />
          <circle cx="90" cy="90" r="4" fill={period.accent} />
          <text x="90" y="25" textAnchor="middle" fill="var(--text-ter)" fontSize="10" fontFamily="var(--font-mono)">12</text>
          <text x="90" y="165" textAnchor="middle" fill="var(--text-ter)" fontSize="10" fontFamily="var(--font-mono)">6</text>
          <text x="165" y="93" textAnchor="middle" fill="var(--text-ter)" fontSize="10" fontFamily="var(--font-mono)">3</text>
          <text x="25" y="93" textAnchor="middle" fill="var(--text-ter)" fontSize="10" fontFamily="var(--font-mono)">9</text>
        </svg>

        <div style={{ textAlign:'center' }}>
          <div style={{ fontFamily:'var(--font-mono)', fontSize:48, fontWeight:300, color:'var(--text-pri)', letterSpacing:-2, lineHeight:1 }}>
            {pad(atomicTime.getHours())}:{pad(atomicTime.getMinutes())}
            <span style={{ fontSize:24, color:'var(--text-ter)' }}>:{pad(atomicTime.getSeconds())}</span>
          </div>
          <div style={{ fontSize:13, color:'var(--accent)', marginTop:4 }}>
            {padMs(atomicTime.getMilliseconds())} ms
          </div>
          <div style={{ fontSize:13, color:'var(--text-ter)', marginTop:6 }}>
            {now.toLocaleDateString(undefined, { weekday:'long', month:'long', day:'numeric' })}
          </div>
        </div>
      </div>

      <div style={{ width:'100%' }}>
        <div style={{ fontSize:10, fontWeight:600, letterSpacing:1.5, color:'var(--text-ter)', textTransform:'uppercase', marginBottom:12 }}>
          {t('clock.worldClock')}
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(120px, 1fr))', gap:8 }}>
          {timeZones.map(tz => {
            const localTime = new Date(now.getTime() + tz.offset * 60 * 60 * 1000)
            const hours = localTime.getUTCHours()
            const minutes = localTime.getUTCMinutes()
            const isNight = hours < 6 || hours >= 18
            const isCurrentDay = now.getHours() === hours || (now.getHours() + 24) % 24 === hours
            
            return (
              <div key={tz.city} style={{
                padding:'12px 10px', borderRadius:10, background:'var(--surface)',
                border:`1px solid ${isCurrentDay ? period.accent : isNight ? 'rgba(96,165,250,0.15)' : 'var(--border)'}`,
                transition:'all .15s',
              }}>
                <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:6 }}>
                  <span style={{ fontSize:14 }}>{tz.flag}</span>
                  <span style={{ fontSize:11, color:'var(--text-ter)', fontWeight:500 }}>{tz.city}</span>
                </div>
                <div style={{ fontFamily:'var(--font-mono)', fontSize:20, color:'var(--text-pri)', fontWeight:500 }}>
                  {pad(hours)}:{pad(minutes)}
                </div>
                <div style={{ fontSize:9, color:isNight ? period.accent : 'var(--text-ter)', marginTop:4, display:'flex', alignItems:'center', gap:4 }}>
                  {isNight ? <RiMoonLine size={10} color={period.accent} /> : <RiSunLine size={10} color="var(--text-ter)" />}
                  UTC{tz.offset >= 0 ? `+${tz.offset}` : tz.offset}
                </div>
              </div>
            )
          })}
        </div>
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

function StopwatchTimer() {
  const { t } = useTranslation()
  const [mode, setMode] = useState('stopwatch')
  const [stopwatchTime, setStopwatchTime] = useState(0)
  const [stopwatchRunning, setStopwatchRunning] = useState(false)
  const [laps, setLaps] = useState([])
  const [timerTime, setTimerTime] = useState(0)
  const [timerRunning, setTimerRunning] = useState(false)
  const [timerInput, setTimerInput] = useState({ h:0, m:5, s:0 })
  const [timerFinished, setTimerFinished] = useState(false)
  const intervalRef = useRef(null)

  useEffect(() => {
    if (stopwatchRunning || timerRunning) {
      intervalRef.current = setInterval(() => {
        if (stopwatchRunning) {
          setStopwatchTime(v => v + 10)
        }
        if (timerRunning && timerTime > 0) {
          setTimerTime(v => {
            if (v <= 1000) {
              setTimerRunning(false)
              setTimerFinished(true)
              return 0
            }
            return v - 1000
          })
        }
      }, 10)
      return () => clearInterval(intervalRef.current)
    }
  }, [stopwatchRunning, timerRunning, timerTime])

  const formatTime = (ms, showMs = false) => {
    const s = Math.floor(ms / 1000)
    const m = Math.floor(s / 60)
    const h = Math.floor(m / 60)
    if (showMs) {
      return `${String(h % 24).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}.${String(Math.floor((ms % 1000) / 10)).padStart(2, '0')}`
    }
    return `${String(h % 24).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
  }

  const handleStopwatchStart = () => setStopwatchRunning(!stopwatchRunning)
  const handleStopwatchReset = () => { setStopwatchRunning(false); setStopwatchTime(0); setLaps([]) }
  const handleLap = () => { if (stopwatchRunning && stopwatchTime > 0) setLaps(prev => [{ number: prev.length + 1, time: stopwatchTime }, ...prev]) }

  const handleTimerStart = () => {
    if (timerTime === 0 && !timerFinished) {
      const totalMs = (timerInput.h * 3600 + timerInput.m * 60 + timerInput.s) * 1000
      if (totalMs > 0) { setTimerTime(totalMs); setTimerRunning(true) }
    } else if (timerRunning) { setTimerRunning(false) }
    else if (timerTime > 0) { setTimerRunning(true) }
  }
  const handleTimerReset = () => { setTimerRunning(false); setTimerTime(0); setTimerFinished(false); setTimerInput({ h:0, m:5, s:0 }) }

  if (timerFinished) {
    return (
      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'100%', gap:24, padding:20 }}>
        <RiTimeLine size={64} color="var(--accent)" />
        <div style={{ fontFamily:'var(--font-display)', fontSize:28, fontWeight:700, color:'var(--accent)', textAlign:'center' }}>{t('clock.timeUp')}</div>
        <button onClick={handleTimerReset} style={{ padding:'14px 32px', borderRadius:10, border:'none', cursor:'pointer', fontFamily:'var(--font-display)', fontSize:14, fontWeight:600, background:'var(--accent)', color:'#fff', transition:'all .15s' }} onMouseEnter={e => e.currentTarget.style.opacity = 0.9} onMouseLeave={e => e.currentTarget.style.opacity = 1}>
          {t('clock.reset')}
        </button>
      </div>
    )
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', overflow:'auto' }}>
      <div style={{ display:'flex', gap:4, padding:'16px', borderBottom:'1px solid var(--border)' }}>
        <button onClick={() => setMode('stopwatch')} style={{ flex:1, padding:'10px', borderRadius:8, border:'none', cursor:'pointer', fontFamily:'var(--font-display)', fontSize:13, fontWeight:600, background: mode === 'stopwatch' ? 'var(--accent)' : 'var(--surface-hover)', color: mode === 'stopwatch' ? '#fff' : 'var(--text-sec)', transition:'all .15s' }}>
          {t('clock.stopwatch')}
        </button>
        <button onClick={() => setMode('timer')} style={{ flex:1, padding:'10px', borderRadius:8, border:'none', cursor:'pointer', fontFamily:'var(--font-display)', fontSize:13, fontWeight:600, background: mode === 'timer' ? 'var(--accent)' : 'var(--surface-hover)', color: mode === 'timer' ? '#fff' : 'var(--text-sec)', transition:'all .15s' }}>
          {t('clock.timer')}
        </button>
      </div>

      <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:24, padding:20, width:'100%' }}>
        {mode === 'stopwatch' ? (
          <>
            <div style={{ textAlign:'center' }}>
              <div style={{ fontFamily:'var(--font-mono)', fontSize:48, fontWeight:300, color:'var(--text-pri)', letterSpacing:-1, lineHeight:1 }}>{formatTime(stopwatchTime, true)}</div>
              <div style={{ fontSize:11, color:'var(--text-ter)', marginTop:8, fontFamily:'var(--font-body)' }}>{t('clock.stopwatchDesc')}</div>
            </div>
            <div style={{ display:'flex', gap:12 }}>
              <button onClick={handleStopwatchReset} disabled={stopwatchTime === 0} style={{ padding:'14px 24px', borderRadius:10, border:'none', cursor:'pointer', fontFamily:'var(--font-display)', fontSize:14, fontWeight:600, background:'var(--surface-hover)', color:'var(--text-sec)', opacity: stopwatchTime === 0 ? 0.5 : 1, transition:'all .15s' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--surface)'} onMouseLeave={e => e.currentTarget.style.background = 'var(--surface-hover)'}>{t('clock.reset')}</button>
              <button onClick={handleStopwatchStart} style={{ padding:'14px 32px', borderRadius:10, border:'none', cursor:'pointer', fontFamily:'var(--font-display)', fontSize:14, fontWeight:600, background:'var(--accent)', color:'#fff', transition:'all .15s' }} onMouseEnter={e => e.currentTarget.style.opacity = 0.9} onMouseLeave={e => e.currentTarget.style.opacity = 1}>{stopwatchRunning ? t('clock.pause') : t('clock.start')}</button>
              <button onClick={handleLap} disabled={!stopwatchRunning || stopwatchTime === 0} style={{ padding:'14px 24px', borderRadius:10, border:'none', cursor:'pointer', fontFamily:'var(--font-display)', fontSize:14, fontWeight:600, background:'var(--surface-hover)', color:'var(--text-sec)', opacity: !stopwatchRunning || stopwatchTime === 0 ? 0.5 : 1, transition:'all .15s' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--surface)'} onMouseLeave={e => e.currentTarget.style.background = 'var(--surface-hover)'}>{t('clock.lap')}</button>
            </div>
            {laps.length > 0 && (<div style={{ width:'100%', maxWidth:400, maxHeight:150, overflow:'auto' }}>
              <div style={{ fontSize:10, fontWeight:600, letterSpacing:1.5, color:'var(--text-ter)', textTransform:'uppercase', marginBottom:8 }}>{t('clock.laps')}</div>
              <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                {laps.map(lap => (<div key={lap.number} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 12px', borderRadius:8, background:'var(--surface)' }}>
                  <span style={{ fontSize:12, color:'var(--text-sec)' }}>#{lap.number}</span>
                  <span style={{ fontFamily:'var(--font-mono)', fontSize:14, color:'var(--text-pri)' }}>{formatTime(lap.time, true)}</span>
                </div>))}
              </div>
            </div>)}
          </>
        ) : (
          <>
            <div style={{ textAlign:'center' }}>
              <div style={{ fontFamily:'var(--font-mono)', fontSize:56, fontWeight:300, color:'var(--text-pri)', letterSpacing:-2, lineHeight:1 }}>{formatTime(timerTime || (timerInput.h * 3600 + timerInput.m * 60 + timerInput.s) * 1000)}</div>
              <div style={{ fontSize:11, color:'var(--text-ter)', marginTop:8, fontFamily:'var(--font-body)' }}>{t('clock.timerDesc')}</div>
            </div>
            {!timerRunning && timerTime === 0 && (<div style={{ display:'flex', gap:8, alignItems:'center' }}>
              <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
                <label style={{ fontSize:10, color:'var(--text-ter)' }}>{t('clock.hours')}</label>
                <input type="number" min="0" max="23" value={timerInput.h} onChange={e => setTimerInput({...timerInput, h: Math.max(0, Math.min(23, parseInt(e.target.value) || 0))})} onKeyDown={e => e.stopPropagation()} style={{ width:60, padding:'10px 8px', borderRadius:8, border:'1px solid var(--border)', background:'var(--surface)', color:'var(--text-pri)', fontFamily:'var(--font-mono)', fontSize:18, textAlign:'center', WebkitAppearance:'none', MozAppearance:'textfield' }} />
              </div>
              <span style={{ fontSize:24, color:'var(--text-ter)', marginTop:16 }}>:</span>
              <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
                <label style={{ fontSize:10, color:'var(--text-ter)' }}>{t('clock.minutes')}</label>
                <input type="number" min="0" max="59" value={timerInput.m} onChange={e => setTimerInput({...timerInput, m: Math.max(0, Math.min(59, parseInt(e.target.value) || 0))})} onKeyDown={e => e.stopPropagation()} style={{ width:60, padding:'10px 8px', borderRadius:8, border:'1px solid var(--border)', background:'var(--surface)', color:'var(--text-pri)', fontFamily:'var(--font-mono)', fontSize:18, textAlign:'center', WebkitAppearance:'none', MozAppearance:'textfield' }} />
              </div>
              <span style={{ fontSize:24, color:'var(--text-ter)', marginTop:16 }}>:</span>
              <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
                <label style={{ fontSize:10, color:'var(--text-ter)' }}>{t('clock.seconds')}</label>
                <input type="number" min="0" max="59" value={timerInput.s} onChange={e => setTimerInput({...timerInput, s: Math.max(0, Math.min(59, parseInt(e.target.value) || 0))})} onKeyDown={e => e.stopPropagation()} style={{ width:60, padding:'10px 8px', borderRadius:8, border:'1px solid var(--border)', background:'var(--surface)', color:'var(--text-pri)', fontFamily:'var(--font-mono)', fontSize:18, textAlign:'center', WebkitAppearance:'none', MozAppearance:'textfield' }} />
              </div>
            </div>)}
            <div style={{ display:'flex', gap:12 }}>
              <button onClick={handleTimerReset} style={{ padding:'14px 24px', borderRadius:10, border:'none', cursor:'pointer', fontFamily:'var(--font-display)', fontSize:14, fontWeight:600, background:'var(--surface-hover)', color:'var(--text-sec)', transition:'all .15s' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--surface)'} onMouseLeave={e => e.currentTarget.style.background = 'var(--surface-hover)'}>{t('clock.reset')}</button>
              <button onClick={handleTimerStart} style={{ padding:'14px 32px', borderRadius:10, border:'none', cursor:'pointer', fontFamily:'var(--font-display)', fontSize:14, fontWeight:600, background:'var(--accent)', color:'#fff', transition:'all .15s' }} onMouseEnter={e => e.currentTarget.style.opacity = 0.9} onMouseLeave={e => e.currentTarget.style.opacity = 1}>{timerRunning ? t('clock.pause') : t('clock.start')}</button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

const SectionLabel = ({ children }) => (
  <div style={{ fontSize:10, fontWeight:600, letterSpacing:1.8, color:'var(--text-ter)', textTransform:'uppercase', padding:'20px 0 10px' }}>
    {children}
  </div>
)

const Divider = () => <div style={{ height:'0.5px', background:'var(--border)', margin:'3px 0' }} />

function Pomodoro() {
  const { t } = useTranslation()
  const STORAGE_KEY = 'clock_pomodoro_state'
  
  const loadState = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) return JSON.parse(saved)
    } catch (e) {}
    return null
  }
  
  const initialState = loadState()
  
  const [mode, setMode] = useState(initialState?.mode || 'work')
  const [timeLeft, setTimeLeft] = useState(initialState?.timeLeft || 25 * 60)
  const [isRunning, setIsRunning] = useState(initialState?.isRunning || false)
  const [startTime, setStartTime] = useState(initialState?.startTime || null)
  
  useEffect(() => {
    if (initialState?.isRunning && initialState?.startTime) {
      const targetEnd = initialState.startTime + (initialState.timeLeft * 1000)
      const remaining = Math.max(0, Math.floor((targetEnd - Date.now()) / 1000))
      setTimeLeft(remaining)
    }
  }, [])
  
  const [sessions, setSessions] = useState(initialState?.sessions || { work: 0, short: 0, long: 0 })
  const [taskName, setTaskName] = useState(initialState?.taskName || '')
  const [customMinutes, setCustomMinutes] = useState(initialState?.customMinutes || 25)
  const [history, setHistory] = useState(initialState?.history || [])
  const [customPomodoros, setCustomPomodoros] = useState(initialState?.customPomodoros || [])
  const [editingTask, setEditingTask] = useState(false)
  const [editingTime, setEditingTime] = useState(false)
  const [newPomodoro, setNewPomodoro] = useState({ name: '', minutes: 25, reps: 1 })
  const [showAddForm, setShowAddForm] = useState(false)
  const [showNotification, setShowNotification] = useState(initialState?.showNotification || false)
  const intervalRef = useRef(null)
  
  useEffect(() => {
    if (startTime && isRunning) {
      const targetEnd = startTime + (timeLeft * 1000)
      const tick = () => {
        const remaining = Math.max(0, Math.floor((targetEnd - Date.now()) / 1000))
        setTimeLeft(remaining)
        if (remaining === 0) {
          clearInterval(intervalRef.current)
          handleTimerComplete()
        }
      }
      tick()
      intervalRef.current = setInterval(tick, 1000)
      return () => clearInterval(intervalRef.current)
    }
  }, [startTime, isRunning])

  const handleTimerComplete = () => {
    setIsRunning(false)
    setShowNotification(true)
    if (mode === 'work') {
      const completedSession = {
        id: Date.now(),
        taskName: taskName || t('clock.pomodoroWork'),
        duration: customMinutes,
        timestamp: new Date().toISOString()
      }
      setHistory(prev => [completedSession, ...prev].slice(0, 10))
      const newSessions = { ...sessions, work: sessions.work + 1 }
      setSessions(newSessions)
      if (newSessions.work % SESSIONS_BEFORE_LONG === 0) {
        setMode('long')
        setTimeLeft(LONG_BREAK)
      } else {
        setMode('short')
        setTimeLeft(SHORT_BREAK)
      }
    } else {
      setMode('work')
      setTimeLeft(customMinutes * 60)
    }
  }

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ mode, timeLeft, isRunning, startTime, sessions, taskName, customMinutes, history, customPomodoros, showNotification }))
  }, [mode, timeLeft, isRunning, startTime, sessions, taskName, customMinutes, history, customPomodoros, showNotification])

  const toggleNotification = () => {
    setShowNotification(!showNotification)
    setShowAddForm(false)
  }

  const WORK_TIME = customMinutes * 60
  const SHORT_BREAK = 5 * 60
  const LONG_BREAK = 15 * 60
  const SESSIONS_BEFORE_LONG = 4

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }

  const handleStartPause = () => {
    if (!isRunning) {
      setIsRunning(true)
      setStartTime(Date.now())
    } else {
      setIsRunning(false)
      setStartTime(null)
    }
  }
  
  const handleReset = () => {
    setIsRunning(false)
    setStartTime(null)
    if (mode === 'work') setTimeLeft(customMinutes * 60)
    else if (mode === 'short') setTimeLeft(SHORT_BREAK)
    else setTimeLeft(LONG_BREAK)
  }

  const handleModeChange = (newMode) => {
    setIsRunning(false)
    setStartTime(null)
    setMode(newMode)
    setEditingTask(false)
    setEditingTime(false)
    if (newMode === 'work') setTimeLeft(customMinutes * 60)
    else if (newMode === 'short') setTimeLeft(SHORT_BREAK)
    else setTimeLeft(LONG_BREAK)
  }

  const handleTimeEdit = (value) => {
    const newMins = Math.max(1, Math.min(180, parseInt(value) || 25))
    setCustomMinutes(newMins)
    if (mode === 'work') setTimeLeft(newMins * 60)
  }

  const loadFromHistory = (item) => {
    setTaskName(item.taskName)
    setCustomMinutes(item.duration)
    setTimeLeft(item.duration * 60)
  }

  const getModeLabel = () => {
    if (mode === 'work') return taskName || t('clock.pomodoroWork')
    if (mode === 'short') return t('clock.pomodoroShortBreak')
    return t('clock.pomodoroLongBreak')
  }

  const getModeColor = () => {
    if (mode === 'work') return 'var(--accent)'
    return '#10b981'
  }

  const isWorkActive = mode === 'work' || showAddForm

  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', height:'100%', gap:16, padding:20, width:'100%', overflow:'auto' }}>
      <div style={{ display:'flex', gap:4, padding:'4px', borderRadius:10, background:'var(--surface)' }}>
        <button 
          onClick={(e) => { 
            e.stopPropagation(); 
            if (showAddForm) {
              setEditingTask(true)
            } else {
              setEditingTask(!editingTask); 
              setEditingTime(false)
            }
          }} 
          style={{ 
            padding:'10px 20px', 
            borderRadius:10, 
            border:'none', 
            cursor:'pointer', 
            fontFamily:'var(--font-display)', 
            fontSize:14, 
            fontWeight:600, 
            background: isWorkActive ? 'var(--accent)' : 'transparent', 
            color: isWorkActive ? '#fff' : 'var(--text-sec)', 
            transition:'all .15s',
            position:'relative',
            display:'flex',
            alignItems:'center',
            gap:8
          }}
        >
          {isWorkActive ? (editingTask ? (
            <input 
              type="text" 
              value={taskName}
              onChange={e => setTaskName(e.target.value)}
              onBlur={() => setEditingTask(false)}
              onKeyDown={e => { e.stopPropagation(); if (e.key === 'Enter') setEditingTask(false) }}
              autoFocus
              style={{
                background:'transparent', border:'none', color:'#fff', fontFamily:'var(--font-display)', 
                fontSize:14, fontWeight:600, width:80, textAlign:'center', outline:'none'
              }}
              placeholder={t('clock.pomodoroWork')}
            />
          ) : (
            <span 
              onClick={(e) => { e.stopPropagation(); setEditingTask(true); setEditingTime(false) }}
              style={{ cursor:'pointer' }}
            >
              {taskName || t('clock.pomodoroWork')}
            </span>
          )) : t('clock.pomodoroWork')}
          <span 
            onClick={(e) => { e.stopPropagation(); setShowAddForm(!showAddForm) }} 
            style={{ 
              marginLeft:4, 
              cursor:'pointer', 
              display:'flex', 
              alignItems:'center', 
              gap:2,
              color: showAddForm ? '#fff' : 'currentColor',
              transition:'color .15s'
            }}
          >
            <RiAddCircleLine size={14} />
          </span>
        </button>
        <button onClick={() => handleModeChange('short')} style={{ padding:'8px 16px', borderRadius:8, border:'none', cursor:'pointer', fontFamily:'var(--font-display)', fontSize:12, fontWeight:600, background: mode === 'short' ? '#10b981' : 'transparent', color: mode === 'short' ? '#fff' : 'var(--text-sec)', transition:'all .15s' }}>
          {t('clock.pomodoroShort')}
        </button>
        <button onClick={() => handleModeChange('long')} style={{ padding:'8px 16px', borderRadius:8, border:'none', cursor:'pointer', fontFamily:'var(--font-display)', fontSize:12, fontWeight:600, background: mode === 'long' ? '#10b981' : 'transparent', color: mode === 'long' ? '#fff' : 'var(--text-sec)', transition:'all .15s' }}>
          {t('clock.pomodoroLong')}
        </button>
      </div>

      <div style={{ textAlign:'center' }}>
        {mode === 'work' && editingTime ? (
          <input 
            type="number" 
            min="1" 
            max="180"
            value={customMinutes}
            onChange={e => handleTimeEdit(e.target.value)}
            onBlur={() => setEditingTime(false)}
            onKeyDown={e => { e.stopPropagation(); if (e.key === 'Enter') setEditingTime(false) }}
            autoFocus
            style={{
              fontFamily:'var(--font-mono)', fontSize:48, fontWeight:300, 
              color:'var(--text-pri)', letterSpacing:-2, lineHeight:1,
              width:120, textAlign:'center', background:'var(--surface)', 
              border:'1px solid var(--accent)', borderRadius:8, padding:'4px',
              outline:'none',
              WebkitAppearance:'none',
              MozAppearance:'textfield',
            }}
          />
        ) : (
          <div 
            onClick={() => mode === 'work' && setEditingTime(true)}
            style={{ 
              fontFamily:'var(--font-mono)', fontSize:64, fontWeight:300, 
              color:'var(--text-pri)', letterSpacing:-2, lineHeight:1,
              cursor: mode === 'work' ? 'pointer' : 'default'
            }}
          >
            {formatTime(timeLeft)}
            {mode === 'work' && <span style={{ fontSize:12, marginLeft:8, opacity:0.5 }}>min</span>}
          </div>
        )}
        <div style={{ fontSize:14, color: getModeColor(), fontWeight:500, marginTop:8 }}>
          {getModeLabel()}
        </div>
      </div>

      <div style={{ display:'flex', gap:12 }}>
        <button onClick={handleReset} style={{ padding:'14px 24px', borderRadius:10, border:'none', cursor:'pointer', fontFamily:'var(--font-display)', fontSize:14, fontWeight:600, background:'var(--surface-hover)', color:'var(--text-sec)', transition:'all .15s' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--surface)'} onMouseLeave={e => e.currentTarget.style.background = 'var(--surface-hover)'}>
          {t('clock.reset')}
        </button>
        <button onClick={handleStartPause} style={{ padding:'14px 32px', borderRadius:10, border:'none', cursor:'pointer', fontFamily:'var(--font-display)', fontSize:14, fontWeight:600, background:'var(--accent)', color:'#fff', transition:'all .15s' }} onMouseEnter={e => e.currentTarget.style.opacity = 0.9} onMouseLeave={e => e.currentTarget.style.opacity = 1}>
          {isRunning ? t('clock.pause') : t('clock.start')}
        </button>
      </div>

      <div style={{ display:'flex', gap:16, marginTop:4 }}>
        <div style={{ textAlign:'center' }}>
          <div style={{ fontSize:20, fontWeight:600, color:'var(--text-pri)' }}>{sessions.work}</div>
          <div style={{ fontSize:10, color:'var(--text-ter)' }}>{t('clock.pomodoroSessions')}</div>
        </div>
        {(showNotification || isRunning) && (
          <button onClick={toggleNotification} style={{ padding:'6px 12px', borderRadius:8, border:'none', cursor:'pointer', background: showNotification ? 'var(--accent)' : 'var(--surface)', color: showNotification ? '#fff' : 'var(--text-ter)', fontSize:12, display:'flex', alignItems:'center', gap:4 }}>
            <RiNotification3Line size={14} />
          </button>
        )}
      </div>

      {showAddForm && (
        <div style={{ width:'100%', padding:16, borderRadius:12, background:'var(--surface)', border:'1px solid var(--border)', animation:'slideDown 0.2s ease-out' }}>
          <style>{`
            @keyframes slideDown {
              from { opacity: 0; transform: translateY(-10px); }
              to { opacity: 1; transform: translateY(0); }
            }
          `}</style>
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            <div>
              <label style={{ fontSize:10, color:'var(--text-ter)', display:'block', marginBottom:4, fontWeight:500 }}>{t('clock.pomodoroName')}</label>
              <input 
                type="text" 
                value={newPomodoro.name} 
                onChange={e => setNewPomodoro({...newPomodoro, name: e.target.value})} 
                onKeyDown={e => e.stopPropagation()}
                placeholder={t('clock.pomodoroWork')}
                style={{ width:'100%', padding:'12px', borderRadius:8, border:'1px solid var(--border)', background:'var(--surface-hover)', color:'var(--text-pri)', fontFamily:'var(--font-body)', fontSize:16 }}
              />
            </div>
            <div style={{ display:'flex', gap:12 }}>
              <div style={{ flex:1 }}>
                <label style={{ fontSize:10, color:'var(--text-ter)', display:'block', marginBottom:4, fontWeight:500 }}>{t('clock.minutes')}</label>
                <input 
                  type="number" 
                  min="1" 
                  max="180"
                  value={newPomodoro.minutes} 
                  onChange={e => setNewPomodoro({...newPomodoro, minutes: Math.max(1, Math.min(180, parseInt(e.target.value) || 25))})} 
                  onKeyDown={e => e.stopPropagation()}
                  style={{ width:'100%', padding:'12px', borderRadius:8, border:'1px solid var(--border)', background:'var(--surface-hover)', color:'var(--text-pri)', fontFamily:'var(--font-mono)', fontSize:16, WebkitAppearance:'none', MozAppearance:'textfield' }}
                />
              </div>
              <div style={{ flex:1 }}>
                <label style={{ fontSize:10, color:'var(--text-ter)', display:'block', marginBottom:4, fontWeight:500 }}>{t('clock.pomodoroRepsLabel')}</label>
                <input 
                  type="number" 
                  min="1" 
                  max="10"
                  value={newPomodoro.reps} 
                  onChange={e => setNewPomodoro({...newPomodoro, reps: Math.max(1, Math.min(10, parseInt(e.target.value) || 1))})} 
                  onKeyDown={e => e.stopPropagation()}
                  style={{ width:'100%', padding:'12px', borderRadius:8, border:'1px solid var(--border)', background:'var(--surface-hover)', color:'var(--text-pri)', fontFamily:'var(--font-mono)', fontSize:16, WebkitAppearance:'none', MozAppearance:'textfield' }}
                />
              </div>
            </div>
            <button 
              onClick={() => {
                if (newPomodoro.name && newPomodoro.minutes > 0) {
                  setCustomPomodoros([...customPomodoros, { ...newPomodoro, id: Date.now() }])
                  setNewPomodoro({ name: '', minutes: 25, reps: 1 })
                  setShowAddForm(false)
                }
              }} 
              style={{ width:'100%', padding:'10px 20px', borderRadius:8, border:'none', cursor:'pointer', fontFamily:'var(--font-body)', fontSize:13, fontWeight:600, background:'var(--accent)', color:'#fff' }}
            >
              {t('clock.pomodoroSave')}
            </button>
          </div>
        </div>
      )}

      {customPomodoros.length > 0 && (
        <div style={{ width:'100%', marginTop:16 }}>
          <div style={{ fontSize:10, fontWeight:600, color:'var(--text-ter)', textTransform:'uppercase', letterSpacing:1, marginBottom:8 }}>
            {t('clock.pomodoroCustom')}
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
            {customPomodoros.map((p) => (
              <div 
                key={p.id}
                onClick={() => { setTaskName(p.name); setCustomMinutes(p.minutes); setTimeLeft(p.minutes * 60); setMode('work'); setShowAddForm(false) }}
                style={{
                  display:'flex', justifyContent:'space-between', alignItems:'center',
                  padding:'10px 12px', borderRadius:8, background:'var(--surface)',
                  border:'1px solid var(--border)', cursor:'pointer', transition:'all .15s'
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
              >
                <div>
                  <div style={{ fontSize:13, fontWeight:500, color:'var(--text-pri)' }}>{p.name}</div>
                  <div style={{ fontSize:11, color:'var(--text-ter)' }}>{p.minutes} min × {p.reps} {t('clock.pomodoroReps')}</div>
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); setCustomPomodoros(customPomodoros.filter(pm => pm.id !== p.id)) }} 
                  style={{ padding:'4px 8px', borderRadius:6, border:'none', cursor:'pointer', background:'transparent', color:'var(--text-ter)', fontSize:12 }}
                >
                  <RiDeleteBinLine size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {history.length > 0 && (
        <div style={{ width:'100%', marginTop:16 }}>
          <div style={{ fontSize:10, fontWeight:600, color:'var(--text-ter)', textTransform:'uppercase', letterSpacing:1, marginBottom:8 }}>
            {t('clock.pomodoroHistory')}
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
            {history.map((item) => (
              <div 
                key={item.id}
                onClick={() => loadFromHistory(item)}
                style={{
                  display:'flex', justifyContent:'space-between', alignItems:'center',
                  padding:'10px 12px', borderRadius:8, background:'var(--surface)',
                  border:'1px solid var(--border)', cursor:'pointer', transition:'all .15s'
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
              >
                <div>
                  <div style={{ fontSize:13, fontWeight:500, color:'var(--text-pri)' }}>{item.taskName}</div>
                  <div style={{ fontSize:11, color:'var(--text-ter)' }}>{new Date(item.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</div>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <div style={{ fontSize:13, color:'var(--accent)', fontWeight:500 }}>
                    {item.duration} min
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setHistory(history.filter(h => h.id !== item.id)) }}
                    style={{ padding:4, borderRadius:4, border:'none', cursor:'pointer', background:'transparent', color:'var(--text-ter)' }}
                  >
                    <RiCloseLine size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
        function Calendar({ now }) {
  const { t, i18n } = useTranslation()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [holidays, setHolidays] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedCountry, setSelectedCountry] = useState('BR')

  const countries = [
    { code: 'BR', name: 'Brasil', flag: '🇧🇷' },
    { code: 'US', name: 'United States', flag: '🇺🇸' },
    { code: 'ES', name: 'España', flag: '🇪🇸' },
    { code: 'FR', name: 'France', flag: '🇫🇷' },
  ]

  const getDaysInMonth = (date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDay = firstDay.getDay()
    
    const days = []
    for (let i = 0; i < startingDay; i++) {
      days.push(null)
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i)
    }
    return days
  }

  const weekDays = [t('clock.weekdaySun'), t('clock.weekdayMon'), t('clock.weekdayTue'), t('clock.weekdayWed'), t('clock.weekdayThu'), t('clock.weekdayFri'), t('clock.weekdaySat')]
  const dayNames = [t('clock.daySunday'), t('clock.dayMonday'), t('clock.dayTuesday'), t('clock.dayWednesday'), t('clock.dayThursday'), t('clock.dayFriday'), t('clock.daySaturday')]
  const monthNames = [t('clock.monthJan'), t('clock.monthFeb'), t('clock.monthMar'), t('clock.monthApr'), t('clock.monthMay'), t('clock.monthJun'), t('clock.monthJul'), t('clock.monthAug'), t('clock.monthSep'), t('clock.monthOct'), t('clock.monthNov'), t('clock.monthDec')]

  const fetchHolidays = useCallback(async () => {
    const year = currentDate.getFullYear()
    setLoading(true)
    
    try {
      const response = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/${selectedCountry}`)
      if (response.ok) {
        const data = await response.json()
        const monthHolidays = data.filter(h => {
          const hDate = new Date(h.date)
          return hDate.getMonth() === currentDate.getMonth() && hDate.getFullYear() === currentDate.getFullYear()
        })
        setHolidays(monthHolidays)
      } else {
        setHolidays([])
      }
    } catch (error) {
      console.error('Error fetching holidays:', error)
      setHolidays([])
    }
    setLoading(false)
  }, [currentDate, selectedCountry])

  useEffect(() => {
    fetchHolidays()
  }, [fetchHolidays])

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const getHolidaysForDay = (day) => {
    if (!day) return []
    return holidays.filter(h => {
      const hDate = new Date(h.date)
      return hDate.getDate() === day && hDate.getMonth() === currentDate.getMonth()
    })
  }

  const isToday = (day) => {
    return day === now.getDate() && 
           currentDate.getMonth() === now.getMonth() && 
           currentDate.getFullYear() === now.getFullYear()
  }

  const days = getDaysInMonth(currentDate)
  const today = now.getDate()
  const isCurrentMonth = currentDate.getMonth() === now.getMonth() && currentDate.getFullYear() === now.getFullYear()

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', overflow:'auto', padding:20 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:16 }}>
        <div>
          <div style={{ fontFamily:'var(--font-display)', fontSize:28, fontWeight:600, color:'var(--text-pri)' }}>
            {dayNames[now.getDay()]}
          </div>
          <div style={{ fontSize:14, color:'var(--text-ter)' }}>
            {monthNames[now.getMonth()]} {now.getDate()}, {now.getFullYear()}
          </div>
        </div>
        <select 
          value={selectedCountry}
          onChange={e => setSelectedCountry(e.target.value)}
          style={{
            padding:'6px 10px', borderRadius:8, border:'1px solid var(--border)',
            background:'var(--surface)', color:'var(--text-pri)', fontFamily:'var(--font-body)', fontSize:12,
          }}
        >
          {countries.map(c => (
            <option key={c.code} value={c.code}>{c.flag} {c.name}</option>
          ))}
        </select>
      </div>

      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
        <button onClick={handlePrevMonth} style={{ padding:'8px 12px', borderRadius:8, border:'none', cursor:'pointer', background:'var(--surface)', color:'var(--text-sec)', fontSize:18 }}>‹</button>
        <div style={{ fontFamily:'var(--font-display)', fontSize:16, fontWeight:600, color:'var(--text-pri)' }}>
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </div>
        <button onClick={handleNextMonth} style={{ padding:'8px 12px', borderRadius:8, border:'none', cursor:'pointer', background:'var(--surface)', color:'var(--text-sec)', fontSize:18 }}>›</button>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(7, 1fr)', gap:4, marginBottom:8 }}>
        {weekDays.map((day, i) => (
          <div key={i} style={{ textAlign:'center', fontSize:11, fontWeight:600, color:'var(--text-ter)', padding:'8px 0' }}>
            {day}
          </div>
        ))}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(7, 1fr)', gap:4 }}>
        {days.map((day, index) => {
          const dayHolidays = getHolidaysForDay(day)
          const isTodayDay = day === today && isCurrentMonth
          const hasHoliday = dayHolidays.length > 0
          return (
            <div 
              key={index}
              style={{ 
                aspectRatio:'1', 
                display:'flex', 
                flexDirection:'column',
                alignItems:'center', 
                justifyContent:'center',
                borderRadius:8,
                background: isTodayDay ? 'var(--accent)' : hasHoliday ? 'rgba(251,191,36,0.15)' : 'var(--surface)',
                border: hasHoliday ? '1px solid rgba(251,191,36,0.3)' : '1px solid transparent',
                color: day ? (isTodayDay ? '#fff' : 'var(--text-pri)') : 'transparent',
                fontFamily:'var(--font-display)',
                fontSize:13,
                fontWeight: day ? 500 : 0,
                cursor: day ? 'pointer' : 'default',
                position:'relative',
              }}
            >
              {day}
              {hasHoliday && !isTodayDay && (
                <div style={{ position:'absolute', bottom:2, width:4, height:4, borderRadius:'50%', background:'#fbbf24' }} />
              )}
            </div>
          )
        })}
      </div>

      <div style={{ marginTop:24, padding:16, borderRadius:12, background:'var(--surface)', border:'1px solid var(--border)' }}>
        <div style={{ fontSize:12, fontWeight:600, color:'var(--text-ter)', marginBottom:12, textTransform:'uppercase', letterSpacing:1 }}>
          {t('clock.calendarEvents')}
        </div>
        {loading ? (
          <div style={{ fontSize:13, color:'var(--text-sec)', textAlign:'center', padding:'12px 0' }}>
            {t('clock.loading') || 'Loading...'}
          </div>
        ) : holidays.length === 0 ? (
          <div style={{ fontSize:13, color:'var(--text-sec)', textAlign:'center', padding:'12px 0' }}>
            {t('clock.calendarNoEvents')}
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {holidays.map((holiday, index) => (
              <div key={index} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 12px', borderRadius:8, background:'rgba(251,191,36,0.1)' }}>
                <div>
                  <div style={{ fontSize:13, fontWeight:500, color:'var(--text-pri)' }}>{holiday.localName}</div>
                  <div style={{ fontSize:11, color:'var(--text-ter)' }}>{holiday.name}</div>
                </div>
                <div style={{ fontSize:12, color:'var(--text-sec)', fontFamily:'var(--font-mono)' }}>
                  {new Date(holiday.date).getDate()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

const STORAGE_KEY_ALARM = 'clock_alarms'

function Alarm() {
  const { t } = useTranslation()
  const [alarms, setAlarms] = useState([])
  const [newAlarm, setNewAlarm] = useState({ h:7, m:0, label:'', days:[0,1,2,3,4,5,6] })
  const [showForm, setShowForm] = useState(false)
  const [soundingAlarm, setSoundingAlarm] = useState(null)
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_ALARM, JSON.stringify(alarms))
  }, [alarms])

  useEffect(() => {
    const id = setInterval(() => {
      const current = new Date()
      setNow(current)
      
      alarms.forEach(alarm => {
        if (alarm.enabled && alarm.h === current.getHours() && alarm.m === current.getMinutes() && current.getSeconds() === 0) {
          setSoundingAlarm(alarm.id)
        }
      })
    }, 1000)
    return () => clearInterval(id)
  }, [alarms])

  const weekdays = [
    { key: 'sun', label: t('clock.weekdaySun'), day: 0 },
    { key: 'mon', label: t('clock.weekdayMon'), day: 1 },
    { key: 'tue', label: t('clock.weekdayTue'), day: 2 },
    { key: 'wed', label: t('clock.weekdayWed'), day: 3 },
    { key: 'thu', label: t('clock.weekdayThu'), day: 4 },
    { key: 'fri', label: t('clock.weekdayFri'), day: 5 },
    { key: 'sat', label: t('clock.weekdaySat'), day: 6 },
  ]

  const toggleDay = (day) => {
    setNewAlarm(prev => {
      if (prev.days.includes(day)) {
        if (prev.days.length === 1) return prev
        return { ...prev, days: prev.days.filter(d => d !== day) }
      }
      return { ...prev, days: [...prev.days, day].sort() }
    })
  }

  const adjustTime = (type, delta) => {
    setNewAlarm(prev => {
      if (type === 'h') {
        const newH = (prev.h + delta + 24) % 24
        return { ...prev, h: newH }
      } else {
        const newM = (prev.m + delta + 60) % 60
        return { ...prev, m: newM }
      }
    })
  }

  const handleAddAlarm = () => {
    if (newAlarm.h !== '' && newAlarm.m !== '' && newAlarm.days.length > 0) {
      setAlarms(prev => [...prev, {
        id: Date.now(),
        h: parseInt(newAlarm.h),
        m: parseInt(newAlarm.m),
        label: newAlarm.label,
        enabled: true,
        days: newAlarm.days
      }])
      setNewAlarm({ h:7, m:0, label:'', days:[0,1,2,3,4,5,6] })
      setShowForm(false)
    }
  }

  const handleToggleAlarm = (id) => {
    setAlarms(prev => prev.map(a => a.id === id ? { ...a, enabled: !a.enabled } : a))
  }

  const handleDeleteAlarm = (id) => {
    setAlarms(prev => prev.filter(a => a.id !== id))
    if (soundingAlarm === id) {
      setSoundingAlarm(null)
    }
  }

  const handleStopAlarm = () => {
    setSoundingAlarm(null)
  }

  const pad = n => String(n).padStart(2, '0')
  const sortedAlarms = [...alarms].sort((a, b) => a.h * 60 + a.m - (b.h * 60 + b.m))

  const getNextAlarmDay = (days) => {
    const today = new Date().getDay()
    for (let i = 0; i < 7; i++) {
      const day = (today + i) % 7
      if (days.includes(day)) {
        return weekdays.find(w => w.day === day)?.label || ''
      }
    }
    return ''
  }

  const formatDays = (days) => {
    if (days.length === 7) return t('clock.everyDay')
    if (days.length === 5 && !days.includes(0) && !days.includes(6)) return t('clock.weekdays')
    if (days.length === 2 && days.includes(0) && days.includes(6)) return t('clock.weekends')
    return days.map(d => weekdays.find(w => w.day === d)?.label || '').join(', ')
  }

  return (
    <div style={{ height:'100%', overflowY:'auto', scrollbarWidth:'thin' }}>
      {soundingAlarm && (
        <div style={{
          position:'fixed', top:0, left:0, right:0, bottom:0, zIndex:1000,
          display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
          background:'rgba(0,0,0,0.85)',
        }} onClick={handleStopAlarm}>
          <RiAlarmWarningLine size={64} color="var(--accent)" style={{ animation:'shake 0.5s infinite' }} />
          <div style={{ fontFamily:'var(--font-display)', fontSize:28, fontWeight:700, color:'var(--accent)', marginTop:20 }}>
            {t('clock.alarmSounding')}
          </div>
          <button onClick={handleStopAlarm} style={{
            marginTop:20, padding:'14px 32px', borderRadius:8, border:'none',
            fontFamily:'var(--font-display)', fontSize:14, fontWeight:600,
            background:'var(--accent)', color:'#fff',
            transition:'all .15s',
          }} onMouseEnter={e => e.currentTarget.style.opacity = 0.9} onMouseLeave={e => e.currentTarget.style.opacity = 1}>
            {t('clock.stop')}
          </button>
        </div>
      )}

      <div style={{ padding:'20px 20px 8px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ fontSize:12, fontWeight:600, color:'var(--text-ter)', textTransform:'uppercase', letterSpacing:1.5 }}>
          {t('clock.alarm')}
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          style={{
            width:40, height:40, borderRadius:12, border:'none',
            background: showForm ? 'var(--accent)' : 'var(--surface)',
            color: showForm ? '#fff' : 'var(--text-sec)',
            cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center',
            transition:'all .2s',
          }}
        >
          <RiAddCircleLine size={22} />
        </button>
      </div>

      {showForm && (
        <motion.div 
          initial={{ opacity:0, y:-10 }}
          animate={{ opacity:1, y:0 }}
          exit={{ opacity:0, y:-10 }}
          style={{ padding:'0 20px 20px', overflow:'hidden' }}
        >
          <div style={{
            padding:24, borderRadius:20, background:'var(--surface)',
            border:'1px solid var(--border)',
          }}>
            <div style={{ marginBottom:24 }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:16, marginBottom:8 }}>
                <div style={{ display:'flex', flexDirection:'column', alignItems:'center' }}>
                  <button 
                    onClick={() => adjustTime('h', 1)}
                    style={{ width:56, height:36, borderRadius:10, border:'1px solid var(--border)', background:'var(--surface-hover)', color:'var(--text-sec)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', transition:'all .15s' }}
                    onMouseDown={e => e.currentTarget.style.background = 'var(--accent)'}
                    onMouseUp={e => e.currentTarget.style.background = 'var(--surface-hover)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'var(--surface-hover)'}
                  >
                    <RiAddCircleLine size={18} />
                  </button>
                  <div style={{ 
                    fontFamily:'var(--font-mono)', fontSize:48, fontWeight:300, 
                    color:'var(--text-pri)', letterSpacing:-2, lineHeight:1, padding:'12px 0',
                    minWidth:80, textAlign:'center'
                  }}>
                    {pad(newAlarm.h)}
                  </div>
                  <button 
                    onClick={() => adjustTime('h', -1)}
                    style={{ width:56, height:36, borderRadius:10, border:'1px solid var(--border)', background:'var(--surface-hover)', color:'var(--text-sec)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', transition:'all .15s' }}
                    onMouseDown={e => e.currentTarget.style.background = 'var(--accent)'}
                    onMouseUp={e => e.currentTarget.style.background = 'var(--surface-hover)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'var(--surface-hover)'}
                  >
                    <RiSubtractLine size={18} />
                  </button>
                </div>

                <span style={{ fontSize:40, color:'var(--text-ter)', fontWeight:200, marginTop:-24 }}>:</span>

                <div style={{ display:'flex', flexDirection:'column', alignItems:'center' }}>
                  <button 
                    onClick={() => adjustTime('m', 1)}
                    style={{ width:56, height:36, borderRadius:10, border:'1px solid var(--border)', background:'var(--surface-hover)', color:'var(--text-sec)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', transition:'all .15s' }}
                    onMouseDown={e => e.currentTarget.style.background = 'var(--accent)'}
                    onMouseUp={e => e.currentTarget.style.background = 'var(--surface-hover)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'var(--surface-hover)'}
                  >
                    <RiAddCircleLine size={18} />
                  </button>
                  <div style={{ 
                    fontFamily:'var(--font-mono)', fontSize:48, fontWeight:300, 
                    color:'var(--text-pri)', letterSpacing:-2, lineHeight:1, padding:'12px 0',
                    minWidth:80, textAlign:'center'
                  }}>
                    {pad(newAlarm.m)}
                  </div>
                  <button 
                    onClick={() => adjustTime('m', -1)}
                    style={{ width:56, height:36, borderRadius:10, border:'1px solid var(--border)', background:'var(--surface-hover)', color:'var(--text-sec)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', transition:'all .15s' }}
                    onMouseDown={e => e.currentTarget.style.background = 'var(--accent)'}
                    onMouseUp={e => e.currentTarget.style.background = 'var(--surface-hover)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'var(--surface-hover)'}
                  >
                    <RiSubtractLine size={18} />
                  </button>
                </div>
              </div>
            </div>

            <div style={{ marginBottom:20 }}>
              <div style={{ fontSize:11, fontWeight:600, color:'var(--text-ter)', textTransform:'uppercase', letterSpacing:1, marginBottom:10, textAlign:'center' }}>
                {t('clock.repeat')}
              </div>
              <div style={{ display:'flex', justifyContent:'center', gap:6 }}>
                {weekdays.map(({ key, label, day }) => (
                  <button
                    key={key}
                    onClick={() => toggleDay(day)}
                    style={{
                      width:40, height:40, borderRadius:'50%', border:'none',
                      background: newAlarm.days.includes(day) ? 'var(--accent)' : 'var(--surface-hover)',
                      color: newAlarm.days.includes(day) ? '#fff' : 'var(--text-ter)',
                      cursor:'pointer', fontSize:12, fontWeight:600,
                      transition:'all .2s',
                      boxShadow: newAlarm.days.includes(day) ? `0 2px 8px ${getComputedStyle(document.documentElement).getPropertyValue('--accent')}40` : 'none',
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            
            <input 
              type="text" 
              placeholder={t('clock.alarmName')} 
              value={newAlarm.label} 
              onChange={e => setNewAlarm({...newAlarm, label: e.target.value})} 
              onKeyDown={e => e.stopPropagation()}
              style={{
                width:'100%', padding:'14px 16px', borderRadius:12, border:'1px solid var(--border)',
                background:'var(--surface-hover)', color:'var(--text-pri)', fontFamily:'var(--font-body)', fontSize:15,
                transition:'all .15s', marginBottom:16, boxSizing:'border-box',
              }}
            />

            <button 
              onClick={handleAddAlarm} 
              style={{
                width:'100%', padding:'14px 20px', borderRadius:12, border:'none', cursor:'pointer',
                fontFamily:'var(--font-display)', fontSize:14, fontWeight:600,
                background:'var(--accent)', color:'#fff',
                transition:'all .15s',
              }} 
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'} 
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              {t('clock.addAlarm')}
            </button>
          </div>
        </motion.div>
      )}
      
      {sortedAlarms.length === 0 ? (
        <div style={{
          padding:'60px 40px', textAlign:'center',
        }}>
          <div style={{ 
            width:80, height:80, borderRadius:'50%', background:'var(--surface)',
            display:'flex', alignItems:'center', justifyContent:'center',
            margin:'0 auto 16px', border:'1px solid var(--border)'
          }}>
            <RiAlarmLine size={32} color="var(--text-ter)" />
          </div>
          <div style={{ fontSize:15, fontWeight:500, color:'var(--text-pri)', marginBottom:6 }}>
            {t('clock.noAlarms')}
          </div>
          <div style={{ fontSize:13, color:'var(--text-ter)' }}>
            {t('clock.tapToCreateAlarm')}
          </div>
        </div>
      ) : (
        <div style={{ padding:'8px 20px 48px', display:'flex', flexDirection:'column', gap:8 }}>
          {sortedAlarms.map(alarm => (
            <motion.div 
              key={alarm.id} 
              initial={{ opacity:0, x:-20 }}
              animate={{ opacity:1, x:0 }}
              exit={{ opacity:0, x:20 }}
              layout
              style={{
                display:'flex', alignItems:'center', gap:16, padding:'16px 20px',
                borderRadius:16, background:'var(--surface)', 
                border:`1px solid ${alarm.enabled ? 'rgba(96,165,250,0.2)' : 'var(--border)'}`,
                transition:'all .2s',
              }}
            >
              <button 
                onClick={() => handleToggleAlarm(alarm.id)} 
                style={{
                  width:52, height:28, borderRadius:14, border:'none', cursor:'pointer',
                  background: alarm.enabled ? 'var(--accent)' : 'rgba(255,255,255,0.1)',
                  position:'relative', transition:'all .3s', flexShrink:0,
                  boxShadow: alarm.enabled ? `0 2px 8px ${getComputedStyle(document.documentElement).getPropertyValue('--accent')}50` : 'none',
                }}
              >
                <div style={{
                  width:22, height:22, borderRadius:'50%', background:'#fff',
                  position:'absolute', top:3,
                  left: alarm.enabled ? 27 : 3,
                  transition:'all .3s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
                  boxShadow:'0 2px 4px rgba(0,0,0,0.2)',
                }} />
              </button>
              
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ 
                  fontFamily:'var(--font-mono)', fontSize:28, fontWeight:300, 
                  color: alarm.enabled ? 'var(--text-pri)' : 'var(--text-ter)',
                  letterSpacing:-1, lineHeight:1.2,
                  opacity: alarm.enabled ? 1 : 0.6,
                }}>
                  {pad(alarm.h)}:{pad(alarm.m)}
                </div>
                <div style={{ fontSize:12, color:'var(--text-ter)', marginTop:4 }}>
                  {formatDays(alarm.days)}
                </div>
                {alarm.label && (
                  <div style={{ fontSize:12, color:'var(--accent)', marginTop:2, fontWeight:500 }}>
                    {alarm.label}
                  </div>
                )}
              </div>
              
              <button 
                onClick={() => handleDeleteAlarm(alarm.id)} 
                style={{
                  width:36, height:36, borderRadius:'50%', border:'none', cursor:'pointer',
                  background:'transparent', color:'var(--text-ter)', 
                  display:'flex', alignItems:'center', justifyContent:'center',
                  transition:'all .15s', flexShrink:0,
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(239,68,68,0.1)'
                  e.currentTarget.style.color = '#ef4444'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.color = 'var(--text-ter)'
                }}
              >
                <RiDeleteBinLine size={18} />
              </button>
            </motion.div>
          ))}
        </div>
      )}

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }
      `}</style>
    </div>
  )
}

function Compass({ period }) {
  const { t } = useTranslation()
  const [heading, setHeading] = useState(0)
  const [status, setStatus] = useState('pending')
  const [error, setError] = useState(null)
  const [useSimulated, setUseSimulated] = useState(false)

  const isIOS = typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function'

  const requestPermission = useCallback(async () => {
    setStatus('requesting')
    setError(null)
    
    try {
      if (isIOS) {
        const permission = await DeviceOrientationEvent.requestPermission()
        if (permission === 'granted') {
          setStatus('granted')
        } else {
          setStatus('denied')
          setError('Permission denied')
        }
      } else {
        if ('DeviceOrientationEvent' in window) {
          setStatus('granted')
        } else {
          setStatus('unavailable')
          setError(t('clock.compassUnavailable'))
        }
      }
    } catch (e) {
      setStatus('error')
      setError(e.message || 'Error requesting permission')
    }
  }, [isIOS, t])

  const useSimulatedCompass = useCallback(() => {
    setUseSimulated(true)
    setStatus('granted')
  }, [])

  useEffect(() => {
    if (status !== 'granted') return

    if (useSimulated) {
      const updateSimulatedHeading = () => {
        const now = new Date()
        const hours = now.getHours() + now.getMinutes() / 60
        const sunrise = 6
        const sunset = 18
        const dayProgress = (hours - sunrise) / (sunset - sunrise)
        
        if (hours >= sunrise && hours <= sunset) {
          const sunAngle = (dayProgress - 0.5) * 180
          setHeading(sunAngle)
        } else {
          setHeading(180)
        }
      }
      
      updateSimulatedHeading()
      const interval = setInterval(updateSimulatedHeading, 60000)
      return () => clearInterval(interval)
    }

    const handleOrientation = (event) => {
      if (event.alpha !== null) {
        setHeading(event.alpha)
      }
    }

    window.addEventListener('deviceorientation', handleOrientation)
    return () => window.removeEventListener('deviceorientation', handleOrientation)
  }, [status, useSimulated])

  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']
  const getDirection = (deg) => directions[Math.round(deg / 45) % 8]

  const isLoading = status === 'pending' || status === 'requesting'

  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'100%', gap:32, padding:20, width:'100%' }}>
      {isLoading ? (
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:16, textAlign:'center' }}>
          <RiCompassDiscoverLine size={48} color="var(--text-ter)" />
          <div style={{ fontSize:14, color:'var(--text-sec)', fontFamily:'var(--font-body)' }}>
            {t('clock.compassPermission')}
          </div>
          <button onClick={requestPermission} disabled={status === 'requesting'} style={{
            padding:'12px 24px', borderRadius:10, border:'none', cursor: status === 'requesting' ? 'wait' : 'pointer',
            fontFamily:'var(--font-display)', fontSize:14, fontWeight:600,
            background: status === 'requesting' ? 'var(--surface-hover)' : 'var(--accent)',
            color: status === 'requesting' ? 'var(--text-ter)' : '#fff', 
            transition:'all .15s',
          }}>
            {status === 'requesting' ? '...' : t('clock.enableCompass')}
          </button>
        </div>
      ) : status === 'unavailable' || status === 'error' || status === 'denied' ? (
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:16, textAlign:'center' }}>
          <RiCompassDiscoverLine size={48} color="var(--text-ter)" />
          <div style={{ fontSize:14, color:'var(--text-sec)', fontFamily:'var(--font-body)' }}>
            {error || t('clock.compassUnavailable')}
          </div>
          <div style={{ display:'flex', gap:12, flexWrap:'wrap', justifyContent:'center' }}>
            {status !== 'unavailable' && (
              <button onClick={requestPermission} style={{
                padding:'12px 24px', borderRadius:10, border:'none', cursor:'pointer',
                fontFamily:'var(--font-display)', fontSize:14, fontWeight:600,
                background:'var(--accent)', color:'#fff', transition:'all .15s',
              }}>
                {t('clock.tryAgain')}
              </button>
            )}
            <button onClick={useSimulatedCompass} style={{
              padding:'12px 24px', borderRadius:10, border:'1px solid var(--border)', cursor:'pointer',
              fontFamily:'var(--font-display)', fontSize:14, fontWeight:600,
              background:'var(--surface)', color:'var(--text-sec)', transition:'all .15s',
            }}>
              {t('clock.useSimulated')}
            </button>
          </div>
        </div>
      ) : (
        <>
          <div style={{ position:'relative', width:200, height:200 }}>
            <svg viewBox="0 0 200 200" style={{ width:'100%', height:'100%', transform:`rotate(${-heading}deg)` }}>
              <defs>
                <linearGradient id="gradN" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor={period.accent} />
                  <stop offset="100%" stopColor="var(--border)" />
                </linearGradient>
              </defs>
              <circle cx="100" cy="100" r="95" fill="none" stroke="var(--border)" strokeWidth="1" />
              <circle cx="100" cy="100" r="80" fill="none" stroke="var(--border)" strokeWidth="0.5" />
              <circle cx="100" cy="100" r="60" fill="none" stroke="var(--border)" strokeWidth="0.5" />
              
              {Array.from({ length: 36 }).map((_, i) => {
                const angle = i * 10 - 90
                const rad = angle * Math.PI / 180
                const innerR = i % 3 === 0 ? 70 : 80
                const x1 = 100 + innerR * Math.cos(rad)
                const y1 = 100 + innerR * Math.sin(rad)
                const x2 = 100 + 85 * Math.cos(rad)
                const y2 = 100 + 85 * Math.sin(rad)
                return (
                  <line 
                    key={i} 
                    x1={x1} y1={y1} x2={x2} y2={y2}
                    stroke={i % 9 === 0 ? period.accent : 'var(--border)'}
                    strokeWidth={i % 9 === 0 ? 2 : i % 3 === 0 ? 1.5 : 1}
                  />
                )
              })}
              
              <polygon points="100,25 108,100 100,90 92,100" fill={period.accent} />
              <polygon points="100,175 108,100 100,110 92,100" fill="var(--text-ter)" />
              
              <text x="100" y="18" textAnchor="middle" fill={period.accent} fontSize="14" fontWeight="600" fontFamily="var(--font-display)">N</text>
              <text x="100" y="195" textAnchor="middle" fill="var(--text-ter)" fontSize="12" fontFamily="var(--font-display)">S</text>
              <text x="185" y="105" textAnchor="middle" fill="var(--text-ter)" fontSize="12" fontFamily="var(--font-display)">E</text>
              <text x="23" y="105" textAnchor="middle" fill="var(--text-ter)" fontSize="12" fontFamily="var(--font-display)">W</text>
            </svg>
            
            <div style={{
              position:'absolute', top:8, left:'50%', transform:'translateX(-50%)',
              width:3, height:20, background:period.accent, borderRadius:2,
            }} />
          </div>

          <div style={{ textAlign:'center' }}>
            <div style={{ fontFamily:'var(--font-mono)', fontSize:48, fontWeight:300, color:'var(--text-pri)', letterSpacing:-1, lineHeight:1 }}>
              {Math.round(heading)}°
            </div>
            <div style={{ fontSize:18, color:period.accent, fontWeight:500, marginTop:4 }}>
              {getDirection(heading)}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default function ClockApp({ onClose, isSplitMode }) {
  const { t } = useTranslation()
  const { period } = useTheme()
  const [activeTab, setActiveTab] = useState('worldClock')
  const [tabsOrder, setTabsOrder] = useState(() => {
    const saved = localStorage.getItem('clockTabsOrder')
    return saved ? JSON.parse(saved) : ['worldClock', 'pomodoro', 'calendar', 'alarm', 'compass']
  })
  const [draggedIndex, setDraggedIndex] = useState(null)
  const [now, setNow] = useState(new Date())

  useEffect(() => { const id = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(id) }, [])

  const tabIcons = {
    worldClock: RiGlobalLine,
    pomodoro: RiFireLine,
    calendar: RiCalendarLine,
    alarm: RiAlarmLine,
    compass: RiCompassDiscoverLine,
  }

  const handleDragStart = (e, index) => {
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = 'move'
    e.currentTarget.style.opacity = '0.5'
  }

  const handleDragEnd = (e) => {
    e.currentTarget.style.opacity = '1'
    setDraggedIndex(null)
  }

  const handleDragOver = (e, index) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === index) return
    
    const newTabs = [...tabsOrder]
    const [draggedTab] = newTabs.splice(draggedIndex, 1)
    newTabs.splice(index, 0, draggedTab)
    setTabsOrder(newTabs)
    setDraggedIndex(index)
  }

  const handleDrop = (e, index) => {
    e.preventDefault()
    if (draggedIndex !== null && draggedIndex !== index) {
      const newTabs = [...tabsOrder]
      const [draggedTab] = newTabs.splice(draggedIndex, 1)
      newTabs.splice(index, 0, draggedTab)
      setTabsOrder(newTabs)
      localStorage.setItem('clockTabsOrder', JSON.stringify(newTabs))
    }
    setDraggedIndex(null)
  }

  const handleClick = (tab) => {
    if (draggedIndex === null) {
      setActiveTab(tab)
    }
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%' }}>
      <div style={{ display:'flex', alignItems:'center', gap:8, padding:'6px 20px', borderBottom:'1px solid var(--border)', background:'var(--surface)', overflowX:'auto' }}>
        {!isSplitMode && (
          <button 
            onClick={onClose}
            style={{
              width:28, height:28, borderRadius:7, border:'1px solid var(--border)',
              background:'var(--surface)', cursor:'pointer', color:'var(--text-sec)',
              display:'flex', alignItems:'center', justifyContent:'center',
              transition:'all .12s', flexShrink:0,
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface-hover)'; e.currentTarget.style.borderColor = 'var(--accent)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--surface)'; e.currentTarget.style.borderColor = 'var(--border)' }}
          >
            <RiCloseLine size={14} />
          </button>
        )}
        
        <div style={{ display:'flex', gap:4 }}>
          {tabsOrder.map((tab, index) => {
            const Icon = tabIcons[tab]
            const isActive = activeTab === tab
            const isDragging = draggedIndex === index
            
            return (
              <div
                key={tab}
                draggable="true"
                onDragStart={(e) => handleDragStart(e, index)}
                onDragEnd={handleDragEnd}
                onDragOver={(e) => handleDragOver(e, index)}
                onDrop={(e) => handleDrop(e, index)}
                onClick={() => handleClick(tab)}
                style={{
                  width:36,
                  height:36,
                  borderRadius:10,
                  border:`1px solid ${isDragging ? 'var(--accent)' : isActive ? 'var(--accent)' : 'transparent'}`,
                  cursor: isDragging ? 'grabbing' : 'grab',
                  background: isActive ? 'var(--accent)' : isDragging ? 'var(--surface-hover)' : 'transparent',
                  display:'flex',
                  alignItems:'center',
                  justifyContent:'center',
                  transition:'all .15s',
                  userSelect:'none',
                  transform: isDragging ? 'scale(0.9)' : 'scale(1)',
                }}
              >
                <Icon size={18} color={isActive ? '#fff' : 'var(--text-sec)'} />
              </div>
            )
          })}
        </div>
        
        <div style={{ width:28, flexShrink:0 }} />
      </div>

      <div style={{ flex:1, overflow:'auto', position:'relative' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            style={{ height: '100%' }}
          >
            {activeTab === 'worldClock' && <WorldClock now={now} period={period} />}
            {activeTab === 'pomodoro' && <Pomodoro />}
            {activeTab === 'calendar' && <Calendar now={now} />}
            {activeTab === 'alarm' && <Alarm />}
            {activeTab === 'compass' && <Compass period={period} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}