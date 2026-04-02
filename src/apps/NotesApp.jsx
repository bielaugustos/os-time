import React, { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { getNotes, saveNote, deleteNote } from '../core/db'

export default function NotesApp() {
  const { t } = useTranslation()
  const [notes,   setNotes]   = useState([])
  const [active,  setActive]  = useState(null)
  const [title,   setTitle]   = useState('')
  const [body,    setBody]    = useState('')
  const [search,  setSearch]  = useState('')
  const titleRef = useRef(null)

  useEffect(() => { getNotes().then(n => { setNotes(n); if (n[0]) selectNote(n[0]) }) }, [])

  const selectNote = (n) => { setActive(n.id); setTitle(n.title); setBody(n.body) }

  const persist = async () => {
    if (active == null) return
    const updated = { id: active, title, body, pinned: false }
    await saveNote(updated)
    setNotes(prev => prev.map(n => n.id === active ? { ...n, title, body } : n))
  }

  const newNote = async () => {
    const note = { title: '', body: '', pinned: false }
    const id = await saveNote(note)
    const created = { ...note, id }
    setNotes(prev => [created, ...prev])
    selectNote(created)
    setTimeout(() => titleRef.current?.focus(), 50)
  }

  const remove = async (id, e) => {
    e.stopPropagation()
    await deleteNote(id)
    setNotes(prev => {
      const next = prev.filter(n => n.id !== id)
      if (active === id) { if (next[0]) selectNote(next[0]); else { setActive(null); setTitle(''); setBody('') } }
      return next
    })
  }

  const filtered = notes.filter(n =>
    !search || n.title.toLowerCase().includes(search.toLowerCase()) || n.body.toLowerCase().includes(search.toLowerCase())
  )

  const S = { // inline styles
    wrap:      { display:'flex', height:'100%', overflow:'hidden' },
    sidebar:   { width:220, borderRight:'1px solid var(--border)', display:'flex', flexDirection:'column', flexShrink:0 },
    toolbar:   { display:'flex', gap:8, padding:'12px 12px 8px', borderBottom:'1px solid var(--border)', flexShrink:0 },
    search:    { flex:1, background:'var(--surface)', border:'1px solid var(--border)', borderRadius:8, padding:'7px 10px', fontSize:13, color:'var(--text-pri)', fontFamily:'inherit' },
    addBtn:    { width:28, height:28, borderRadius:8, background:'var(--accent-dim)', border:'none', color:'var(--accent)', fontSize:20, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', flexShrink:0 },
    list:      { flex:1, overflowY:'auto' },
    noteItem:  (on) => ({ padding:'10px 12px', cursor:'pointer', borderLeft:`2px solid ${on ? 'var(--accent)' : 'transparent'}`, background: on ? 'var(--surface-hover)' : 'transparent', display:'flex', justifyContent:'space-between', alignItems:'flex-start', transition:'background .12s' }),
    itemTitle: { fontSize:13, fontWeight:500, color:'var(--text-pri)', overflow:'hidden', whiteSpace:'nowrap', textOverflow:'ellipsis', marginBottom:2 },
    itemPreview: { fontSize:11, color:'var(--text-ter)', overflow:'hidden', whiteSpace:'nowrap', textOverflow:'ellipsis' },
    delBtn:    { background:'none', border:'none', color:'var(--text-ter)', cursor:'pointer', fontSize:15, padding:'0 0 0 4px', flexShrink:0 },
    editor:    { flex:1, display:'flex', flexDirection:'column', overflow:'hidden' },
    titleIn:   { fontFamily:'Syne', fontSize:20, fontWeight:600, color:'var(--text-pri)', background:'none', border:'none', outline:'none', padding:'20px 24px 10px', borderBottom:'1px solid var(--border)' },
    bodyIn:    { flex:1, background:'none', border:'none', outline:'none', padding:'16px 24px', fontSize:14, color:'var(--text-sec)', lineHeight:1.75, resize:'none', fontFamily:'DM Sans', fontWeight:300 },
    empty:     { flex:1, display:'flex', alignItems:'center', justifyContent:'center', color:'var(--text-ter)', fontSize:13 },
  }

  return (
    <div style={S.wrap}>
      <div style={S.sidebar}>
        <div style={S.toolbar}>
          <input style={S.search} placeholder={t('notes.search')} value={search} onChange={e => setSearch(e.target.value)} />
          <button style={S.addBtn} onClick={newNote}>+</button>
        </div>
        <div style={S.list}>
          {filtered.length === 0 && <div style={{ padding:'20px 12px', fontSize:12, color:'var(--text-ter)', textAlign:'center' }}>No notes</div>}
          {filtered.map(n => (
            <div key={n.id} style={S.noteItem(n.id === active)} onClick={() => selectNote(n)}>
              <div style={{ flex:1, overflow:'hidden' }}>
                <div style={S.itemTitle}>{n.title || t('notes.untitled')}</div>
                <div style={S.itemPreview}>{n.body?.slice(0, 45) || '—'}</div>
              </div>
              <button style={S.delBtn} onClick={e => remove(n.id, e)}>×</button>
            </div>
          ))}
        </div>
      </div>

      <div style={S.editor}>
        {active != null ? (
          <>
            <input ref={titleRef} style={S.titleIn} value={title} onChange={e => setTitle(e.target.value)} onBlur={persist} placeholder={t('notes.untitled')} />
            <textarea style={S.bodyIn} value={body} onChange={e => setBody(e.target.value)} onBlur={persist} placeholder={t('notes.placeholder')} />
          </>
        ) : (
          <div style={S.empty}>Select a note or create one →</div>
        )}
      </div>
    </div>
  )
}
