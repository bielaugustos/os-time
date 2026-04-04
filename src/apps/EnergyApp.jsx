import React, { useState, useCallback, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'

const GRADIENT = {
  rainbow: ['#ffb3ba', '#ffdfba', '#ffffba', '#baffc9', '#bae1ff', '#b3baff', '#ffbaff'],
  fade: (color, intensity) => {
    const hex = color.replace('#', '')
    let r = parseInt(hex.substring(0, 2), 16)
    let g = parseInt(hex.substring(2, 4), 16)
    let b = parseInt(hex.substring(4, 6), 16)
    r = Math.round(r * (1 - intensity) + 255 * intensity)
    g = Math.round(g * (1 - intensity) + 255 * intensity)
    b = Math.round(b * (1 - intensity) + 255 * intensity)
    return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('')
  }
}

const COLORS = [
  '#000000',
  ...Array.from({ length: 100 }, (_, i) => {
    const colorIndex = i % GRADIENT.rainbow.length
    const intensity = (i % 20) / 20
    return GRADIENT.fade(GRADIENT.rainbow[colorIndex], intensity * 0.5)
  })
]

const TOWER_WIDTH = 80
const TOWER_HEIGHT = 20

export default function EnergyApp() {
  const { t } = useTranslation()
  const [score, setScore] = useState(0)
  const [perfectCount, setPerfectCount] = useState(0)
  const [gameState, setGameState] = useState('idle')
  const [blocks, setBlocks] = useState([])
  const [currentX, setCurrentX] = useState(0)
  const [direction, setDirection] = useState(1)
  const [level, setLevel] = useState(1)
  const [scrollY, setScrollY] = useState(0)
  const [showInstruction, setShowInstruction] = useState(true)

  const currentBlockRef = useRef({ x: 0, w: 4, color: COLORS[0] })
  const baseBlockRef = useRef({ x: 0, w: 4 })
  const colorIndexRef = useRef(0)
  const speedRef = useRef(4)
  const animationRef = useRef(null)
  const directionRef = useRef(1)

  const getColor = (i) => {
    return COLORS[i % COLORS.length]
  }

  const RANGE = 4

  useEffect(() => {
    const animate = () => {
      if (gameState === 'playing') {
        setCurrentX(x => {
          const newX = x + speedRef.current * directionRef.current * 0.016
          const limit = RANGE - currentBlockRef.current.w / 2
          if (newX > limit) {
            directionRef.current = -1
            return limit
          } else if (newX < -limit) {
            directionRef.current = 1
            return -limit
          }
          return newX
        })
      }
      animationRef.current = requestAnimationFrame(animate)
    }
    animate()
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
    }
  }, [gameState])

  const initGame = useCallback(() => {
    setBlocks([])
    setScore(0)
    setPerfectCount(0)
    setLevel(1)
    setScrollY(0)
    setShowInstruction(true)
    colorIndexRef.current = 0

    setTimeout(() => setShowInstruction(false), 5000)
    speedRef.current = 2
    directionRef.current = 1

    const base = { x: 0, w: 4, y: 0, color: getColor(0) }
    baseBlockRef.current = { x: 0, w: 4 }
    setBlocks([base])
    colorIndexRef.current = 1

    const randomColor = COLORS[Math.floor(Math.random() * (COLORS.length - 1)) + 1]
    currentBlockRef.current = { x: 0, w: 4, color: randomColor, movingDir: 'x', y: 1 }
    setCurrentX(0)
  }, [getColor])

  const placeBlock = useCallback(() => {
    const top = blocks[blocks.length - 1] || baseBlockRef.current
    const cb = { ...currentBlockRef.current, x: currentX }
    const topX = top.x
    const cbX = cb.x

    const overlap = cb.w - Math.abs(cbX - topX)
    
    if (overlap <= 0) {
      setGameState('gameover')
      return
    }

    let newW = overlap
    let newX = topX + (cbX - topX) / 2

    if (Math.abs(cbX - topX) < 0.15) {
      newW = top.w
      newX = topX
      setPerfectCount(c => c + 1)
    }

    const newBlock = {
      x: newX,
      w: newW,
      y: blocks.length,
      color: currentBlockRef.current.color
    }

    setBlocks(bs => [...bs, newBlock])
    setScore(s => s + 1)
    setLevel(l => l + 1)

    colorIndexRef.current += 1
    const nextColor = getColor(colorIndexRef.current)
    
    const newDir = currentBlockRef.current.movingDir === 'x' ? 'z' : 'x'
    currentBlockRef.current = { 
      x: 0, 
      w: newW, 
      color: nextColor, 
      movingDir: newDir,
      y: blocks.length + 1
    }
    
    setCurrentX(0)
    speedRef.current = 2 + level * 0.1
    directionRef.current = 1

    if (blocks.length > 0) {
      setScrollY(s => s - TOWER_HEIGHT)
    }
  }, [blocks.length, currentX, level, getColor])

  const handleTap = useCallback(() => {
    if (gameState === 'idle') {
      setGameState('playing')
      initGame()
    } else if (gameState === 'gameover') {
      setGameState('playing')
      initGame()
    } else if (gameState === 'playing') {
      placeBlock()
    }
  }, [gameState, initGame, placeBlock])

  useEffect(() => {
    const handleKey = (e) => {
      if (e.code === 'Space') {
        e.preventDefault()
        handleTap()
      }
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [handleTap])

  useEffect(() => {
    if (gameState === 'idle') {
      setScrollY(0)
    }
  }, [gameState])

  return (
    <div style={{ 
      display:'flex', 
      flexDirection:'column', 
      height:'100%', 
      width:'100%', 
      position:'relative', 
      background:'#1a1a2e',
      cursor: 'pointer',
      userSelect: 'none',
    }}
      onClick={handleTap}
    >
      <div style={{
        position:'absolute',
        top:20,
        left:'50%',
        transform:'translateX(-50%)',
        textAlign:'center',
        zIndex:10,
      }}>
        <div style={{ fontSize:56, fontWeight:700, color:'#fff', fontFamily:'Syne', lineHeight:1 }}>
          {score}
        </div>
        <div style={{ fontSize:10, color:'rgba(255,255,255,0.5)', textTransform:'uppercase', letterSpacing:4, marginTop:4 }}>
          {t('energy.score').toUpperCase()}
        </div>
      </div>

      {perfectCount > 0 && (
        <div style={{
          position:'absolute',
          top:20,
          right:20,
          padding:'10px 16px',
          borderRadius:12,
          background:'rgba(255,255,255,0.08)',
          border:'1px solid rgba(255,255,255,0.15)',
          zIndex:10,
        }}>
          <div style={{ fontSize:10, color:'rgba(255,255,255,0.4)', textTransform:'uppercase', letterSpacing:2 }}>
            {t('energy.best').toUpperCase()}
          </div>
          <div style={{ fontSize:24, fontWeight:700, color:'#f0c040', fontFamily:'Syne', marginTop:2 }}>
            {perfectCount}
          </div>
        </div>
      )}

      <div style={{
        position: 'absolute',
        left: '50%',
        top: `calc(50% - ${scrollY}px)`,
        width: 0,
        height: 0,
        transition: 'top 0.3s ease-out',
      }}>
        {blocks.slice(0, Math.min(100, blocks.length)).map((block, i) => (
          <div key={i} style={{
            position: 'absolute',
            left: block.x * TOWER_WIDTH - (block.w * TOWER_WIDTH) / 2 + TOWER_WIDTH / 2,
            top: -(i * TOWER_HEIGHT) - TOWER_HEIGHT,
            width: block.w * TOWER_WIDTH - 2,
            height: TOWER_HEIGHT - 2,
            background: block.color,
            borderRadius: 4,
            boxShadow: `0 2px 10px ${block.color}40`,
          }}>
            <div style={{
              position: 'absolute',
              top: 2,
              left: 4,
              right: 4,
              height: 3,
              background: 'rgba(255,255,255,0.25)',
              borderRadius: 1,
            }} />
          </div>
        ))}

        {gameState === 'playing' && currentBlockRef.current && (
          <div style={{
            position: 'absolute',
            left: currentX * TOWER_WIDTH - (currentBlockRef.current.w * TOWER_WIDTH) / 2 + TOWER_WIDTH / 2,
            top: -(currentBlockRef.current.y * TOWER_HEIGHT) - TOWER_HEIGHT,
            width: currentBlockRef.current.w * TOWER_WIDTH - 2,
            height: TOWER_HEIGHT - 2,
            background: currentBlockRef.current.color,
            borderRadius: 4,
            boxShadow: `0 0 20px ${currentBlockRef.current.color}60`,
            opacity: 0.9,
          }}>
            <div style={{
              position: 'absolute',
              top: 2,
              left: 4,
              right: 4,
              height: 3,
              background: 'rgba(255,255,255,0.25)',
              borderRadius: 1,
            }} />
          </div>
        )}
      </div>

      {gameState !== 'idle' && (
        <div style={{
          position:'absolute',
          bottom:30,
          left:'50%',
          transform:'translateX(-50%)',
          padding:'12px 24px',
          borderRadius:24,
          background:'rgba(255,255,255,0.15)',
          border:'1px solid rgba(255,255,255,0.3)',
          zIndex:15,
          fontSize:14,
          color:'#fff',
          letterSpacing:2,
          pointerEvents:'none',
          opacity: showInstruction ? 1 : 0,
          transition: 'opacity 0.5s ease-out',
        }}>
          {gameState === 'playing' ? t('energy.instruction') : t('energy.tapToStart')}
        </div>
      )}

      {gameState === 'idle' && (
        <div style={{
          position:'absolute',
          top:0,
          left:0,
          right:0,
          bottom:0,
          display:'flex',
          flexDirection:'column',
          alignItems:'center',
          justifyContent:'center',
          background:'rgba(26,26,46,0.95)',
          zIndex:20,
          gap:16,
        }}>
          <div style={{ fontSize:13, fontWeight:600, color:'#fff', fontFamily:'Syne', letterSpacing:3 }}>
            {t('energy.tapToStart').toUpperCase()}
          </div>
        </div>
      )}

      {gameState === 'gameover' && (
        <div style={{
          position:'absolute',
          top:0,
          left:0,
          right:0,
          bottom:0,
          display:'flex',
          flexDirection:'column',
          alignItems:'center',
          justifyContent:'center',
          background:'rgba(26,26,46,0.95)',
          zIndex:20,
          gap:16,
        }}>
          <div style={{ fontSize:32, fontWeight:700, color:'#fff', fontFamily:'Syne' }}>
            {t('energy.gameOver')}
          </div>
          <div style={{ marginBottom:24 }} />
          <div style={{ fontSize:11, letterSpacing:3, color:'rgba(255,255,255,0.4)', marginBottom:6 }}>
            {t('energy.score').toUpperCase()}
          </div>
          <div style={{ fontSize:64, fontWeight:700, color:'#fff', fontFamily:'Syne', marginBottom:6 }}>
            {score}
          </div>
          <div style={{
            fontSize:14,
            color:'#f0c040',
            letterSpacing:2,
            marginBottom:40,
          }}>
            {perfectCount} {t('energy.best').toUpperCase()}
          </div>
          <div style={{
            fontSize:13,
            letterSpacing:3,
            color:'rgba(255,255,255,0.6)',
            animation:'blink 1.4s infinite',
          }}>
            {t('energy.tapToStart')}
          </div>
        </div>
      )}

      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  )
}