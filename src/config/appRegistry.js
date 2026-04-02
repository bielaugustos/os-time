import { lazy } from 'react'

export const APP_REGISTRY = [
  { id: 'clock',      icon: '◷', color: '#60a5fa', navKey: 'nav.clock',      appKey: 'apps.clock',      component: lazy(() => import('../apps/ClockApp'))      },
  { id: 'notes',      icon: '✦', color: '#a78bfa', navKey: 'nav.notes',      appKey: 'apps.notes',      component: lazy(() => import('../apps/NotesApp'))      },
  { id: 'calculator', icon: '◻', color: '#34d399', navKey: 'nav.calculator', appKey: 'apps.calculator', component: lazy(() => import('../apps/CalculatorApp')) },
  { id: 'settings',   icon: '⊙', color: '#94a3b8', navKey: 'nav.settings',   appKey: 'apps.settings',   component: lazy(() => import('../apps/SettingsApp'))   },
]

export const getApp = (id) => APP_REGISTRY.find(a => a.id === id) ?? null
