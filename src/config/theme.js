export const PERIODS = {
  dawn: {
    name: 'dawn', range: [5, 7],
    bg: '#0f0a1a',
    orb: 'radial-gradient(ellipse 70% 50% at 30% 100%, rgba(139,92,246,0.28), transparent)',
    surface: 'rgba(255,255,255,0.04)',
    surfaceHover: 'rgba(255,255,255,0.08)',
    border: 'rgba(255,255,255,0.08)',
    textPri: '#ede8f8', textSec: 'rgba(237,232,248,0.55)', textTer: 'rgba(237,232,248,0.28)',
    accent: '#c084fc', accentDim: 'rgba(192,132,252,0.14)',
    label: { en: 'Dawn', pt: 'Amanhecer', es: 'Amanecer', fr: 'Aube' },
  },
  morning: {
    name: 'morning', range: [7, 12],
    bg: '#f5eedf',
    orb: 'radial-gradient(ellipse 80% 50% at 80% 0%, rgba(255,180,60,0.22), transparent)',
    surface: 'rgba(255,255,255,0.65)',
    surfaceHover: 'rgba(255,255,255,0.88)',
    border: 'rgba(160,120,60,0.18)',
    textPri: '#1a1408', textSec: 'rgba(26,20,8,0.58)', textTer: 'rgba(26,20,8,0.30)',
    accent: '#c2692a', accentDim: 'rgba(194,105,42,0.12)',
    label: { en: 'Morning', pt: 'Manhã', es: 'Mañana', fr: 'Matin' },
  },
  midday: {
    name: 'midday', range: [12, 15],
    bg: '#f8f9fa',
    orb: 'radial-gradient(ellipse 60% 40% at 50% -10%, rgba(100,160,255,0.18), transparent)',
    surface: 'rgba(255,255,255,0.72)',
    surfaceHover: 'rgba(255,255,255,0.95)',
    border: 'rgba(0,0,0,0.08)',
    textPri: '#0d0f12', textSec: 'rgba(13,15,18,0.55)', textTer: 'rgba(13,15,18,0.30)',
    accent: '#0066ff', accentDim: 'rgba(0,102,255,0.10)',
    label: { en: 'Midday', pt: 'Meio-dia', es: 'Mediodía', fr: 'Midi' },
  },
  afternoon: {
    name: 'afternoon', range: [15, 18],
    bg: '#faf4e8',
    orb: 'radial-gradient(ellipse 80% 50% at 90% 40%, rgba(255,140,40,0.25), transparent)',
    surface: 'rgba(255,255,255,0.62)',
    surfaceHover: 'rgba(255,255,255,0.85)',
    border: 'rgba(160,120,60,0.16)',
    textPri: '#18100a', textSec: 'rgba(24,16,10,0.55)', textTer: 'rgba(24,16,10,0.30)',
    accent: '#d4541a', accentDim: 'rgba(212,84,26,0.12)',
    label: { en: 'Afternoon', pt: 'Tarde', es: 'Tarde', fr: 'Après-midi' },
  },
  evening: {
    name: 'evening', range: [18, 21],
    bg: '#090d16',
    orb: 'radial-gradient(ellipse 80% 50% at 15% 90%, rgba(249,115,22,0.22), transparent)',
    surface: 'rgba(255,255,255,0.05)',
    surfaceHover: 'rgba(255,255,255,0.09)',
    border: 'rgba(255,255,255,0.08)',
    textPri: '#e4e8f0', textSec: 'rgba(228,232,240,0.52)', textTer: 'rgba(228,232,240,0.26)',
    accent: '#f97316', accentDim: 'rgba(249,115,22,0.15)',
    label: { en: 'Evening', pt: 'Noite', es: 'Noche', fr: 'Soir' },
  },
  night: {
    name: 'night', range: [21, 5],
    bg: '#000000',
    orb: 'radial-gradient(ellipse 50% 40% at 60% 30%, rgba(60,100,200,0.18), transparent)',
    surface: 'rgba(255,255,255,0.04)',
    surfaceHover: 'rgba(255,255,255,0.08)',
    border: 'rgba(255,255,255,0.07)',
    textPri: '#d0d4e0', textSec: 'rgba(208,212,224,0.50)', textTer: 'rgba(208,212,224,0.25)',
    accent: '#60a5fa', accentDim: 'rgba(96,165,250,0.13)',
    label: { en: 'Night', pt: 'Madrugada', es: 'Noche', fr: 'Nuit' },
  },
}

export function getPeriod(hour = new Date().getHours()) {
  if (hour >= 5  && hour < 7)  return PERIODS.dawn
  if (hour >= 7  && hour < 12) return PERIODS.morning
  if (hour >= 12 && hour < 15) return PERIODS.midday
  if (hour >= 15 && hour < 18) return PERIODS.afternoon
  if (hour >= 18 && hour < 21) return PERIODS.evening
  return PERIODS.night
}

export function applyTheme(period) {
  const r = document.documentElement
  r.style.setProperty('--bg',            period.bg)
  r.style.setProperty('--surface',       period.surface)
  r.style.setProperty('--surface-hover', period.surfaceHover)
  r.style.setProperty('--border',        period.border)
  r.style.setProperty('--text-pri',      period.textPri)
  r.style.setProperty('--text-sec',      period.textSec)
  r.style.setProperty('--text-ter',      period.textTer)
  r.style.setProperty('--accent',        period.accent)
  r.style.setProperty('--accent-dim',    period.accentDim)
}
