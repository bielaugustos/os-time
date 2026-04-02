import { useEffect, useState } from 'react'
import { getPeriod, applyTheme } from '../config/theme'

export function useTheme() {
  const [period,   setPeriod]   = useState(() => getPeriod())
  const [override, setOverride] = useState(null)
  const active = override ?? period

  useEffect(() => { applyTheme(active) }, [active])

  useEffect(() => {
    const id = setInterval(() => {
      const next = getPeriod()
      setPeriod(prev => prev.name !== next.name ? next : prev)
    }, 60_000)
    return () => clearInterval(id)
  }, [])

  return { period: active, setOverride, clearOverride: () => setOverride(null) }
}
