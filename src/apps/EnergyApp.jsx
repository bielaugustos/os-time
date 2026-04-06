import React, { useState, useCallback, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { RiCloseLine } from '@remixicon/react'
import * as THREE from 'three'

const RAINBOW = [0xff6b6b, 0xff9f43, 0xfeca57, 0x48dbf0, 0x1dd1a1, 0x5f27cd, 0xe879f9]

const hexToRgb = (hex) => ({ r: (hex >> 16) & 255, g: (hex >> 8) & 255, b: hex & 255 })
const rgbToHex = (r, g, b) => (Math.round(r) << 16) | (Math.round(g) << 8) | Math.round(b)
const lerpColor = (c1, c2, t) => {
  const a = hexToRgb(c1), b = hexToRgb(c2)
  return rgbToHex(a.r + (b.r - a.r) * t, a.g + (b.g - a.g) * t, a.b + (b.b - a.b) * t)
}

const COLORS = Array.from({ length: 120 }, (_, i) => {
  const colorIdx = i % RAINBOW.length
  const nextIdx = (colorIdx + 1) % RAINBOW.length
  const t = (i % 10) / 10
  const base = lerpColor(RAINBOW[colorIdx], RAINBOW[nextIdx], t)
  const rgb = hexToRgb(base)
  const vibrant = {
    r: Math.min(255, rgb.r + Math.round((255 - rgb.r) * 0.35)),
    g: Math.min(255, rgb.g + Math.round((255 - rgb.g) * 0.35)),
    b: Math.min(255, rgb.b + Math.round((255 - rgb.b) * 0.35))
  }
  return rgbToHex(vibrant.r, vibrant.g, vibrant.b)
})

const BLOCK_SIZE = 3
const BLOCK_HEIGHT = 0.5
const SPEED_INITIAL = 0.12
const SPEED_INCREMENT = 0.002
const PERFECT_THRESHOLD = 0.1
const CAMERA_OFFSET = 25

export default function EnergyApp({ onClose, isSplitMode }) {
  const { t } = useTranslation()
  const [score, setScore] = useState(0)
  const [perfectCount, setPerfectCount] = useState(0)
  const [gameState, setGameState] = useState('idle')
  const [showInstruction, setShowInstruction] = useState(true)

  const containerRef = useRef(null)
  const rendererRef = useRef(null)
  const sceneRef = useRef(null)
  const cameraRef = useRef(null)
  const stackRef = useRef([])
  const currentBlockRef = useRef(null)
  const fallingBlocksRef = useRef([])
  const directionRef = useRef('x')
  const speedRef = useRef(SPEED_INITIAL)
  const colorIndexRef = useRef(0)
  const cameraTargetRef = useRef({ x: CAMERA_OFFSET, y: CAMERA_OFFSET, z: CAMERA_OFFSET })
  const perfectFlashRef = useRef(null)
  const gameStateRef = useRef(gameState)

  const getColor = (i) => COLORS[i % COLORS.length]

  useEffect(() => {
    gameStateRef.current = gameState
  }, [gameState])

  useEffect(() => {
    if (!containerRef.current) return

    const container = containerRef.current
    const width = container.clientWidth
    const height = container.clientHeight

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    container.insertBefore(renderer.domElement, container.firstChild)
    rendererRef.current = renderer

    const scene = new THREE.Scene()
    scene.background = null
    renderer.setClearColor(0x000000, 0)
    renderer.setClearAlpha(0)
    scene.fog = new THREE.Fog(0x000000, 20, 60)
    sceneRef.current = scene

    const aspect = width / height
    const frustumSize = 11
    const camera = new THREE.OrthographicCamera(
      -frustumSize * aspect, frustumSize * aspect,
      frustumSize * 0.8, -frustumSize * 0.8,
      0.1, 100
    )
    camera.position.set(CAMERA_OFFSET * 0.4, CAMERA_OFFSET * 0.4, CAMERA_OFFSET * 0.4)
    camera.lookAt(0, -1, 0)
    cameraRef.current = camera

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7)
    scene.add(ambientLight)

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8)
    dirLight.position.set(10, 20, 10)
    dirLight.castShadow = true
    dirLight.shadow.mapSize.width = 1024
    dirLight.shadow.mapSize.height = 1024
    scene.add(dirLight)

    const dirLight2 = new THREE.DirectionalLight(0xffffff, 0.3)
    dirLight2.position.set(-10, 10, -10)
    scene.add(dirLight2)

    const pointLight = new THREE.PointLight(0xffffff, 0.5, 50)
    pointLight.position.set(0, 5, 8)
    scene.add(pointLight)

    let animationId
    const animate = () => {
      animationId = requestAnimationFrame(animate)

      if (gameStateRef.current === 'playing' && currentBlockRef.current && stackRef.current.length > 0) {
        const cb = currentBlockRef.current
        const top = stackRef.current[stackRef.current.length - 1]
        if (!top || !top.mesh) return
        const range = 5

        if (cb.movingDir === 'x') {
          cb.mesh.position.x += speedRef.current * cb.direction
          if (cb.mesh.position.x > top.mesh.position.x + range || cb.mesh.position.x < top.mesh.position.x - range) {
            cb.direction *= -1
          }
        } else {
          cb.mesh.position.z += speedRef.current * cb.direction
          if (cb.mesh.position.z > top.mesh.position.z + range || cb.mesh.position.z < top.mesh.position.z - range) {
            cb.direction *= -1
          }
        }
      }

      fallingBlocksRef.current = fallingBlocksRef.current.filter(fb => {
        fb.vy -= 0.008
        fb.mesh.position.y += fb.vy
        fb.mesh.rotation.x += 0.02
        fb.mesh.rotation.z += 0.015
        if (fb.mesh.position.y < -15) {
          scene.remove(fb.mesh)
          return false
        }
        return true
      })

      const towerHeight = stackRef.current.length * BLOCK_HEIGHT
      let focusY = 1
      
      if (currentBlockRef.current && gameStateRef.current === 'playing') {
        focusY = currentBlockRef.current.mesh.position.y
      } else if (towerHeight > 0) {
        focusY = towerHeight * 0.5
      }
      
      const camX = 8
      const camY = 6 + focusY * 0.8
      const camZ = 8
      
      camera.position.set(camX, camY, camZ)
      camera.lookAt(0, focusY, 0)

      renderer.render(scene, camera)
    }
    animate()

    return () => {
      cancelAnimationFrame(animationId)
      renderer.dispose()
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }
    }
  }, [])

  const initGame = useCallback(() => {
    const scene = sceneRef.current
    if (!scene) return

    stackRef.current.forEach(b => scene.remove(b.mesh))
    if (currentBlockRef.current) scene.remove(currentBlockRef.current.mesh)
    fallingBlocksRef.current.forEach(fb => scene.remove(fb.mesh))
    stackRef.current = []
    currentBlockRef.current = null
    fallingBlocksRef.current = []

    setScore(0)
    setPerfectCount(0)
    setShowInstruction(true)
    setTimeout(() => setShowInstruction(false), 5000)

    speedRef.current = SPEED_INITIAL
    directionRef.current = 'x'
    colorIndexRef.current = 0

    const baseGeo = new THREE.BoxGeometry(BLOCK_SIZE, BLOCK_HEIGHT, BLOCK_SIZE)
    const baseMat = new THREE.MeshStandardMaterial({ 
    color: getColor(0),
    emissive: getColor(0),
    emissiveIntensity: 0.15,
  })
    const baseMesh = new THREE.Mesh(baseGeo, baseMat)
    baseMesh.position.set(0, 0, 0)
    baseMesh.castShadow = true
    baseMesh.receiveShadow = true
    scene.add(baseMesh)
    stackRef.current.push({ mesh: baseMesh, w: BLOCK_SIZE, d: BLOCK_SIZE })

    spawnBlock()
  }, [getColor])

  const spawnBlock = useCallback(() => {
    const scene = sceneRef.current
    if (!scene) return

    const top = stackRef.current[stackRef.current.length - 1]
    const y = top.mesh.position.y + BLOCK_HEIGHT
    const color = getColor(colorIndexRef.current)
    const range = 5

    colorIndexRef.current++

    const geo = new THREE.BoxGeometry(top.w, BLOCK_HEIGHT, top.d)
    const mat = new THREE.MeshStandardMaterial({
      color: color,
      roughness: 0.6,
      metalness: 0,
    })
    const mesh = new THREE.Mesh(geo, mat)

    let x = top.mesh.position.x, z = top.mesh.position.z
    if (directionRef.current === 'x') {
      x = top.mesh.position.x + range
      z = top.mesh.position.z
    } else {
      x = top.mesh.position.x
      z = top.mesh.position.z + range
    }

    mesh.position.set(x, y, z)
    scene.add(mesh)

    currentBlockRef.current = {
      mesh,
      w: top.w,
      d: top.d,
      direction: 1,
      movingDir: directionRef.current
    }

    directionRef.current = directionRef.current === 'x' ? 'z' : 'x'
    speedRef.current = SPEED_INITIAL + stackRef.current.length * SPEED_INCREMENT
  }, [getColor])

  const placeBlock = useCallback(() => {
    if (!currentBlockRef.current) return
    if (stackRef.current.length === 0) return

    const scene = sceneRef.current
    const top = stackRef.current[stackRef.current.length - 1]
    const cb = currentBlockRef.current
    const movingDir = cb.movingDir

    if (!top || !top.mesh) return

    let overlap, offset, newX, newZ, newW, newD

    if (movingDir === 'x') {
      overlap = cb.w - Math.abs(cb.mesh.position.x - top.mesh.position.x)
      if (overlap <= 0) {
        animateGameOver()
        return
      }
      offset = cb.mesh.position.x - top.mesh.position.x
      newW = overlap
      newX = top.mesh.position.x + offset / 2

      if (Math.abs(offset) < PERFECT_THRESHOLD) {
        newW = top.w
        newX = top.mesh.position.x
        showPerfect()
        const cutW = cb.w - top.w
        const cutX = cb.mesh.position.x > top.mesh.position.x 
          ? cb.mesh.position.x + cb.w/2 - cutW/2 
          : cb.mesh.position.x - cb.w/2 + cutW/2
        createFallingBlock(cutX, top.mesh.position.z, cutW, cb.d, top.mesh.position.y)
      } else {
        const cutW = cb.w - overlap
        const cutX = cb.mesh.position.x > top.mesh.position.x 
          ? cb.mesh.position.x + cb.w/2 - cutW/2 
          : cb.mesh.position.x - cb.w/2 + cutW/2
        createFallingBlock(cutX, top.mesh.position.z, cutW, cb.d, top.mesh.position.y)
      }

      newZ = top.mesh.position.z
      newD = cb.d
    } else {
      overlap = cb.d - Math.abs(cb.mesh.position.z - top.mesh.position.z)
      if (overlap <= 0) {
        animateGameOver()
        return
      }
      offset = cb.mesh.position.z - top.mesh.position.z
      newD = overlap
      newZ = top.mesh.position.z + offset / 2

      if (Math.abs(offset) < PERFECT_THRESHOLD) {
        newD = top.d
        newZ = top.mesh.position.z
        showPerfect()
        const cutD = cb.d - top.d
        const cutZ = cb.mesh.position.z > top.mesh.position.z 
          ? cb.mesh.position.z + cb.d/2 - cutD/2 
          : cb.mesh.position.z - cb.d/2 + cutD/2
        createFallingBlock(top.mesh.position.x, cutZ, cb.w, cutD, top.mesh.position.y)
      } else {
        const cutD = cb.d - overlap
        const cutZ = cb.mesh.position.z > top.mesh.position.z 
          ? cb.mesh.position.z + cb.d/2 - cutD/2 
          : cb.mesh.position.z - cb.d/2 + cutD/2
        createFallingBlock(top.mesh.position.x, cutZ, cb.w, cutD, top.mesh.position.y)
      }

      newX = top.mesh.position.x
      newW = cb.w
    }

    scene.remove(cb.mesh)
    const placedGeo = new THREE.BoxGeometry(newW, BLOCK_HEIGHT, newD)
    const placedMat = new THREE.MeshStandardMaterial({ 
      color: cb.mesh.material.color,
      emissive: cb.mesh.material.color,
      emissiveIntensity: 0.15,
      roughness: 0.3,
      metalness: 0.1,
    })
    const placedMesh = new THREE.Mesh(placedGeo, placedMat)
    placedMesh.position.set(newX, cb.mesh.position.y, newZ)
    placedMesh.castShadow = true
    placedMesh.receiveShadow = true
    scene.add(placedMesh)
    stackRef.current.push({ mesh: placedMesh, w: newW, d: newD })

    setScore(s => s + 1)
    spawnBlock()
  }, [spawnBlock])

  const createFallingBlock = (x, z, w, d, y) => {
    const scene = sceneRef.current
    if (!scene) return

    const geo = new THREE.BoxGeometry(w, BLOCK_HEIGHT, d)
    const mat = new THREE.MeshStandardMaterial({ 
      color: currentBlockRef.current?.mesh.material.color || 0xffffff,
      emissive: currentBlockRef.current?.mesh.material.color || 0xffffff,
      emissiveIntensity: 0.1,
    })
    const mesh = new THREE.Mesh(geo, mat)
    mesh.position.set(x, y, z)
    scene.add(mesh)
    fallingBlocksRef.current.push({ mesh, vy: 0 })
  }

  const showPerfect = () => {
    setPerfectCount(c => c + 1)
    if (perfectFlashRef.current) {
      perfectFlashRef.current.style.opacity = '1'
      setTimeout(() => {
        if (perfectFlashRef.current) {
          perfectFlashRef.current.style.transition = 'opacity 0.8s ease-out'
          perfectFlashRef.current.style.opacity = '0'
        }
      }, 3000)
    }
  }

  const animateGameOver = useCallback(() => {
    gameStateRef.current = 'gameover'
    const scene = sceneRef.current
    if (!scene || stackRef.current.length === 0) {
      setGameState('gameover')
      return
    }
    
    const blocksToAnimate = [...stackRef.current].reverse()
    
    if (currentBlockRef.current && currentBlockRef.current.mesh) {
      const currentBlock = currentBlockRef.current
      const shrinkCurrent = () => {
        if (currentBlock.mesh && currentBlock.mesh.scale.x > 0.05) {
          currentBlock.mesh.scale.multiplyScalar(0.7)
          requestAnimationFrame(shrinkCurrent)
        } else if (currentBlock.mesh) {
          scene.remove(currentBlock.mesh)
          currentBlockRef.current = null
          animateStack()
        }
      }
      shrinkCurrent()
    } else {
      animateStack()
    }
    
    function animateStack() {
      let delay = 0
      blocksToAnimate.forEach((block) => {
        setTimeout(() => {
          if (block.mesh) {
            const shrink = () => {
              if (block.mesh && block.mesh.scale.x > 0.05) {
                block.mesh.scale.multiplyScalar(0.7)
                requestAnimationFrame(shrink)
              } else if (block.mesh) {
                scene.remove(block.mesh)
              }
            }
            shrink()
          }
        }, delay)
        delay += 50
      })
      
      setTimeout(() => {
        setGameState('gameover')
      }, delay + 200)
    }
  }, [])

  const handleTap = useCallback(() => {
    if (gameState === 'idle') {
      gameStateRef.current = 'playing'
      setGameState('playing')
      initGame()
    } else if (gameState === 'gameover') {
      gameStateRef.current = 'playing'
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
    if (gameState === 'idle' && sceneRef.current) {
      const scene = sceneRef.current
      stackRef.current.forEach(b => scene.remove(b.mesh))
      if (currentBlockRef.current) scene.remove(currentBlockRef.current.mesh)
      fallingBlocksRef.current.forEach(fb => scene.remove(fb.mesh))
      stackRef.current = []
      currentBlockRef.current = null
      fallingBlocksRef.current = []
    }
  }, [gameState])

  return (
    <div 
      ref={containerRef}
      style={{ 
        height: '100%', 
        width: '100%', 
        position: 'relative', 
        background: 'transparent',
        cursor: 'pointer',
        overflow: 'hidden',
        margin: 0,
        padding: 0,
      }}
      onClick={handleTap}
    >
      {!isSplitMode && (
        <button 
          onClick={(e) => { e.stopPropagation(); onClose() }}
          style={{
            position: 'absolute', top: 12, left: 20, zIndex: 100,
            width: 28, height: 28, borderRadius: 7, border: '1px solid rgba(255,255,255,0.2)',
            background: 'rgba(0,0,0,0.5)', cursor: 'pointer', color: 'var(--text-sec)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all .12s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.7)'; e.currentTarget.style.borderColor = 'var(--accent)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.5)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)' }}
        >
          <RiCloseLine size={14} />
        </button>
      )}

      {gameState !== 'idle' && (
      <div style={{
        position:'absolute',
        top: 20,
        left: '50%',
        transform: 'translateX(-50%)',
        textAlign: 'center',
        zIndex: 10,
        pointerEvents: 'none',
      }}>
        <div style={{ fontSize: 56, fontWeight: 700, fontFamily: 'Syne', lineHeight: 1, color: 'var(--text-pri)' }}>
          {score}
        </div>
        <div style={{ fontSize: 10, color: 'var(--text-sec)', textTransform: 'uppercase', letterSpacing: 4, marginTop: 4 }}>
          {t('energy.score').toUpperCase()}
        </div>
      </div>
      )}

      {gameState !== 'idle' && perfectCount > 0 && (
        <div style={{
          position: 'absolute',
          top: 20,
          right: 20,
          padding: '10px 16px',
          borderRadius: 12,
          background: 'rgba(255,255,255,0.1)',
          border: '1px solid rgba(255,255,255,0.15)',
          zIndex: 10,
          pointerEvents: 'none',
        }}>
          <div style={{ fontSize: 10, color: 'var(--text-sec)', textTransform: 'uppercase', letterSpacing: 2 }}>
            {t('energy.best').toUpperCase()}
          </div>
          <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--accent)', fontFamily: 'Syne', marginTop: 2 }}>
            {perfectCount}
          </div>
        </div>
      )}

      <div ref={perfectFlashRef} style={{
        position: 'absolute',
        top: 95,
        left: '50%',
        transform: 'translateX(-50%)',
        fontSize: 14,
        fontWeight: 700,
        letterSpacing: 4,
        color: 'var(--accent)',
        opacity: 0,
        pointerEvents: 'none',
        transition: 'opacity 0.15s ease-in',
        zIndex: 20,
        fontFamily: 'Syne',
      }}>
        {t('energy.perfect')}
      </div>

      {gameState !== 'idle' && (
        <div style={{
          position:'absolute',
          bottom: 30,
          left: '50%',
          transform: 'translateX(-50%)',
          padding: '12px 24px',
          borderRadius: 24,
          background: 'rgba(255,255,255,0.1)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.15)',
          zIndex: 15,
          color: 'var(--text-sec)',
          fontSize: 14,
          letterSpacing: 2,
          pointerEvents: 'none',
          opacity: showInstruction ? 1 : 0,
          transition: 'opacity 0.5s ease-out',
        }}>
          {gameState === 'playing' ? t('energy.instruction') : t('energy.tapToStart')}
        </div>
      )}

      {gameState === 'idle' && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(255,255,255,0.12)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          zIndex: 20,
          gap: 12,
          cursor: 'pointer',
        }}>
          <div style={{ fontSize: 13, fontWeight: 600, fontFamily: 'Syne', letterSpacing: 3, color: 'var(--text-pri)' }}>
            {t('energy.tapToStart').toUpperCase()}
          </div>
        </div>
      )}

      {gameState === 'gameover' && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(255,255,255,0.12)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          zIndex: 20,
          gap: 12,
          cursor: 'pointer',
        }}>
          <div style={{ fontSize: 28, fontWeight: 700, fontFamily: 'Syne', color: 'var(--text-pri)' }}>
            {t('energy.gameOver')}
          </div>
          <div style={{ marginBottom: 16 }} />
          <div style={{ fontSize: 10, letterSpacing: 3, color: 'var(--text-sec)', marginBottom: 4 }}>
            {t('energy.score').toUpperCase()}
          </div>
          <div style={{ fontSize: 48, fontWeight: 700, fontFamily: 'Syne', marginBottom: 4, color: 'var(--text-pri)' }}>
            {score}
          </div>
          <div style={{
            fontSize: 12,
            color: 'var(--accent)',
            letterSpacing: 2,
            marginBottom: 32,
          }}>
            {perfectCount} {t('energy.perfect')}
          </div>
          <div style={{
            fontSize: 12,
            letterSpacing: 3,
            color: 'var(--text-sec)',
            animation: 'blink 1.4s infinite',
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
        #energy-canvas {
          margin: 0 !important;
          padding: 0 !important;
        }
      `}</style>
    </div>
  )
}