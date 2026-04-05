import React, { useState, useRef, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'

const ZOOM_MIN = 0.1
const ZOOM_MAX = 10
const ZOOM_STEP = 0.1

const TOOLS = {
  brush: 'brush',
  eraser: 'eraser',
  line: 'line',
  rectangle: 'rectangle',
  ellipse: 'ellipse',
  select: 'select',
  pan: 'pan',
}

const COLORS = [
  '#000000', '#ffffff', '#ff0000', '#ff8000', '#ffff00', 
  '#00ff00', '#00ffff', '#0000ff', '#8000ff', '#ff00ff',
]

export default function QuadroApp() {
  const { t } = useTranslation()
  const canvasRef = useRef(null)
  const svgRef = useRef(null)
  const containerRef = useRef(null)
  
  const [tool, setTool] = useState(TOOLS.brush)
  const [color, setColor] = useState('#000000')
  const [brushSize, setBrushSize] = useState(3)
  const [mode, setMode] = useState('pixel')
  
  const [scale, setScale] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  
  const [isDrawing, setIsDrawing] = useState(false)
  const [startPoint, setStartPoint] = useState(null)
  const [currentPoint, setCurrentPoint] = useState(null)
  const [paths, setPaths] = useState([])
  const [shapes, setShapes] = useState([])
  
  const [isPanning, setIsPanning] = useState(false)
  const [lastPanPoint, setLastPanPoint] = useState(null)
  
  const [selectedPath, setSelectedPath] = useState(null)
  const [showColorPicker, setShowColorPicker] = useState(false)

  const getCanvasPoint = useCallback((e) => {
    const rect = containerRef.current.getBoundingClientRect()
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY
    const x = (clientX - rect.left - position.x) / scale
    const y = (clientY - rect.top - position.y) / scale
    return { x, y }
  }, [position, scale])

  const handleMouseDown = (e) => {
    if (tool === TOOLS.pan) {
      setIsPanning(true)
      setLastPanPoint({ x: e.clientX, y: e.clientY })
      return
    }

    if (tool === TOOLS.select) {
      const point = getCanvasPoint(e)
      const clickedPath = paths.slice().reverse().find(path => {
        if (path.type !== 'brush') return false
        return path.points.some(p => Math.hypot(p.x - point.x, p.y - point.y) < 10)
      })
      setSelectedPath(clickedPath ? clickedPath.id : null)
      return
    }

    setIsDrawing(true)
    const point = getCanvasPoint(e)
    setStartPoint(point)
    setCurrentPoint(point)

    if (mode === 'pixel' && tool === TOOLS.brush) {
      const newPath = {
        id: Date.now(),
        type: 'brush',
        points: [point],
        color: tool === TOOLS.eraser ? '#ffffff' : color,
        size: tool === TOOLS.eraser ? brushSize * 2 : brushSize,
      }
      setPaths(prev => [...prev, newPath])
    }
  }

  const handleMouseMove = (e) => {
    if (isPanning && lastPanPoint) {
      const dx = e.clientX - lastPanPoint.x
      const dy = e.clientY - lastPanPoint.y
      setPosition(prev => ({ x: prev.x + dx, y: prev.y + dy }))
      setLastPanPoint({ x: e.clientX, y: e.clientY })
      return
    }

    if (!isDrawing) return

    const point = getCanvasPoint(e)
    setCurrentPoint(point)

    if (mode === 'pixel' && tool === TOOLS.brush && startPoint) {
      setPaths(prev => {
        const newPaths = [...prev]
        const lastPath = newPaths[newPaths.length - 1]
        if (lastPath && lastPath.type === 'brush') {
          lastPath.points.push(point)
        }
        return newPaths
      })
    }
  }

  const handleMouseUp = () => {
    if (isPanning) {
      setIsPanning(false)
      setLastPanPoint(null)
      return
    }

    if (!isDrawing || !startPoint || !currentPoint) {
      setIsDrawing(false)
      return
    }

    if (mode === 'svg') {
      const newShape = {
        id: Date.now(),
        type: tool,
        start: { ...startPoint },
        end: { ...currentPoint },
        color,
        size: brushSize,
      }
      setShapes(prev => [...prev, newShape])
    }

    setIsDrawing(false)
    setStartPoint(null)
    setCurrentPoint(null)
  }

  const handleWheel = (e) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP
    const newScale = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, scale + delta))
    
    if (e.ctrlKey || e.metaKey) {
      setScale(newScale)
    } else {
      setPosition(prev => ({
        x: prev.x - e.deltaX,
        y: prev.y - e.deltaY,
      }))
    }
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    ctx.save()
    ctx.translate(position.x, position.y)
    ctx.scale(scale, scale)

    paths.forEach(path => {
      if (path.type !== 'brush') return
      if (path.points.length < 2) return
      
      ctx.beginPath()
      ctx.strokeStyle = path.color
      ctx.lineWidth = path.size
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      
      ctx.moveTo(path.points[0].x, path.points[0].y)
      for (let i = 1; i < path.points.length; i++) {
        ctx.lineTo(path.points[i].x, path.points[i].y)
      }
      ctx.stroke()
    })

    if (isDrawing && startPoint && currentPoint) {
      ctx.strokeStyle = color
      ctx.lineWidth = brushSize
      
      if (tool === TOOLS.line) {
        ctx.beginPath()
        ctx.moveTo(startPoint.x, startPoint.y)
        ctx.lineTo(currentPoint.x, currentPoint.y)
        ctx.stroke()
      } else if (tool === TOOLS.rectangle) {
        const w = currentPoint.x - startPoint.x
        const h = currentPoint.y - startPoint.y
        ctx.strokeRect(startPoint.x, startPoint.y, w, h)
      } else if (tool === TOOLS.ellipse) {
        ctx.beginPath()
        const rx = Math.abs(currentPoint.x - startPoint.x) / 2
        const ry = Math.abs(currentPoint.y - startPoint.y) / 2
        const cx = (startPoint.x + currentPoint.x) / 2
        const cy = (startPoint.y + currentPoint.y) / 2
        ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2)
        ctx.stroke()
      }
    }

    ctx.restore()
  }, [paths, shapes, isDrawing, startPoint, currentPoint, tool, color, brushSize, scale, position])

  const handleZoomIn = () => setScale(s => Math.min(ZOOM_MAX, s + ZOOM_STEP))
  const handleZoomOut = () => setScale(s => Math.max(ZOOM_MIN, s - ZOOM_STEP))
  const handleZoomReset = () => { setScale(1); setPosition({ x: 0, y: 0 }) }

  const handleClear = () => {
    setPaths([])
    setShapes([])
  }

  const handleUndo = () => {
    if (paths.length > 0) {
      setPaths(prev => prev.slice(0, -1))
    } else if (shapes.length > 0) {
      setShapes(prev => prev.slice(0, -1))
    }
  }

  const exportToSVG = () => {
    const svgContent = `
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800">
  <rect width="100%" height="100%" fill="white"/>
  ${paths.map(path => {
    if (path.points.length < 2) return ''
    const d = path.points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
    return `<path d="${d}" stroke="${path.color}" stroke-width="${path.size}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`
  }).join('\n')}
  ${shapes.map(shape => {
    if (shape.type === 'line') {
      return `<line x1="${shape.start.x}" y1="${shape.start.y}" x2="${shape.end.x}" y2="${shape.end.y}" stroke="${shape.color}" stroke-width="${shape.size}"/>`
    } else if (shape.type === 'rectangle') {
      const x = Math.min(shape.start.x, shape.end.x)
      const y = Math.min(shape.start.y, shape.end.y)
      const w = Math.abs(shape.end.x - shape.start.x)
      const h = Math.abs(shape.end.y - shape.start.y)
      return `<rect x="${x}" y="${y}" width="${w}" height="${h}" stroke="${shape.color}" stroke-width="${shape.size}" fill="none"/>`
    } else if (shape.type === 'ellipse') {
      const cx = (shape.start.x + shape.end.x) / 2
      const cy = (shape.start.y + shape.end.y) / 2
      const rx = Math.abs(shape.end.x - shape.start.x) / 2
      const ry = Math.abs(shape.end.y - shape.start.y) / 2
      return `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" stroke="${shape.color}" stroke-width="${shape.size}" fill="none"/>`
    }
    return ''
  }).join('\n')}
