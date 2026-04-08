import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { getNotes, saveNote, deleteNote, getArchivedNotes, archiveNote, restoreNote, permanentlyDeleteNote, SYNC_STATUS } from '../core/db'
import { encryptData, decryptData } from '../core/security'
import { useBatteryOptimization, useAnimationOptimizer, useDeferredRender, useLazyLoad } from '../hooks/useBattery'
import { 
  RiFileTextLine, RiAddLine, RiSearchLine, RiDeleteBinLine,
  RiArrowLeftSLine, RiMoreFill, RiPushpinLine, RiPushpinFill,
  RiFolderLine, RiHome2Line, RiArchiveLine, RiRefreshLine,
  RiMore2Line, RiStarLine, RiStarFill, RiLayoutRowLine,
  RiStickyNoteLine, RiBook2Line, RiDraftLine, RiArticleLine,
  RiFileList3Line, RiFileInfoLine, RiBookmarkLine, 
  RiLightbulbLine, RiFireLine, RiFlashlightLine, RiDiamondLine,
  RiGlobalLine, RiHomeLine, RiCompass3Line, RiPlanetLine,
  RiHeartLine, RiFlowerLine, RiLeafLine, RiSunLine, RiMoonLine, RiCloudLine,
  RiBold, RiItalic, RiStrikethrough2, RiListUnordered, RiListOrdered,
  RiDoubleQuotesL, RiCodeLine, RiLink, RiImageLine, RiSeparator,
  RiCloseLine,
} from '@remixicon/react'

