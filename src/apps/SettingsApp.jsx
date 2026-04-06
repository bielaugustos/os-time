import React, { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { SUPPORTED_LANGS } from '../config/i18n'
import { PERIODS } from '../config/theme'
import { PERMISSION_DEFS, check, request, checkAll, getPermissionToggles, togglePermission } from '../core/permissions'
import { RiRefreshLine, RiCloseLine } from '@remixicon/react'
import TimeSettings from '../components/TimeSettings'

function useIsMobile(breakpoint = 640) {
  const [mobile, setMobile] = useState(() => window.innerWidth < breakpoint)
  useEffect(() => {
    const handler = () => setMobile(window.innerWidth < breakpoint)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [breakpoint])
  return mobile
}

const SectionLabel = ({ children }) => (
  <div style={{ fontSize:10, fontWeight:600, letterSpacing:1.8, color:'var(--text-ter)', textTransform:'uppercase', padding:'20px 0 10px' }}>
    {children}
  </div>
)

const Divider = () => <div style={{ height:'0.5px', background:'var(--border)', margin:'3px 0' }} />

function PermissionRow({ def, state, enabled, onToggle, onRequest, isMobile }) {
  const { t } = useTranslation()
  const [loading, setLoading] = useState(false)

  const handlePress = async () => {
    if (state === 'granted' || loading) return
    setLoading(true)
    await onRequest(def.key)
    setLoading(false)
  }

  const isGranted = state === 'granted'
  const isActive = isGranted && enabled

  return (
    <>
      <div style={{ display:'flex', alignItems:'center', gap: isMobile ? 10 : 12, padding: isMobile ? '11px 0' : '13px 0' }}>
        <div style={{
          width: isMobile ? 34 : 38, height: isMobile ? 34 : 38, borderRadius:10, flexShrink:0,
          background: isActive ? 'rgba(52,211,153,.10)' : 'var(--surface)',
          border: `1px solid ${isActive ? 'rgba(52,211,153,.25)' : 'var(--border)'}`,
          display:'flex', alignItems:'center', justifyContent:'center',
          fontSize: isMobile ? 15 : 17, color: isActive ? '#34d399' : 'var(--text-ter)',
          transition:'all .3s', opacity: isGranted && !enabled ? .5 : 1,
        }}>
          {def.icon}
        </div>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontSize: isMobile ? 13 : 14, color:'var(--text-pri)', fontWeight:500, marginBottom:2 }}>{t(def.labelKey)}</div>
          <div style={{ fontSize:11, color:'var(--text-ter)', fontWeight:300, lineHeight:1.4 }}>{t(def.reasonKey)}</div>
        </div>
        {isGranted ? (
          <div style={{ display:'flex', alignItems:'center', gap:6, flexShrink:0 }}>
            {!isMobile && (
              <span style={{ fontSize:11, color: enabled ? '#34d399' : 'var(--text-ter)', fontWeight:500 }}>
                {enabled ? t('settings.granted') : t('settings.denied')}
              </span>
            )}
            <button onClick={() => onToggle(def.key, !enabled)} style={{
              width:38, height:20, borderRadius:10, border:'none', cursor:'pointer',
              background: enabled ? '#34d399' : 'var(--border)',
              position:'relative', transition:'background .2s', flexShrink:0,
            }}>
              <div style={{
                width:16, height:16, borderRadius:'50%', background:'#fff',
                position:'absolute', top:2,
                left: enabled ? 20 : 2,
                transition:'left .2s',
              }} />
            </button>
          </div>
        ) : state === 'denied' ? (
          <div style={{ fontSize:11, color:'#f87171', textAlign:'right', lineHeight:1.4, flexShrink:0 }}>
            {t('settings.denied')}
            {!isMobile && <><br /><span style={{ fontSize:10, color:'var(--text-ter)' }}>{t('permissions.deniedHint')}</span></>}
          </div>
        ) : (
          <button onClick={handlePress} disabled={loading} style={{
            padding: isMobile ? '5px 10px' : '6px 14px', borderRadius:8, border:'1px solid var(--accent)',
            background:'transparent', color:'var(--accent)', fontSize: isMobile ? 11 : 12, fontWeight:500,
            cursor: loading ? 'wait' : 'pointer', fontFamily:'inherit',
            transition:'all .15s', flexShrink:0, opacity: loading ? .6 : 1,
          }}>
            {loading ? '...' : t('settings.allow')}
          </button>
        )}
      </div>
      <Divider />
    </>
  )
}