</svg>`
    
    const blob = new Blob([svgContent], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'quadro.svg'
    a.click()
    URL.revokeObjectURL(url)
  }

  const ToolButton = ({ id, icon, label }) => (
    <button
      onClick={() => setTool(id)}
      style={{
        width: 36,
        height: 36,
        borderRadius: 8,
        border: '1px solid',
        borderColor: tool === id ? 'var(--accent)' : 'var(--border)',
        background: tool === id ? 'var(--surface-hover)' : 'var(--surface)',
        color: tool === id ? 'var(--accent)' : 'var(--text-sec)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 16,
      }}
      title={label}
    >
      {icon}
    </button>
  )

  return (
    <div style={{ width:'100%', height:'100%', display:'flex', flexDirection:'column', background:'var(--bg)' }}>
      <div style={{
        display:'flex', alignItems:'center', gap:8, padding:'8px 12px',
        borderBottom:'1px solid var(--border)', flexWrap:'wrap',
        background:'var(--surface)',
      }}>
        <div style={{ display:'flex', gap:4 }}>
          <ToolButton id={TOOLS.pan} icon="✋" label={t('quadro.pan')} />
          <ToolButton id={TOOLS.select} icon="⬚" label={t('quadro.select')} />
          <ToolButton id={TOOLS.brush} icon="✎" label={t('quadro.brush')} />
          <ToolButton id={TOOLS.eraser} icon="⌫" label={t('quadro.eraser')} />
        </div>

        <div style={{ width:1, height:24, background:'var(--border)' }} />

        <div style={{ display:'flex', gap:4 }}>
          <ToolButton id={TOOLS.line} icon="╱" label={t('quadro.line')} />
          <ToolButton id={TOOLS.rectangle} icon="▢" label={t('quadro.rectangle')} />
          <ToolButton id={TOOLS.ellipse} icon="○" label={t('quadro.ellipse')} />
        </div>

        <div style={{ width:1, height:24, background:'var(--border)' }} />

        <div style={{ display:'flex', gap:2, alignItems:'center' }}>
          {COLORS.slice(0, 8).map(c => (
            <button
              key={c}
              onClick={() => setColor(c)}
              style={{
                width: 24,
                height: 24,
                borderRadius: 4,
                border: color === c ? '2px solid var(--accent)' : '1px solid var(--border)',
                background: c,
                cursor: 'pointer',
              }}
            />
          ))}
          <button
            onClick={() => setShowColorPicker(!showColorPicker)}
            style={{
              width: 24,
              height: 24,
              borderRadius: 4,
              border: '1px solid var(--border)',
              background: 'linear-gradient(45deg, red, orange, yellow, green, blue, indigo, violet)',
              cursor: 'pointer',
            }}
          />
        </div>

        <div style={{ width:1, height:24, background:'var(--border)' }} />

        <div style={{ display:'flex', alignItems:'center', gap:4 }}>
          <span style={{ fontSize:11, color:'var(--text-ter)' }}>{t('quadro.size')}:</span>
          <input
            type="range"
            min="1"
            max="50"
            value={brushSize}
            onChange={(e) => setBrushSize(Number(e.target.value))}
            style={{ width: 60 }}
          />
          <span style={{ fontSize:11, color:'var(--text-sec)', minWidth:20 }}>{brushSize}</span>
        </div>

        <div style={{ width:1, height:24, background:'var(--border)' }} />

        <div style={{ display:'flex', gap:2 }}>
          <button
            onClick={() => setMode('pixel')}
            style={{
              padding:'4px 8px', borderRadius:6, border:'1px solid',
              borderColor: mode === 'pixel' ? 'var(--accent)' : 'var(--border)',
              background: mode === 'pixel' ? 'var(--surface-hover)' : 'var(--surface)',
              color: mode === 'pixel' ? 'var(--accent)' : 'var(--text-sec)',
              cursor:'pointer', fontSize:11,
            }}
          >
            {t('quadro.pixel')}
          </button>
          <button
            onClick={() => setMode('svg')}
            style={{
              padding:'4px 8px', borderRadius:6, border:'1px solid',
              borderColor: mode === 'svg' ? 'var(--accent)' : 'var(--border)',
              background: mode === 'svg' ? 'var(--surface-hover)' : 'var(--surface)',
              color: mode === 'svg' ? 'var(--accent)' : 'var(--text-sec)',
              cursor:'pointer', fontSize:11,
            }}
          >
            {t('quadro.svg')}
          </button>
        </div>

        <div style={{ flex:1 }} />

        <div style={{ display:'flex', gap:4 }}>
          <button onClick={handleUndo} style={{
            padding:'4px 10px', borderRadius:6, border:'1px solid var(--border)',
            background:'var(--surface)', color:'var(--text-sec)', cursor:'pointer', fontSize:11,
          }}>
            ↶ {t('quadro.undo')}
          </button>
          <button onClick={handleClear} style={{
            padding:'4px 10px', borderRadius:6, border:'1px solid var(--border)',
            background:'var(--surface)', color:'var(--text-sec)', cursor:'pointer', fontSize:11,
          }}>
            {t('quadro.clear')}
          </button>
          <button onClick={exportToSVG} style={{
            padding:'4px 10px', borderRadius:6, border:'1px solid var(--accent)',
            background:'var(--accent)', color:'white', cursor:'pointer', fontSize:11,
          }}>
            {t('quadro.export')}
          </button>
        </div>

        <div style={{ width:1, height:24, background:'var(--border)' }} />

        <div style={{ display:'flex', alignItems:'center', gap:4 }}>
          <button onClick={handleZoomOut} style={{
            width:28, height:28, borderRadius:6, border:'1px solid var(--border)',
            background:'var(--surface)', color:'var(--text-sec)', cursor:'pointer',
            display:'flex', alignItems:'center', justifyContent:'center', fontSize:14,
          }}>−</button>
          <span style={{ fontSize:11, color:'var(--text-sec)', minWidth:45, textAlign:'center' }}>
            {Math.round(scale * 100)}%
          </span>
          <button onClick={handleZoomIn} style={{
            width:28, height:28, borderRadius:6, border:'1px solid var(--border)',
            background:'var(--surface)', color:'var(--text-sec)', cursor:'pointer',
            display:'flex', alignItems:'center', justifyContent:'center', fontSize:14,
          }}>+</button>
          <button onClick={handleZoomReset} style={{
            padding:'4px 8px', borderRadius:6, border:'1px solid var(--border)',
            background:'var(--surface)', color:'var(--text-ter)', cursor:'pointer', fontSize:10,
          }}>reset</button>
        </div>
      </div>

      <div
        ref={containerRef}
        style={{
          flex:1,
          overflow:'hidden',
          cursor: tool === TOOLS.pan ? (isPanning ? 'grabbing' : 'grab') : 
                 tool === TOOLS.brush ? 'crosshair' :
                 tool === TOOLS.eraser ? 'cell' : 'default',
          position:'relative',
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        <canvas
          ref={canvasRef}
          width={1200}
          height={800}
          style={{
            position:'absolute',
            left:0,
            top:0,
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transformOrigin:'0 0',
            background:'white',
            boxShadow:'0 0 20px rgba(0,0,0,0.1)',
          }}
        />
        
        {mode === 'svg' && (
          <svg
            ref={svgRef}
            style={{
              position:'absolute',
              left:0,
              top:0,
              width:1200,
              height:800,
              transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
              transformOrigin:'0 0',
              pointerEvents:'none',
            }}
          >
            {shapes.map(shape => {
              if (shape.type === 'line') {
                return (
                  <line
                    key={shape.id}
                    x1={shape.start.x}
                    y1={shape.start.y}
                    x2={shape.end.x}
                    y2={shape.end.y}
                    stroke={shape.color}
                    strokeWidth={shape.size}
                  />
                )
              } else if (shape.type === 'rectangle') {
                const x = Math.min(shape.start.x, shape.end.x)
                const y = Math.min(shape.start.y, shape.end.y)
                const w = Math.abs(shape.end.x - shape.start.x)
                const h = Math.abs(shape.end.y - shape.start.y)
                return (
                  <rect
                    key={shape.id}
                    x={x}
                    y={y}
                    width={w}
                    height={h}
                    stroke={shape.color}
                    strokeWidth={shape.size}
                    fill="none"
                  />
                )
              } else if (shape.type === 'ellipse') {
                const cx = (shape.start.x + shape.end.x) / 2
                const cy = (shape.start.y + shape.end.y) / 2
                const rx = Math.abs(shape.end.x - shape.start.x) / 2
                const ry = Math.abs(shape.end.y - shape.start.y) / 2
                return (
                  <ellipse
                    key={shape.id}
                    cx={cx}
                    cy={cy}
                    rx={rx}
                    ry={ry}
                    stroke={shape.color}
                    strokeWidth={shape.size}
                    fill="none"
                  />
                )
              }
              return null
            })}
          </svg>
        )}

        <div style={{
          position:'absolute', bottom:12, right:12,
          padding:'6px 10px', borderRadius:8,
          background:'rgba(0,0,0,0.6)', color:'white',
          fontSize:10, display:'flex', gap:8,
          backdropFilter:'blur(4px)',
        }}>
          <span>✋ {t('quadro.pan')}</span>
          <span>🖱️ {t('quadro.draw')}</span>
          <span>⌨️ Ctrl+Scroll {t('quadro.zoom')}</span>
        </div>
      </div>
    </div>
  )
}