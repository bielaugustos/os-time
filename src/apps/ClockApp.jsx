import React, { useEffect, useState } from 'react'

export default function ClockApp() {
  const [now, setNow] = useState(new Date())
  useEffect(() => { const id = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(id) }, [])

  const pad = n => String(n).padStart(2, '0')
  const deg = { h: (now.getHours() % 12) * 30 + now.getMinutes() * 0.5, m: now.getMinutes() * 6, s: now.getSeconds() * 6 }
  const hand = (deg, r) => { const rad = deg * Math.PI / 180; return { x: 90 + r * Math.sin(rad), y: 90 - r * Math.cos(rad) } }

  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'100%', gap:32, padding:32 }}>
      <svg viewBox="0 0 180 180" style={{ width:180, height:180 }}>
        <circle cx="90" cy="90" r="88" fill="none" stroke="var(--border)" strokeWidth="1" />
        {Array.from({ length: 12 }).map((_, i) => {
          const a = i * 30 * Math.PI / 180, r1 = i % 3 === 0 ? 72 : 76
          return <line key={i} x1={90 + r1 * Math.sin(a)} y1={90 - r1 * Math.cos(a)} x2={90 + 80 * Math.sin(a)} y2={90 - 80 * Math.cos(a)} stroke={i % 3 === 0 ? 'var(--text-sec)' : 'var(--border)'} strokeWidth={i % 3 === 0 ? 2 : 1} />
        })}
        <line x1="90" y1="90" x2={hand(deg.h, 48).x} y2={hand(deg.h, 48).y} stroke="var(--text-pri)" strokeWidth="3.5" strokeLinecap="round" />
        <line x1="90" y1="90" x2={hand(deg.m, 64).x} y2={hand(deg.m, 64).y} stroke="var(--text-pri)" strokeWidth="2"   strokeLinecap="round" />
        <line x1="90" y1="90" x2={hand(deg.s, 70).x} y2={hand(deg.s, 70).y} stroke="var(--accent)"   strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="90" cy="90" r="4" fill="var(--accent)" />
      </svg>

      <div style={{ textAlign:'center' }}>
        <div style={{ fontFamily:'Syne', fontSize:64, fontWeight:300, color:'var(--text-pri)', letterSpacing:-3, lineHeight:1 }}>
          {pad(now.getHours())}:{pad(now.getMinutes())}
          <span style={{ fontSize:32, color:'var(--accent)' }}>:{pad(now.getSeconds())}</span>
        </div>
        <div style={{ fontSize:14, color:'var(--text-ter)', marginTop:8, fontWeight:300 }}>
          {now.toLocaleDateString(undefined, { weekday:'long', month:'long', day:'numeric' })}
        </div>
      </div>
    </div>
  )
}