function useIsMobile(breakpoint = 768) {
  const [mobile, setMobile] = useState(() => window.innerWidth < breakpoint)
  useEffect(() => {
    const handler = () => setMobile(window.innerWidth < breakpoint)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [breakpoint])
  return mobile
}

const ICONS = [
  { type: 'icon', value: 'RiStickyNoteLine', label: 'Note' },
  { type: 'icon', value: 'RiBook2Line', label: 'Book' },
  { type: 'icon', value: 'RiDraftLine', label: 'Draft' },
  { type: 'icon', value: 'RiArticleLine', label: 'Article' },
  { type: 'icon', value: 'RiFileList3Line', label: 'List' },
  { type: 'icon', value: 'RiFileInfoLine', label: 'Info' },
  { type: 'icon', value: 'RiBookmarkLine', label: 'Bookmark' },
  { type: 'icon', value: 'RiStarLine', label: 'Star' },
  { type: 'icon', value: 'RiLightbulbLine', label: 'Idea' },
  { type: 'icon', value: 'RiFireLine', label: 'Fire' },
  { type: 'icon', value: 'RiFlashlightLine', label: 'Flash' },
  { type: 'icon', value: 'RiDiamondLine', label: 'Gem' },
  { type: 'icon', value: 'RiGlobalLine', label: 'Web' },
  { type: 'icon', value: 'RiHomeLine', label: 'Home' },
  { type: 'icon', value: 'RiCompass3Line', label: 'Compass' },
  { type: 'icon', value: 'RiPlanetLine', label: 'Planet' },
  { type: 'icon', value: 'RiHeartLine', label: 'Heart' },
  { type: 'icon', value: 'RiFlowerLine', label: 'Flower' },
  { type: 'icon', value: 'RiLeafLine', label: 'Leaf' },
  { type: 'icon', value: 'RiSunLine', label: 'Sun' },
  { type: 'icon', value: 'RiMoonLine', label: 'Moon' },
  { type: 'icon', value: 'RiCloudLine', label: 'Cloud' },
  { type: 'emoji', value: '📝', label: 'Note' },
  { type: 'emoji', value: '📋', label: 'Clip' },
  { type: 'emoji', value: '📌', label: 'Pin' },
  { type: 'emoji', value: '🔖', label: 'Tag' },
  { type: 'emoji', value: '💡', label: 'Idea' },
  { type: 'emoji', value: '🎯', label: 'Target' },
  { type: 'emoji', value: '⚡️', label: 'Bolt' },
  { type: 'emoji', value: '🔥', label: 'Fire' },
  { type: 'emoji', value: '💎', label: 'Gem' },
  { type: 'emoji', value: '🌟', label: 'Star' },
  { type: 'emoji', value: '✨', label: 'Sparkle' },
  { type: 'emoji', value: '📚', label: 'Book' },
  { type: 'emoji', value: '🎨', label: 'Art' },
  { type: 'emoji', value: '🧠', label: 'Brain' },
  { type: 'emoji', value: '💭', label: 'Thought' },
]

const ICON_MAP = {
  RiStickyNoteLine, RiBook2Line, RiDraftLine, RiArticleLine,
  RiFileList3Line, RiFileInfoLine, RiBookmarkLine, RiStarLine,
  RiLightbulbLine, RiFireLine, RiFlashlightLine, RiDiamondLine,
  RiGlobalLine, RiHomeLine, RiCompass3Line, RiPlanetLine,
  RiHeartLine, RiFlowerLine, RiLeafLine, RiSunLine, RiMoonLine, RiCloudLine,
}

function getIconComponent(iconValue) {
  if (!iconValue) return null
  if (typeof iconValue === 'string' && ICON_MAP[iconValue]) {
    const IconComponent = ICON_MAP[iconValue]
    return <IconComponent size={20} />
  }
  return iconValue
}

function getEditorIconComponent(iconValue) {
  if (!iconValue) return <RiStickyNoteLine size={40} color="var(--text-pri)" />
  if (typeof iconValue === 'string' && ICON_MAP[iconValue]) {
    const IconComponent = ICON_MAP[iconValue]
    return <IconComponent size={40} color="var(--text-pri)" />
  }
  return <span style={{ fontSize: 40, lineHeight: 1 }}>{iconValue}</span>
}

function getSidebarIconComponent(iconValue) {
  if (!iconValue) return <RiFileTextLine size={16} color="var(--text-ter)" style={{ flexShrink: 0 }} />
  if (typeof iconValue === 'string' && ICON_MAP[iconValue]) {
    const IconComponent = ICON_MAP[iconValue]
    return <IconComponent size={16} color="var(--text-ter)" style={{ flexShrink: 0 }} />
  }
  return <span style={{ fontSize: 18, flexShrink: 0 }}>{iconValue}</span>
}

const COVERS = [
  'linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,0.6))',
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
  'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
]

function SidebarItem({ note, isActive, onClick, onDelete, onArchive, level = 0, isPinned = false }) {
  const { t } = useTranslation()
  const [showMenu, setShowMenu] = useState(false)

  const formatDate = (timestamp) => {
    if (!timestamp) return ''
    const date = new Date(timestamp)
    const now = new Date()
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24))
    if (diffDays === 0) return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
    if (diffDays === 1) return t('notes.yesterday')
    if (diffDays < 7) return date.toLocaleDateString(undefined, { weekday: 'short' })
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -10 }}
      onClick={onClick}
      style={{
        padding: '8px 12px',
        cursor: 'pointer',
        background: isActive ? 'var(--surface-hover)' : 'transparent',
        borderLeft: isActive ? '2px solid var(--accent)' : '2px solid transparent',
        borderRadius: '0 6px 6px 0',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        transition: 'background .12s',
        position: 'relative',
      }}
      onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'var(--surface)' }}
      onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent' }}
    >
      {getSidebarIconComponent(note.icon)}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <div style={{ 
          fontSize: 14, 
          fontWeight: isActive ? 500 : 400, 
          color: 'var(--text-pri)',
          overflow: 'hidden', 
          whiteSpace: 'nowrap', 
          textOverflow: 'ellipsis',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}>
          {isPinned && <RiPushpinFill size={10} color="var(--accent)" />}
          {note.title || t('notes.untitled')}
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-ter)', marginTop: 2 }}>
          {formatDate(note.updatedAt)}
        </div>
      </div>
      <button
        onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu) }}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'var(--text-ter)', padding: 4, display: 'flex',
          opacity: showMenu ? 1 : 0.5, transition: 'opacity .12s',
        }}
      >
        <RiMore2Line size={16} />
      </button>
      <AnimatePresence>
        {showMenu && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            style={{
              position: 'absolute',
              right: 8,
              top: '100%',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              padding: 4,
              zIndex: 100,
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={(e) => { e.stopPropagation(); onArchive?.(note); setShowMenu(false) }}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '8px 12px', background: 'none', border: 'none',
                color: 'var(--text-sec)', fontSize: 13, cursor: 'pointer',
                width: '100%', borderRadius: 6,
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-hover)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <RiArchiveLine size={14} /> {t('notes.archive')}
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete?.(note.id); setShowMenu(false) }}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '8px 12px', background: 'none', border: 'none',
                color: '#ef4444', fontSize: 13, cursor: 'pointer',
                width: '100%', borderRadius: 6,
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-hover)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <RiDeleteBinLine size={14} /> {t('notes.delete')}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function Sidebar({ notes, activeId, onSelect, onNew, onDelete, onArchive, search, onSearchChange, view, onViewChange, onClose, isSplitMode }) {
  const { t } = useTranslation()
  const isMobile = useIsMobile()

  const pinnedNotes = notes.filter(n => n.pinned)
  const regularNotes = notes.filter(n => !n.pinned)

  return (
    <div style={{
      width: isMobile ? '100%' : 260,
      display: 'flex', flexDirection: 'column',
      background: 'var(--surface)',
      borderRight: '1px solid var(--border)',
      flexShrink: 0,
    }}>
      <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8 }}>
        {!isSplitMode && (
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
        )}
        <div style={{ position: 'relative', flex: 1 }}>
          <RiSearchLine size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-ter)' }} />
          <input
            value={search}
            onChange={e => onSearchChange(e.target.value)}
            placeholder={t('notes.search')}
            style={{
              width: '100%',
              background: 'var(--bg)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              padding: '8px 10px 8px 32px',
              fontSize: 13,
              color: 'var(--text-pri)',
              fontFamily: 'inherit',
              outline: 'none',
            }}
          />
        </div>
      </div>

      <div style={{ padding: '8px 12px', display: 'flex', gap: 4, flexWrap: 'wrap' }}>
        <button
          onClick={() => onViewChange('all')}
          style={{
            padding: '6px 12px', borderRadius: 6, border: 'none',
            background: view === 'all' ? 'var(--accent-dim)' : 'transparent',
            color: view === 'all' ? 'var(--accent)' : 'var(--text-ter)',
            fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500,
          }}
        >
          {t('notes.all')}
        </button>
        <button
          onClick={() => onViewChange('pinned')}
          style={{
            padding: '6px 12px', borderRadius: 6, border: 'none',
            background: view === 'pinned' ? 'var(--accent-dim)' : 'transparent',
            color: view === 'pinned' ? 'var(--accent)' : 'var(--text-ter)',
            fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500,
            display: 'flex', alignItems: 'center', gap: 4,
          }}
        >
          <RiPushpinFill size={12} /> {t('notes.pinned')}
        </button>
        <button
          onClick={() => onViewChange('archived')}
          style={{
            padding: '6px 12px', borderRadius: 6, border: 'none',
            background: view === 'archived' ? 'var(--accent-dim)' : 'transparent',
            color: view === 'archived' ? 'var(--accent)' : 'var(--text-ter)',
            fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500,
            display: 'flex', alignItems: 'center', gap: 4,
          }}
        >
          <RiArchiveLine size={12} /> {t('notes.archived')}
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '4px 0' }}>
        <AnimatePresence>
          {pinnedNotes.length > 0 && view !== 'archived' && (
            <>
              <div style={{ padding: '8px 12px 4px', fontSize: 10, fontWeight: 600, color: 'var(--text-ter)', letterSpacing: 1, textTransform: 'uppercase' }}>
                {t('notes.pinned')}
              </div>
              {pinnedNotes.map(n => (
                <SidebarItem
                  key={n.id}
                  note={n}
                  isActive={n.id === activeId}
                  onClick={() => onSelect(n)}
                  onDelete={onDelete}
                  onArchive={onArchive}
                  isPinned
                />
              ))}
            </>
          )}
          {regularNotes.map(n => (
            <SidebarItem
              key={n.id}
              note={n}
              isActive={n.id === activeId}
              onClick={() => onSelect(n)}
              onDelete={onDelete}
              onArchive={onArchive}
            />
          ))}
          {notes.length === 0 && view !== 'archived' && (
            <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-ter)', fontSize: 13 }}>
              {search ? t('notes.noResults') : t('notes.noNotes')}
            </div>
          )}
        </AnimatePresence>
      </div>

      <div style={{ padding: 12, borderTop: '1px solid var(--border)' }}>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onNew}
          style={{
            width: '100%',
            padding: '10px 16px',
            borderRadius: 8,
            border: '1px dashed var(--border)',
            background: 'transparent',
            color: 'var(--text-sec)',
            fontSize: 13,
            cursor: 'pointer',
            fontFamily: 'inherit',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}
        >
          <RiAddLine size={16} />
          {t('notes.new')}
        </motion.button>
      </div>
    </div>
  )
}

