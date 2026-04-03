import React, { useRef, useEffect, useState } from 'react'
import * as THREE from 'three'

export default function EnergyApp() {
  const containerRef = useRef(null)
  const sceneRef = useRef(null)
  const cameraRef = useRef(null)
  const rendererRef = useRef(null)
  const blocksRef = useRef([])
  const currentBlockRef = useRef(null)
  const animationRef = useRef(null)
  const directionRef = useRef(1)
  const speedRef = useRef(0.15)
  const platformRef = useRef(null)
  
  const [score, setScore] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [combo, setCombo] = useState(0)

  useEffect(() => {
    if (!containerRef.current) return

    const scene = new THREE.Scene()
    sceneRef.current = scene

    const camera = new THREE.PerspectiveCamera(45, containerRef.current.clientWidth / containerRef.current.clientHeight, 0.1, 1000)
    camera.position.set(0, 15, 30)
    camera.lookAt(0, 5, 0)
    cameraRef.current = camera

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = true
    containerRef.current.appendChild(renderer.domElement)
    rendererRef.current = renderer

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
    directionalLight.position.set(10, 20, 10)
    directionalLight.castShadow = true
    scene.add(directionalLight)

    const platformGeometry = new THREE.BoxGeometry(8, 1, 8)
    const platformMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 })
    const platform = new THREE.Mesh(platformGeometry, platformMaterial)
    platform.position.y = -0.5
    platform.receiveShadow = true
    scene.add(platform)
    platformRef.current = platform

    const colors = [0x60a5fa, 0xa78bfa, 0x34d399, 0xfbbf24, 0xf87171, 0x2dd4bf]
    
    const blockGeometry = new THREE.BoxGeometry(4, 1, 4)
    const blockMaterial = new THREE.MeshLambertMaterial({ color: colors[0] })
    const firstBlock = new THREE.Mesh(blockGeometry, blockMaterial)
    firstBlock.position.set(0, 0.5, 0)
    firstBlock.castShadow = true
    firstBlock.receiveShadow = true
    scene.add(firstBlock)
    blocksRef.current.push(firstBlock)

    createNewBlock()

    const animate = () => {
      animationRef.current = requestAnimationFrame(animate)
      
      if (currentBlockRef.current && !gameOver) {
        const block = currentBlockRef.current
        const time = Date.now() * 0.001
        const offset = Math.sin(time * 3) * 6
        block.position.x = offset
      }
      
      renderer.render(scene, camera)
    }
    animate()

    const handleResize = () => {
      if (!containerRef.current) return
      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight)
    }
    window.addEventListener('resize', handleResize)

    const handleClick = (e) => {
      if (gameOver) {
        resetGame()
        return
      }
      placeBlock()
    }
    containerRef.current.addEventListener('click', handleClick)
    containerRef.current.addEventListener('touchend', (e) => {
      if (gameOver) {
        resetGame()
        return
      }
      placeBlock()
    }, { passive: false })

    return () => {
      window.removeEventListener('resize', handleResize)
      if (containerRef.current) {
        containerRef.current.removeEventListener('click', handleClick)
      }
      cancelAnimationFrame(animationRef.current)
      renderer.dispose()
    }
  }, [gameOver])

  const createNewBlock = () => {
    const scene = sceneRef.current
    const colors = [0x60a5fa, 0xa78bfa, 0x34d399, 0xfbbf24, 0xf87171, 0x2dd4bf]
    const colorIndex = blocksRef.current.length % colors.length
    
    const blockGeometry = new THREE.BoxGeometry(4, 1, 4)
    const blockMaterial = new THREE.MeshLambertMaterial({ color: colors[colorIndex] })
    const block = new THREE.Mesh(blockGeometry, blockMaterial)
    block.castShadow = true
    block.receiveShadow = true
    scene.add(block)
    
    const lastBlock = blocksRef.current[blocksRef.current.length - 1]
    block.position.y = lastBlock.position.y + 1
    
    currentBlockRef.current = block
    directionRef.current = directionRef.current * -1
  }

  const placeBlock = () => {
    const currentBlock = currentBlockRef.current
    const lastBlock = blocksRef.current[blocksRef.current.length - 1]
    
    if (!currentBlock || !lastBlock) return

    const overlap = 4 - Math.abs(currentBlock.position.x - lastBlock.position.x)
    
    if (overlap <= 0) {
      setGameOver(true)
      return
    }

    const newWidth = overlap
    const newX = (currentBlock.position.x + lastBlock.position.x) / 2
    
    currentBlock.geometry.dispose()
    currentBlock.geometry = new THREE.BoxGeometry(newWidth, 1, 4)
    currentBlock.position.x = newX
    
    blocksRef.current.push(currentBlock)
    
    const accuracy = overlap / 4
    let comboMultiplier = 1
    if (accuracy > 0.95) {
      comboMultiplier = 3
      setCombo(c => c + 1)
    } else if (accuracy > 0.8) {
      comboMultiplier = 2
      setCombo(0)
    } else {
      setCombo(0)
    }
    
    const points = Math.round(10 * accuracy * comboMultiplier)
    setScore(s => s + points)
    
    if (blocksRef.current.length > 1) {
      const camera = cameraRef.current
      const targetY = blocksRef.current[blocksRef.current.length - 1].position.y + 10
      camera.position.y += (targetY - camera.position.y) * 0.3
      camera.lookAt(0, blocksRef.current[blocksRef.current.length - 1].position.y, 0)
    }
    
    createNewBlock()
  }

  const resetGame = () => {
    const scene = sceneRef.current
    blocksRef.current.forEach(block => scene.remove(block))
    blocksRef.current = []
    
    if (currentBlockRef.current) {
      scene.remove(currentBlockRef.current)
      currentBlockRef.current = null
    }
    
    const colors = [0x60a5fa, 0xa78bfa, 0x34d399, 0xfbbf24, 0xf87171, 0x2dd4bf]
    const blockGeometry = new THREE.BoxGeometry(4, 1, 4)
    const blockMaterial = new THREE.MeshLambertMaterial({ color: colors[0] })
    const firstBlock = new THREE.Mesh(blockGeometry, blockMaterial)
    firstBlock.position.set(0, 0.5, 0)
    firstBlock.castShadow = true
    firstBlock.receiveShadow = true
    scene.add(firstBlock)
    blocksRef.current.push(firstBlock)
    
    const camera = cameraRef.current
    camera.position.set(0, 15, 30)
    camera.lookAt(0, 5, 0)
    
    setScore(0)
    setGameOver(false)
    setCombo(0)
    
    createNewBlock()
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', width:'100%' }}>
      <div ref={containerRef} style={{ flex:1, width:'100%', minHeight:0, cursor:'pointer' }} />
      
      <div style={{
        position:'absolute',
        top:20,
        left:20,
        padding:'12px 18px',
        borderRadius:12,
        background:'rgba(0,0,0,0.6)',
        backdropFilter:'blur(8px)',
        border:'1px solid var(--border)',
        zIndex:10,
      }}>
        <div style={{ fontSize:10, color:'var(--text-ter)', textTransform:'uppercase', letterSpacing:1.5, marginBottom:4 }}>
          Score
        </div>
        <div style={{ fontSize:28, fontWeight:700, color:'var(--text-pri)', fontFamily:'Syne' }}>
          {score}
        </div>
        {combo > 0 && (
          <div style={{ fontSize:11, color:'var(--accent)', marginTop:2 }}>
            Combo x{combo}
          </div>
        )}
      </div>

      {gameOver && (
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
          background:'rgba(0,0,0,0.8)',
          backdropFilter:'blur(4px)',
          zIndex:20,
          gap:16,
        }}>
          <div style={{ fontSize:32, fontWeight:700, color:'var(--text-pri)', fontFamily:'Syne' }}>
            Game Over
          </div>
          <div style={{ fontSize:14, color:'var(--text-sec)' }}>
            Final Score: {score}
          </div>
          <button onClick={resetGame} style={{
            padding:'14px 32px',
            borderRadius:10,
            border:'none',
            cursor:'pointer',
            fontFamily:'Syne',
            fontSize:14,
            fontWeight:600,
            background:'var(--accent)',
            color:'#fff',
            transition:'all .15s',
          }} onMouseEnter={e => e.currentTarget.style.opacity = 0.9} onMouseLeave={e => e.currentTarget.style.opacity = 1}>
            Play Again
          </button>
        </div>
      )}

      <div style={{
        position:'absolute',
        bottom:20,
        left:'50%',
        transform:'translateX(-50%)',
        padding:'10px 16px',
        borderRadius:20,
        background:'rgba(0,0,0,0.5)',
        backdropFilter:'blur(8px)',
        border:'1px solid var(--border)',
        zIndex:10,
        fontSize:12,
        color:'var(--text-sec)',
        pointerEvents:'none',
      }}>
        Tap or click to place block
      </div>
    </div>
  )
}
