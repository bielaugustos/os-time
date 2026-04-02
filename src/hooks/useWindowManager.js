import { useCallback, useState } from 'react'

export function useWindowManager() {
  const [stack,     setStack]     = useState([])
  const [activeIdx, setActiveIdx] = useState(0)
  const [launcher,  setLauncher]  = useState(true)

  const openApp = useCallback((id) => {
    setStack(prev => {
      if (prev.includes(id)) { setActiveIdx(prev.indexOf(id)); return prev }
      const next = [...prev, id]
      setActiveIdx(next.length - 1)
      return next
    })
    setLauncher(false)
  }, [])

  const closeApp = useCallback((id) => {
    setStack(prev => {
      const next = prev.filter(x => x !== id)
      setActiveIdx(i => Math.min(i, next.length - 1))
      if (next.length === 0) setLauncher(true)
      return next
    })
  }, [])

  const closeAll    = useCallback(() => { setStack([]); setActiveIdx(0); setLauncher(true) }, [])
  const goNext      = useCallback(() => setActiveIdx(i => (i + 1) % stack.length), [stack.length])
  const goPrev      = useCallback(() => setActiveIdx(i => (i - 1 + stack.length) % stack.length), [stack.length])
  const showLauncher = useCallback(() => setLauncher(true), [])

  return { stack, activeIdx, activeApp: stack[activeIdx] ?? null, launcher, openApp, closeApp, closeAll, goNext, goPrev, showLauncher }
}