function Editor({ note, onSave, onBack, isMobile }) {
  const { t } = useTranslation()
  const [title, setTitle] = useState(note?.title || '')
  const [body, setBody] = useState(note?.body || '')
  const [showIconPicker, setShowIconPicker] = useState(false)
  const [showCoverPicker, setShowCoverPicker] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)
  const [iconTab, setIconTab] = useState('icons')
  const titleRef = useRef(null)

  useEffect(() => {
    setTitle(note?.title || '')
    setBody(note?.body || '')
  }, [note?.id])

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (note) {
        onSave({ ...note, title, body })
      }
    }, 500)
    return () => clearTimeout(timeout)
  }, [title, body])

  const showHelp = !body && !note?.body

  const [showCommandMenu, setShowCommandMenu] = useState(false)
  const [commandMenuPos, setCommandMenuPos] = useState({ top: 0, left: 0 })

  // eslint-disable-next-line no-unused-vars
  const formatOptions = [
    { id: 'bold', label: t('notes.bold'), prefix: '**', suffix: '**', placeholder: 'bold' },
    { id: 'italic', label: t('notes.italic'), prefix: '*', suffix: '*', placeholder: 'italic' },
    { id: 'strike', label: t('notes.strike'), prefix: '~~', suffix: '~~', placeholder: 'strike' },
    { id: 'code', label: t('notes.code'), prefix: '`', suffix: '`', placeholder: 'code' },
  ]

  const headingOptions = [
    { id: 'h1', label: t('notes.h1'), prefix: '\n# ' },
    { id: 'h2', label: t('notes.h2'), prefix: '\n## ' },
    { id: 'h3', label: t('notes.h3'), prefix: '\n### ' },
  ]

  const listOptions = [
    { id: 'bullet', label: t('notes.bulletList'), prefix: '\n- ' },
    { id: 'numbered', label: t('notes.numberedList'), prefix: '\n1. ' },
    { id: 'quote', label: t('notes.quote'), prefix: '\n> ' },
  ]

  const otherOptions = [
    { id: 'link', label: t('notes.link'), prefix: '[', suffix: '](url)', placeholder: 'text' },
    { id: 'divider', label: t('notes.divider'), prefix: '\n---\n' },
  ]

  const insertCommand = (cmd) => {
    const textarea = document.getElementById('note-body-textarea')
    if (!textarea) return
    
    const start = textarea.selectionStart
    const before = body.substring(0, start)
    const after = body.substring(start)
    
    const slashIndex = before.lastIndexOf('/')
    const newBefore = slashIndex >= 0 ? before.substring(0, slashIndex) : before
    
    const prefix = cmd.prefix || ''
    const suffix = cmd.suffix || ''
    const placeholder = cmd.placeholder || ''
    
    const newText = newBefore + prefix + placeholder + suffix + after
    
    setBody(newText)
    setShowCommandMenu(false)
    
    setTimeout(() => {
      textarea.focus()
      const cursorPos = newBefore.length + prefix.length + (placeholder?.length || 0)
      textarea.setSelectionRange(cursorPos, cursorPos)
    }, 0)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setShowCommandMenu(false)
    }
  }

  const parseMarkdown = (text) => {
    if (!text) return ''
    let html = text
    html = html.replace(/^### (.*$)/gm, '<h3>$1</h3>')
    html = html.replace(/^## (.*$)/gm, '<h2>$1</h2>')
    html = html.replace(/^# (.*$)/gm, '<h1>$1</h1>')
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>')
    html = html.replace(/`(.*?)`/g, '<code style="background:var(--surface-hover);padding:2px 6px;border-radius:4px;font-family:var(--font-mono);font-size:13px;">$1</code>')
    html = html.replace(/^\* (.*$)/gm, '<li style="margin-left:20px;">• $1</li>')
    html = html.replace(/^\- (.*$)/gm, '<li style="margin-left:20px;">• $1</li>')
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" style="color:var(--accent);text-decoration:underline;">$1</a>')
    html = html.replace(/\n/g, '<br/>')
    return html
  }

  const handleIconSelect = (icon) => {
    onSave({ ...note, icon })
    setShowIconPicker(false)
    setIconTab('icons')
  }

  const handleCoverSelect = (cover) => {
    onSave({ ...note, cover })
    setShowCoverPicker(false)
  }

  const openIconPicker = () => {
    setIconTab('icons')
    setShowIconPicker(true)
  }

  const togglePin = () => {
    onSave({ ...note, pinned: !note.pinned })
  }

  if (!note) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-ter)', fontSize: 14 }}>
        <div style={{ textAlign: 'center' }}>
          <RiFileTextLine size={48} style={{ opacity: 0.3, marginBottom: 16 }} />
          <div>{isMobile ? `← ${t('notes.new')}` : t('notes.selectNote')}</div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--bg)' }}>
      {isMobile && (
        <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center' }}>
          <button
            onClick={onBack}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--text-sec)', fontSize: 20, padding: 8,
              display: 'flex', alignItems: 'center',
            }}
          >
            ←
          </button>
        </div>
      )}
      {note.cover && (
        <div style={{
          height: 180,
          background: note.cover,
          position: 'relative',
          flexShrink: 0,
        }}>
          <button
            onClick={() => setShowCoverPicker(true)}
            style={{
              position: 'absolute',
              bottom: 12,
              right: 12,
              background: 'rgba(0,0,0,0.5)',
              border: 'none',
              borderRadius: 6,
              padding: '6px 10px',
              color: '#fff',
              fontSize: 12,
              cursor: 'pointer',
            }}
            >
              {t('notes.changeCover')}
            </button>
        </div>
      )}

      <div style={{ padding: isMobile ? '16px 20px' : '24px 32px', flex: 1, overflow: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
            <button
              onClick={openIconPicker}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: 40, lineHeight: 1, padding: 4,
                color: 'var(--text-pri)',
              }}
            >
              {getEditorIconComponent(note.icon)}
            </button>
            <button
              onClick={togglePin}
              style={{
                background: note.pinned ? 'var(--accent-dim)' : 'transparent',
                border: 'none', borderRadius: 6,
                padding: '6px 8px', cursor: 'pointer',
                color: note.pinned ? 'var(--accent)' : 'var(--text-ter)',
                display: 'flex', alignItems: 'center', gap: 4,
                fontSize: 12,
              }}
            >
              {note.pinned ? <RiPushpinFill size={14} /> : <RiPushpinLine size={14} />}
            </button>
          </div>
          <button
            onClick={() => setShowCommandMenu(true)}
            style={{
              background: 'var(--surface-hover)',
              border: '1px solid var(--border)',
              borderRadius: 6,
              padding: '6px 12px', cursor: 'pointer',
              color: 'var(--text-sec)',
              display: 'flex', alignItems: 'center', gap: 6,
              fontSize: 12,
              fontFamily: 'inherit',
            }}
          >
            {t('notes.format')}
          </button>
          <button
            onClick={() => setPreviewMode(!previewMode)}
            style={{
              background: previewMode ? 'var(--accent-dim)' : 'var(--surface-hover)',
              border: '1px solid var(--border)',
              borderRadius: 6,
              padding: '6px 12px', cursor: 'pointer',
              color: previewMode ? 'var(--accent)' : 'var(--text-sec)',
              display: 'flex', alignItems: 'center', gap: 6,
              fontSize: 12,
              fontFamily: 'inherit',
            }}
          >
            {previewMode ? t('notes.edit') : t('notes.preview')}
          </button>
        </div>

        <input
          ref={titleRef}
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder={t('notes.untitled')}
          style={{
            width: '100%',
            fontFamily: 'Syne',
            fontSize: isMobile ? 28 : 36,
            fontWeight: 700,
            color: 'var(--text-pri)',
            background: 'none',
            border: 'none',
            outline: 'none',
            padding: 0,
            marginBottom: 16,
          }}
        />

        {previewMode ? (
          <div
            style={{
              width: '100%',
              minHeight: 300,
              fontFamily: 'DM Sans',
              fontSize: 16,
              fontWeight: 300,
              lineHeight: 1.75,
              color: 'var(--text-sec)',
            }}
            dangerouslySetInnerHTML={{ __html: parseMarkdown(body) }}
          />
        ) : (
          <div style={{ position: 'relative', width: '100%', minHeight: 300 }}>
            <textarea
              id="note-body-textarea"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t('notes.placeholder')}
              style={{
                width: '100%',
                minHeight: 300,
                fontFamily: 'DM Sans',
                fontSize: 16,
                fontWeight: 300,
                lineHeight: 1.75,
                color: 'var(--text-sec)',
                background: 'transparent',
                border: 'none',
                outline: 'none',
                resize: 'none',
                whiteSpace: 'pre-wrap',
                wordWrap: 'break-word',
                userSelect: 'text',
                WebkitUserSelect: 'text',
              }}
              onCopy={(e) => e.stopPropagation()}
              onCut={(e) => e.stopPropagation()}
              onPaste={(e) => e.stopPropagation()}
            />
          </div>
        )}
      </div>

      <AnimatePresence>
        {showIconPicker && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.5)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              zIndex: 1000,
            }}
            onClick={() => setShowIconPicker(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={e => e.stopPropagation()}
              style={{
                background: 'var(--surface)',
                borderRadius: 12,
                padding: 16,
                maxWidth: 340,
                maxHeight: 400,
                overflow: 'auto',
              }}
            >
              <div style={{ display: 'flex', gap: 4, marginBottom: 12, paddingBottom: 8, borderBottom: '1px solid var(--border)' }}>
                <button
                  onClick={() => setIconTab('icons')}
                  style={{
                    flex: 1, padding: '6px 12px', borderRadius: 6, border: 'none',
                    background: iconTab === 'icons' ? 'var(--accent-dim)' : 'transparent',
                    color: iconTab === 'icons' ? 'var(--accent)' : 'var(--text-ter)',
                    fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500,
                  }}
                >
                  {t('notes.icons')}
                </button>
                <button
                  onClick={() => setIconTab('emojis')}
                  style={{
                    flex: 1, padding: '6px 12px', borderRadius: 6, border: 'none',
                    background: iconTab === 'emojis' ? 'var(--accent-dim)' : 'transparent',
                    color: iconTab === 'emojis' ? 'var(--accent)' : 'var(--text-ter)',
                    fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500,
                  }}
                >
                  {t('notes.emojis')}
                </button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
                {ICONS.filter(i => iconTab === 'icons' ? i.type === 'icon' : i.type === 'emoji').map((item, i) => (
                  <button
                    key={i}
                    onClick={() => handleIconSelect(item.value)}
                    style={{
                      fontSize: 20,
                      padding: 10,
                      background: 'var(--surface-hover)',
                      border: 'none',
                      borderRadius: 8,
                      cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'var(--text-pri)',
                    }}
                  >
                    {item.type === 'icon' ? getIconComponent(item.value) : item.value}
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showCoverPicker && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.5)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              zIndex: 1000,
            }}
            onClick={() => setShowCoverPicker(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={e => e.stopPropagation()}
              style={{
                background: 'var(--surface)',
                borderRadius: 12,
                padding: 16,
                maxWidth: 400,
              }}
            >
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                {COVERS.map((cover, i) => (
                  <button
                    key={i}
                    onClick={() => handleCoverSelect(cover)}
                    style={{
                      height: 60,
                      background: cover,
                      border: 'none',
                      borderRadius: 8,
                      cursor: 'pointer',
                    }}
                  />
                ))}
                <button
                  onClick={() => handleCoverSelect(null)}
                  style={{
                    height: 60,
                    background: 'var(--surface-hover)',
                    border: '2px dashed var(--border)',
                    borderRadius: 8,
                    cursor: 'pointer',
                    color: 'var(--text-ter)',
                    fontSize: 12,
                  }}
                >
                  {t('notes.remove')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showCommandMenu && !previewMode && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              background: 'var(--surface)',
              borderTop: '1px solid var(--border)',
              borderRadius: '12px 12px 0 0',
              padding: '12px',
              zIndex: 100,
              boxShadow: '0 -4px 20px rgba(0,0,0,0.15)',
            }}
          >
            <div style={{ fontSize: 10, color: 'var(--text-ter)', fontWeight: 600, letterSpacing: 1, marginBottom: 8 }}>{t('notes.format')}</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6, marginBottom: 12 }}>
              {formatOptions.map((cmd) => (
                <button key={cmd.id} onClick={() => insertCommand(cmd)} style={{ padding: '10px 6px', background: 'var(--surface-hover)', border: 'none', borderRadius: 8, cursor: 'pointer', color: 'var(--text-sec)', fontSize: 12, fontWeight: 500 }}>
                  {cmd.label}
                </button>
              ))}
            </div>

            <div style={{ fontSize: 10, color: 'var(--text-ter)', fontWeight: 600, letterSpacing: 1, marginBottom: 8 }}>{t('notes.headings')}</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6, marginBottom: 12 }}>
              {headingOptions.map((cmd) => (
                <button key={cmd.id} onClick={() => insertCommand(cmd)} style={{ padding: '10px 6px', background: 'var(--surface-hover)', border: 'none', borderRadius: 8, cursor: 'pointer', color: 'var(--text-sec)', fontSize: 12, fontWeight: 500 }}>
                  {cmd.label}
                </button>
              ))}
            </div>

            <div style={{ fontSize: 10, color: 'var(--text-ter)', fontWeight: 600, letterSpacing: 1, marginBottom: 8 }}>{t('notes.lists')}</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6, marginBottom: 12 }}>
              {listOptions.map((cmd) => (
                <button key={cmd.id} onClick={() => insertCommand(cmd)} style={{ padding: '10px 6px', background: 'var(--surface-hover)', border: 'none', borderRadius: 8, cursor: 'pointer', color: 'var(--text-sec)', fontSize: 12, fontWeight: 500 }}>
                  {cmd.label}
                </button>
              ))}
            </div>

            <div style={{ fontSize: 10, color: 'var(--text-ter)', fontWeight: 600, letterSpacing: 1, marginBottom: 8 }}>{t('notes.other')}</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6 }}>
              {otherOptions.map((cmd) => (
                <button key={cmd.id} onClick={() => insertCommand(cmd)} style={{ padding: '10px 6px', background: 'var(--surface-hover)', border: 'none', borderRadius: 8, cursor: 'pointer', color: 'var(--text-sec)', fontSize: 12, fontWeight: 500 }}>
                  {cmd.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function NotesApp({ onClose, isSplitMode }) {
  const { t } = useTranslation()
  const [notes, setNotes] = useState([])
  const [archivedNotes, setArchivedNotes] = useState([])
  const [activeId, setActiveId] = useState(null)
  const [search, setSearch] = useState('')
  const [view, setView] = useState('all')
  const [mobileView, setMobileView] = useState('list')
  const [isSaving, setIsSaving] = useState(false)
  const isMobile = useIsMobile()
  
  const animationOptimizer = useAnimationOptimizer({
    defaultDuration: 300,
    lowPowerDuration: 500,
  })
  const { shouldReduceMotion } = animationOptimizer

  useEffect(() => {
    loadNotes()
  }, [])

  const loadNotes = async () => {
    const allNotes = await getNotes()
    setNotes(allNotes.filter(n => !n.archived))
    const archived = await getArchivedNotes()
    setArchivedNotes(archived)
  }

  const activeNote = notes.find(n => n.id === activeId)

  const handleSelect = (note) => {
    setActiveId(note.id)
    if (isMobile) setMobileView('editor')
  }

  const handleBack = () => {
    setActiveId(null)
    if (isMobile) setMobileView('list')
  }

  const handleNew = async () => {
    const newNote = { title: '', body: '', pinned: false, icon: '📝', cover: null }
    const id = await saveNote(newNote)
    const created = { ...newNote, id, updatedAt: Date.now() }
    setNotes(prev => [created, ...prev])
    setActiveId(id)
    if (isMobile) setMobileView('editor')
  }

  const handleSave = async (note, immediate = false) => {
    if (!note) return
    
    if (immediate) {
      setIsSaving(true)
      const updated = { ...note, updatedAt: Date.now(), syncStatus: SYNC_STATUS.PENDING }
      await saveNote(updated)
      setNotes(prev => prev.map(n => n.id === note.id ? updated : n))
      setIsSaving(false)
    } else {
      if (shouldReduceMotion) return
      setTimeout(async () => {
        const updated = { ...note, updatedAt: Date.now(), syncStatus: SYNC_STATUS.PENDING }
        await saveNote(updated)
        setNotes(prev => prev.map(n => n.id === note.id ? updated : n))
      }, 500)
    }
  }

  const handleSaveOptimized = useCallback((note) => {
    handleSave(note, false)
  }, [shouldReduceMotion])

  const handleDelete = async (id) => {
    await deleteNote(id)
    setNotes(prev => prev.filter(n => n.id !== id))
    if (activeId === id) {
      setActiveId(null)
      if (isMobile) setMobileView('list')
    }
  }

  const handleArchive = async (note) => {
    await archiveNote(note.id)
    setNotes(prev => prev.filter(n => n.id !== note.id))
    if (activeId === note.id) {
      setActiveId(null)
      if (isMobile) setMobileView('list')
    }
    loadNotes()
  }

  const displayNotes = view === 'archived' 
    ? archivedNotes 
    : search 
      ? notes.filter(n => 
          n.title.toLowerCase().includes(search.toLowerCase()) || 
          n.body.toLowerCase().includes(search.toLowerCase())
        )
      : view === 'pinned' 
        ? notes.filter(n => n.pinned)
        : notes

  const showSidebar = !isMobile || mobileView === 'list'
  const showEditor = !isMobile || mobileView === 'editor'

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      {showSidebar && (
        <Sidebar
          notes={displayNotes}
          activeId={activeId}
          onSelect={handleSelect}
          onNew={handleNew}
          onDelete={handleDelete}
          onArchive={handleArchive}
          search={search}
          onSearchChange={setSearch}
          view={view}
          onViewChange={setView}
          onClose={onClose}
          isSplitMode={isSplitMode}
        />
      )}
      {showEditor && (
        <Editor
          note={activeNote}
          onSave={handleSaveOptimized}
          onBack={handleBack}
          isMobile={isMobile}
          animationConfig={animationOptimizer.framerMotionConfig()}
        />
      )}
    </div>
  )
}