export default function SettingsApp({ onThemeOverride, onClose, isSplitMode }) {
  const { t, i18n } = useTranslation()
  const [states,     setStates]     = useState({})
  const [toggles,    setToggles]    = useState(() => getPermissionToggles())
  const [refreshing, setRefreshing] = useState(true)
  const [storage,    setStorage]    = useState(null)
  const isMobile = useIsMobile()

  const refresh = useCallback(async () => {
    setRefreshing(true)
    const all = await checkAll()
    setStates(all)
    setRefreshing(false)
  }, [])

  useEffect(() => { refresh() }, [refresh])

  useEffect(() => {
    navigator.storage?.estimate?.().then(est => {
      if (!est) return
      setStorage({ used: Math.round((est.usage ?? 0) / 1024), quota: Math.round((est.quota ?? 0) / 1024 / 1024) })
    })
  }, [])

  const handleRequest = useCallback(async (permKey) => {
    const result = await request(permKey)
    setStates(prev => ({ ...prev, [permKey]: result }))
  }, [])

  const handleToggle = useCallback((permKey, enabled) => {
    togglePermission(permKey, enabled)
    setToggles(getPermissionToggles())
  }, [])

  const granted = Object.values(states).filter(s => s === 'granted').length
  const total   = Object.keys(PERMISSION_DEFS).length

  const Row = ({ label, value }) => (
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', gap:12, padding:'11px 0', borderBottom:'0.5px solid var(--border)' }}>
      <span style={{ fontSize:13, color:'var(--text-sec)', flexShrink:0 }}>{label}</span>
      <span style={{ fontSize:13, color:'var(--text-ter)', textAlign:'right', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{value}</span>
    </div>
  )

  const pad = isMobile ? '0px 0px 48px' : '0px 0px 48px'

  return (
    <div style={{ height:'100%', overflowY:'auto', padding: pad, scrollbarWidth:'thin' }}>
      {!isSplitMode && (
        <div style={{ display:'flex', alignItems:'center', padding:'8px 20px', borderBottom:'1px solid var(--border)', background:'var(--surface)', marginBottom:4 }}>
          <button 
            onClick={onClose}
            style={{
              width: 28, height: 28, borderRadius: 7, border: '1px solid var(--border)',
              background: 'var(--surface)', cursor: 'pointer', color: 'var(--text-sec)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all .12s', flexShrink: 0,
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface-hover)'; e.currentTarget.style.borderColor = 'var(--accent)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--surface)'; e.currentTarget.style.borderColor = 'var(--border)' }}
          >
            <RiCloseLine size={14} />
          </button>
        </div>
      )}

      <div style={{ padding: '0px 20px' }}>
        <TimeSettings onThemeOverride={onThemeOverride} />

      <SectionLabel>{t('settings.appearance')}</SectionLabel>
      <div style={{ fontSize:12, color:'var(--text-ter)', marginBottom:10 }}>
        {t('settings.themeDescription')}
      </div>
      <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:4 }}>
        {Object.values(PERIODS).map(p => (
          <button key={p.name} onClick={() => onThemeOverride?.(p)} style={{
            padding:'5px 11px', borderRadius:8, border:`1px solid ${p.accent}40`,
            background:p.accentDim, color:p.accent, fontSize:11, cursor:'pointer',
            fontFamily:'inherit', fontWeight:500, transition:'transform .1s',
          }}
            onMouseDown={e => e.currentTarget.style.transform = 'scale(.91)'}
            onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            {p.label?.[i18n.language] ?? p.label?.en ?? p.name}
          </button>
        ))}
        <button onClick={() => onThemeOverride?.(null)} style={{
          padding:'5px 11px', borderRadius:8, border:'1px solid var(--border)',
          background:'transparent', color:'var(--text-ter)', fontSize:11, cursor:'pointer', fontFamily:'inherit',
        }}>
          {t('settings.themeAuto')}
        </button>
      </div>
      <Divider />

      <SectionLabel>{t('settings.language')}</SectionLabel>
      <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:4 }}>
        {SUPPORTED_LANGS.map(l => (
          <button key={l.code} onClick={() => i18n.changeLanguage(l.code)} style={{
            padding:'6px 13px', borderRadius:8, border:'1px solid var(--border)',
            background: i18n.language === l.code ? 'var(--accent-dim)' : 'transparent',
            color: i18n.language === l.code ? 'var(--accent)' : 'var(--text-sec)',
            fontSize:13, cursor:'pointer', fontFamily:'inherit', transition:'all .15s',
          }}>
            {l.label}
          </button>
        ))}
      </div>
      <Divider />

      <SectionLabel>{t('settings.permissions')}</SectionLabel>
      <div style={{
        padding: isMobile ? '10px 12px' : '12px 14px', borderRadius:12, marginBottom:10,
        background:'var(--surface)', border:'1px solid var(--border)',
        display:'flex', alignItems:'center', justifyContent:'space-between', gap:12,
      }}>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontSize: isMobile ? 12 : 13, color:'var(--text-sec)', marginBottom:6 }}>
            {refreshing ? t('settings.checking') : t('settings.ofTotalGranted', { granted, total })}
          </div>
          <div style={{ width: isMobile ? 100 : 160, height:3, borderRadius:99, background:'var(--border)', overflow:'hidden' }}>
            <div style={{ height:'100%', borderRadius:99, background: granted===total ? '#34d399' : 'var(--accent)', width:`${total > 0 ? (granted/total)*100 : 0}%`, transition:'width .6s ease' }} />
          </div>
        </div>
        <button onClick={refresh} style={{ background:'none', border:'1px solid var(--border)', borderRadius:8, padding:'5px 10px', color:'var(--text-ter)', fontSize:11, cursor:'pointer', fontFamily:'inherit', flexShrink:0, display:'flex', alignItems:'center', gap:4 }}>
          <RiRefreshLine size={12} />
          {t('settings.refresh')}
        </button>
      </div>
      {Object.values(PERMISSION_DEFS).map(def => (
        <PermissionRow key={def.key} def={def} state={states[def.key] ?? 'unknown'} enabled={toggles[def.key] !== false} onToggle={handleToggle} onRequest={handleRequest} isMobile={isMobile} />
      ))}
      <div style={{ marginTop:10, padding:'10px 12px', borderRadius:10, background:'var(--surface)', border:'1px solid var(--border)', fontSize:11, color:'var(--text-ter)', lineHeight:1.7 }}>
        {t('permissions.chromeHint')}<br />{t('permissions.safariHint')}
      </div>

      <SectionLabel>{t('settings.system')}</SectionLabel>
      <Row label={t('settings.version')}  value="OS Shell 0.1.0" />
      <Row label={t('settings.engine')}   value="React + Vite + PWA" />
      <Row label={t('settings.database')} value="IndexedDB · Dexie" />
      <Row label={t('settings.offline')}  value="Service Worker" />
      {storage && <Row label={t('settings.storageUsed')} value={`${storage.used} KB / ${storage.quota} MB`} />}
      </div>
    </div>
  )
}
