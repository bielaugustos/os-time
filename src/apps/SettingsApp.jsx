import React, { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { SUPPORTED_LANGS } from '../config/i18n'
import { PERIODS } from '../config/theme'
import { PERMISSION_DEFS, check, request, checkAll } from '../core/permissions'

const SectionLabel = ({ children }) => (
  <div style={{ fontSize:10, fontWeight:600, letterSpacing:1.8, color:'var(--text-ter)', textTransform:'uppercase', padding:'20px 0 10px' }}>
    {children}
  </div>
)

const Divider = () => <div style={{ height:'0.5px', background:'var(--border)', margin:'3px 0' }} />

const STATE_META = {
  granted: { color:'#34d399' },
  denied:  { color:'#f87171' },
  prompt:  { color:'var(--text-ter)' },
  unknown: { color:'var(--text-ter)' },
}

function PermissionRow({ def, state, onRequest }) {
  const { t } = useTranslation()
  const [loading, setLoading] = useState(false)

  const handlePress = async () => {
    if (state === 'granted' || loading) return
    setLoading(true)
    await onRequest(def.key)
    setLoading(false)
  }

  return (
    <>
      <div style={{ display:'flex', alignItems:'center', gap:12, padding:'13px 0' }}>
        <div style={{
          width:38, height:38, borderRadius:11, flexShrink:0,
          background: state==='granted' ? 'rgba(52,211,153,.10)' : 'var(--surface)',
          border: `1px solid ${state==='granted' ? 'rgba(52,211,153,.25)' : 'var(--border)'}`,
          display:'flex', alignItems:'center', justifyContent:'center',
          fontSize:17, color: state==='granted' ? '#34d399' : 'var(--text-ter)',
          transition:'all .3s',
        }}>
          {def.icon}
        </div>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontSize:14, color:'var(--text-pri)', fontWeight:500, marginBottom:2 }}>{t(def.labelKey)}</div>
          <div style={{ fontSize:11, color:'var(--text-ter)', fontWeight:300, lineHeight:1.4 }}>{t(def.reasonKey)}</div>
        </div>
        {state === 'granted' ? (
          <div style={{ display:'flex', alignItems:'center', gap:5, fontSize:12, color:'#34d399', fontWeight:500, flexShrink:0 }}>
            <span style={{ fontSize:8 }}>●</span> {t('settings.granted')}
          </div>
        ) : state === 'denied' ? (
          <div style={{ fontSize:11, color:'#f87171', textAlign:'right', lineHeight:1.4, flexShrink:0 }}>
            {t('settings.denied')}<br />
            <span style={{ fontSize:10, color:'var(--text-ter)' }}>{t('permissions.deniedHint')}</span>
          </div>
        ) : (
          <button onClick={handlePress} disabled={loading} style={{
            padding:'6px 14px', borderRadius:8, border:'1px solid var(--accent)',
            background:'transparent', color:'var(--accent)', fontSize:12, fontWeight:500,
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

export default function SettingsApp({ onThemeOverride }) {
  const { t, i18n } = useTranslation()
  const [states,     setStates]     = useState({})
  const [refreshing, setRefreshing] = useState(true)
  const [storage,    setStorage]    = useState(null)

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

  const granted = Object.values(states).filter(s => s === 'granted').length
  const total   = Object.keys(PERMISSION_DEFS).length

  const Row = ({ label, value }) => (
    <div style={{ display:'flex', justifyContent:'space-between', padding:'11px 0', borderBottom:'0.5px solid var(--border)' }}>
      <span style={{ fontSize:13, color:'var(--text-sec)' }}>{label}</span>
      <span style={{ fontSize:13, color:'var(--text-ter)' }}>{value}</span>
    </div>
  )

  return (
    <div style={{ height:'100%', overflowY:'auto', padding:'4px 24px 48px', scrollbarWidth:'thin' }}>

      <SectionLabel>{t('settings.appearance')}</SectionLabel>
      <div style={{ fontSize:12, color:'var(--text-ter)', marginBottom:10 }}>
        Adapts automatically to time of day. Preview:
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
            {p.name}
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
      <div style={{ padding:'12px 14px', borderRadius:12, marginBottom:10, background:'var(--surface)', border:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div>
          <div style={{ fontSize:13, color:'var(--text-sec)', marginBottom:6 }}>
            {refreshing ? 'Checking...' : `${granted} of ${total} granted`}
          </div>
          <div style={{ width:160, height:3, borderRadius:99, background:'var(--border)', overflow:'hidden' }}>
            <div style={{ height:'100%', borderRadius:99, background: granted===total ? '#34d399' : 'var(--accent)', width:`${total > 0 ? (granted/total)*100 : 0}%`, transition:'width .6s ease' }} />
          </div>
        </div>
        <button onClick={refresh} style={{ background:'none', border:'1px solid var(--border)', borderRadius:8, padding:'5px 10px', color:'var(--text-ter)', fontSize:11, cursor:'pointer', fontFamily:'inherit' }}>
          {t('settings.refresh')}
        </button>
      </div>
      {Object.values(PERMISSION_DEFS).map(def => (
        <PermissionRow key={def.key} def={def} state={states[def.key] ?? 'unknown'} onRequest={handleRequest} />
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
  )
}
