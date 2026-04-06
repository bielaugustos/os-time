import React, { useState, useRef, useCallback, useEffect, Suspense } from 'react'
import { motion } from 'framer-motion'
import { getApp } from '../config/appRegistry'
import { RiArrowUpDownLine, RiCloseLine } from '@remixicon/react'

function SplitAppWindow({ appId, onThemeOverride }) {
  const app = getApp(appId)
  
  if (!app) return null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg)' }}>
      <div style={{ flex: 1, overflow: 'hidden', position: 'relative', height: '100%' }}>
        <Suspense fallback={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-ter)', fontSize: 13 }}>
            Carregando...
          </div>
        }>
          <app.component onThemeOverride={onThemeOverride} isSplitMode />
        </Suspense>
      </div>
    </div>
  )
}

export default function SplitView({ leftApp, rightApp, onThemeOverride, onCloseOneApp }) {
  const [position, setPosition] = useState(50)
  const isDragging = useRef(false)
  const dividerRef = useRef(null)

  const handleMouseDown = useCallback((e) => {
    e.preventDefault()
    isDragging.current = true
    document.body.style.cursor = 'ns-resize'
    document.body.style.userSelect = 'none'
  }, [])

  const handleMouseMove = useCallback((e) => {
    if (!isDragging.current || !dividerRef.current) return
    
    const container = dividerRef.current.parentElement
    const rect = container.getBoundingClientRect()
    const y = e.clientY - rect.top
    const percentage = (y / rect.height) * 100
    const clampedPercentage = Math.min(Math.max(percentage, 20), 80)
    setPosition(clampedPercentage)
  }, [])

  const handleMouseUp = useCallback(() => {
    isDragging.current = false
    document.body.style.cursor = ''
    document.body.style.userSelect = ''
  }, [])

  useEffect(() => {
    const divider = dividerRef.current
    if (!divider) return

    const handleTouchMove = (e) => {
      if (!isDragging.current) return
      e.preventDefault()
      const touch = e.touches[0]
      const container = divider.parentElement
      const rect = container.getBoundingClientRect()
      const y = touch.clientY - rect.top
      const percentage = (y / rect.height) * 100
      const clampedPercentage = Math.min(Math.max(percentage, 20), 80)
      setPosition(clampedPercentage)
    }

    divider.addEventListener('touchmove', handleTouchMove, { passive: false })
    
    return () => divider.removeEventListener('touchmove', handleTouchMove)
  }, [])

  return (
    <div 
      style={{ 
        display: 'flex', 
        flexDirection: 'column',
        flex: 1, 
        height: '100%',
        overflow: 'hidden',
      }}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div 
        style={{ 
          flex: `${position}`,
          minHeight: 0,
          overflow: 'hidden',
        }}
      >
        <SplitAppWindow appId={leftApp} onThemeOverride={onThemeOverride} />
      </div>
      
      <div 
        ref={dividerRef}
        onMouseDown={handleMouseDown}
        onTouchStart={handleMouseDown}
        onTouchEnd={handleMouseUp}
        style={{
          height: 40,
          cursor: 'ns-resize',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--surface)',
          borderTop: '1px solid var(--border)',
          borderBottom: '1px solid var(--border)',
          flexShrink: 0,
          touchAction: 'none',
          zIndex: 10,
          gap: 12,
        }}
      >
        <button
          onClick={() => onCloseOneApp(leftApp)}
          title="Fechar app superior"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 12px',
            background: 'var(--surface-hover)',
            borderRadius: 12,
            border: '1px solid var(--border)',
            cursor: 'pointer',
            color: 'var(--text-sec)',
            fontSize: 12,
            transition: 'all .15s',
          }}
        >
          <RiCloseLine size={14} />
        </button>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '4px 12px',
          background: 'var(--surface-hover)',
          borderRadius: 12,
          border: '1px solid var(--border)',
        }}>
          <RiArrowUpDownLine size={14} color="var(--text-ter)" />
        </div>

        <button
          onClick={() => onCloseOneApp(rightApp)}
          title="Fechar app inferior"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 12px',
            background: 'var(--surface-hover)',
            borderRadius: 12,
            border: '1px solid var(--border)',
            cursor: 'pointer',
            color: 'var(--text-sec)',
            fontSize: 12,
            transition: 'all .15s',
          }}
        >
          <RiCloseLine size={14} />
        </button>

      </div>
      
      <div 
        style={{ 
          flex: `${100 - position}`,
          minHeight: 0,
          overflow: 'hidden',
        }}
      >
        <SplitAppWindow appId={rightApp} onThemeOverride={onThemeOverride} />
      </div>
    </div>
  )
}
