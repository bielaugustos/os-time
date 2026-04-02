import React, { useState } from 'react'

const ROWS = [['C','±','%','÷'],['7','8','9','×'],['4','5','6','−'],['1','2','3','+'],['0','.','=']]

export default function CalculatorApp() {
  const [state, setState] = useState({ display:'0', prev:null, op:null, fresh:false })

  const press = (k) => {
    setState(s => {
      const ns = { ...s }
      if (k === 'C') return { display:'0', prev:null, op:null, fresh:false }
      if (k === '±') { ns.display = String(-parseFloat(s.display)); return ns }
      if (k === '%') { ns.display = String(parseFloat(s.display) / 100); return ns }
      if (['÷','×','−','+'].includes(k)) { ns.prev = parseFloat(s.display); ns.op = k; ns.fresh = true; return ns }
      if (k === '=') {
        if (s.prev == null || !s.op) return s
        const a = s.prev, b = parseFloat(s.display)
        const r = { '÷':a/b, '×':a*b, '−':a-b, '+':a+b }[s.op]
        return { display: String(parseFloat(r.toFixed(10))), prev:null, op:null, fresh:false }
      }
      if (s.fresh) { ns.fresh = false; ns.display = k === '.' ? '0.' : k; return ns }
      if (k === '.' && s.display.includes('.')) return s
      if (s.display === '0' && k !== '.') { ns.display = k; return ns }
      ns.display = s.display + k
      return ns
    })
  }

  const isOp = k => ['÷','×','−','+'].includes(k)
  const isEq = k => k === '='
  const isFn = k => ['C','±','%'].includes(k)

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', maxWidth:340, margin:'0 auto', padding:24 }}>
      <div style={{ flex:1, display:'flex', flexDirection:'column', justifyContent:'flex-end', alignItems:'flex-end', padding:'0 4px 12px' }}>
        {state.op && <div style={{ fontSize:14, color:'var(--text-ter)', marginBottom:3, fontFamily:'DM Mono' }}>{state.prev} {state.op}</div>}
        <div style={{ fontFamily:'Syne', fontSize: state.display.length > 9 ? 36 : 58, fontWeight:300, color:'var(--text-pri)', letterSpacing:-2, lineHeight:1 }}>
          {state.display}
        </div>
      </div>

      <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
        {ROWS.map((row, ri) => (
          <div key={ri} style={{ display:'grid', gridTemplateColumns: ri === 4 ? '2fr 1fr 1fr' : 'repeat(4,1fr)', gap:10 }}>
            {row.map(k => (
              <button key={k} onClick={() => press(k)} style={{
                padding:'18px 0', border:'none', borderRadius:14, cursor:'pointer',
                fontFamily:'Syne', fontSize:20, fontWeight:400,
                background: isEq(k) ? 'var(--accent)' : isOp(k) ? 'var(--accent-dim)' : isFn(k) ? 'var(--surface-hover)' : 'var(--surface)',
                color: isEq(k) ? '#fff' : isOp(k) ? 'var(--accent)' : 'var(--text-pri)',
                transition:'transform .1s',
              }}
                onMouseDown={e => e.currentTarget.style.transform = 'scale(.92)'}
                onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
              >
                {k}
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
