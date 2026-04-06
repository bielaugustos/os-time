import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  RiArrowRightLine, 
  RiCloseLine, 
  RiHandCoinLine,
  RiSmartphoneLine,
  RiDraggable,
  RiLayoutLeftLine
} from '@remixicon/react'

const TUTORIAL_STEPS = [
  {
    id: 'long-press',
    title: 'Pressione e segure',
    description: 'Mantenha o dedo pressionado em qualquer app para criar uma tela dividida',
    Icon: RiHandCoinLine,
  },
  {
    id: 'select-app',
    title: 'Selecione outro app',
    description: 'Escolha o segundo app para dividir a tela',
    Icon: RiSmartphoneLine,
  },
  {
    id: 'resize',
    title: 'Arraste para redimensionar',
    description: 'Use o divisor para ajustar o tamanho dos apps',
    Icon: RiDraggable,
  },
  {
    id: 'exit',
    title: 'Clique para sair',
    description: 'Pressione × no divisor para fechar a tela dividida',
    Icon: RiLayoutLeftLine,
  },
]

export default function GuidedTutorial({ isOpen, onComplete, onSkip }) {
  const [currentStep, setCurrentStep] = useState(0)

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0)
    }
  }, [isOpen])

  const handleNext = () => {
    if (currentStep < TUTORIAL_STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleComplete()
    }
  }

  const handleComplete = () => {
    localStorage.setItem('splitTutorialSeen', 'true')
    onComplete()
  }

  const handleSkip = () => {
    localStorage.setItem('splitTutorialSeen', 'true')
    onSkip()
  }

  if (!isOpen) return null

  const step = TUTORIAL_STEPS[currentStep]
  const progress = ((currentStep + 1) / TUTORIAL_STEPS.length) * 100

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.85)',
          zIndex: 2000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20,
        }}
      >
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          style={{
            background: 'var(--surface)',
            borderRadius: 20,
            padding: 32,
            maxWidth: 340,
            width: '100%',
            textAlign: 'center',
            border: '1px solid var(--border)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
          }}
        >
          <div style={{
            fontSize: 48,
            marginBottom: 16,
            animation: 'bounce 1s infinite',
            color: 'var(--accent)',
          }}>
            <step.Icon size={48} />
          </div>

          <div style={{
            fontSize: 20,
            fontWeight: 600,
            color: 'var(--text-pri)',
            marginBottom: 8,
            fontFamily: 'Syne, sans-serif',
          }}>
            {step.title}
          </div>

          <div style={{
            fontSize: 14,
            color: 'var(--text-sec)',
            lineHeight: 1.5,
            marginBottom: 24,
          }}>
            {step.description}
          </div>

          <div style={{
            display: 'flex',
            gap: 6,
            justifyContent: 'center',
            marginBottom: 24,
          }}>
            {TUTORIAL_STEPS.map((_, i) => (
              <div
                key={i}
                style={{
                  width: i === currentStep ? 24 : 8,
                  height: 8,
                  borderRadius: 4,
                  background: i === currentStep ? 'var(--accent)' : 'var(--border)',
                  transition: 'all 0.3s ease',
                }}
              />
            ))}
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <button
              onClick={handleSkip}
              style={{
                flex: 1,
                padding: '12px 20px',
                borderRadius: 12,
                border: '1px solid var(--border)',
                background: 'transparent',
                color: 'var(--text-sec)',
                fontSize: 14,
                fontWeight: 500,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              Pular
            </button>
            <button
              onClick={handleNext}
              style={{
                flex: 1,
                padding: '12px 20px',
                borderRadius: 12,
                border: 'none',
                background: 'var(--accent)',
                color: '#fff',
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'inherit',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
              }}
            >
              {currentStep < TUTORIAL_STEPS.length - 1 ? (
                <>Próximo <RiArrowRightLine size={16} /></>
              ) : (
                'Começar'
              )}
            </button>
          </div>
        </motion.div>

        <style>{`
          @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-8px); }
          }
        `}</style>
      </motion.div>
    </AnimatePresence>
  )
}

export function isTutorialNeeded() {
  return !localStorage.getItem('splitTutorialSeen')
}

export function resetTutorial() {
  localStorage.removeItem('splitTutorialSeen')
}
