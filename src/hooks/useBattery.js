import { useState, useEffect, useCallback, useRef } from 'react'

const BATTERY_SAVER_THRESHOLD = 0.2
const LOW_POWER_ANIMATION_DURATION = 500

export function useBatteryOptimization() {
  const [batteryInfo, setBatteryInfo] = useState({
    level: 1,
    charging: true,
    saveMode: false,
    supported: false,
  })

  const [resourceMode, setResourceMode] = useState('high')

  useEffect(() => {
    const updateBattery = async () => {
      if ('getBattery' in navigator) {
        try {
          const battery = await navigator.getBattery()
          
          const updateInfo = () => {
            const level = battery.level
            const charging = battery.charging
            const saveMode = !charging && level <= BATTERY_SAVER_THRESHOLD
            
            setBatteryInfo({
              level,
              charging,
              saveMode,
              supported: true,
            })

            if (saveMode) {
              setResourceMode('low')
            } else if (level > 0.5 || charging) {
              setResourceMode('high')
            } else {
              setResourceMode('medium')
            }
          }

          updateInfo()
          battery.addEventListener('levelchange', updateInfo)
          battery.addEventListener('chargingchange', updateInfo)
        } catch (e) {
          console.log('Battery API not fully supported')
        }
      }
    }

    updateBattery()
  }, [])

  const shouldReduceMotion = useCallback(() => {
    if (!batteryInfo.supported) {
      const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      return prefersReduced || resourceMode === 'low'
    }
    return batteryInfo.saveMode || resourceMode === 'low'
  }, [batteryInfo, resourceMode])

  const shouldReduceQuality = useCallback(() => {
    return resourceMode === 'low' || (resourceMode === 'medium' && !batteryInfo.charging)
  }, [resourceMode, batteryInfo])

  return {
    batteryInfo,
    resourceMode,
    shouldReduceMotion,
    shouldReduceQuality,
    isLowPower: batteryInfo.saveMode,
  }
}

export function useIdleDetection(onIdle, onActive, idleTimeout = 120000) {
  const timerRef = useRef(null)
  const [isIdle, setIsIdle] = useState(false)

  const resetTimer = useCallback(() => {
    setIsIdle(false)
    if (timerRef.current) clearTimeout(timerRef.current)
    
    timerRef.current = setTimeout(() => {
      setIsIdle(true)
      onIdle?.()
    }, idleTimeout)
  }, [onIdle, idleTimeout])

  useEffect(() => {
    const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart']
    
    events.forEach(event => {
      document.addEventListener(event, resetTimer, { passive: true })
    })

    resetTimer()

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, resetTimer)
      })
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [resetTimer])

  return isIdle
}

export function useVisibilityOptimization() {
  const [isVisible, setIsVisible] = useState(true)
  const [lastActive, setLastActive] = useState(Date.now())

  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) {
        setIsVisible(false)
      } else {
        setIsVisible(true)
        setLastActive(Date.now())
      }
    }

    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [])

  return {
    isVisible,
    lastActive,
    isBackground: !isVisible,
  }
}

export function useAnimationOptimizer(options = {}) {
  const {
    defaultDuration = 300,
    lowPowerDuration = 500,
    disableSpring = false,
  } = options

  const { shouldReduceMotion, isLowPower } = useBatteryOptimization()

  const getDuration = useCallback((baseDuration = defaultDuration) => {
    if (shouldReduceMotion) return 0
    if (isLowPower) return lowPowerDuration
    return baseDuration
  }, [shouldReduceMotion, isLowPower, defaultDuration, lowPowerDuration])

  const getTransition = useCallback((baseTransition = {}) => {
    if (shouldReduceMotion) {
      return { duration: 0 }
    }
    
    if (disableSpring) {
      return {
        ...baseTransition,
        duration: getDuration(baseTransition.duration),
      }
    }

    return {
      ...baseTransition,
      duration: baseTransition.duration ? getDuration(baseTransition.duration) : undefined,
    }
  }, [shouldReduceMotion, disableSpring, getDuration])

  const framerMotionConfig = useCallback((config = {}) => {
    if (shouldReduceMotion) {
      return { 
        ...config, 
        type: 'tween', 
        ease: 'easeOut', 
        duration: 0 
      }
    }

    if (isLowPower) {
      return {
        ...config,
        type: 'tween',
        ease: 'easeOut',
        duration: lowPowerDuration / 1000,
      }
    }

    return config
  }, [shouldReduceMotion, isLowPower, lowPowerDuration])

  return {
    shouldReduceMotion,
    getDuration,
    getTransition,
    framerMotionConfig,
    isOptimized: shouldReduceMotion || isLowPower,
  }
}

export function useLazyLoad(options = {}) {
  const {
    threshold = 0.1,
    rootMargin = '50px',
    enabled = true,
  } = options

  const [isLoaded, setIsLoaded] = useState(false)
  const [isInView, setIsInView] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!enabled || isLoaded) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsInView(true)
          setIsLoaded(true)
          observer.disconnect()
        }
      },
      { threshold, rootMargin }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [enabled, isLoaded, threshold, rootMargin])

  return { ref, isLoaded, isInView }
}

export function useDeferredRender(delay = 100) {
  const [shouldRender, setShouldRender] = useState(false)
  const { isVisible } = useVisibilityOptimization()

  useEffect(() => {
    if (!isVisible) {
      const timer = setTimeout(() => setShouldRender(false), delay)
      return () => clearTimeout(timer)
    }

    const timer = setTimeout(() => setShouldRender(true), delay)
    return () => clearTimeout(timer)
  }, [isVisible, delay])

  return shouldRender
}

export { useBatteryOptimization as default }