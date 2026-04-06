import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { APP_REGISTRY, getApp } from '../config/appRegistry'
import { useTranslation } from 'react-i18next'
import { 
  RiTimeLine,
  RiFileTextLine,
  RiFlashlightLine,
  RiMagicLine,
  RiSettings3Line,
  RiArtboardLine,
} from '@remixicon/react'

function getIconForId(id) {
  switch(id) {
    case 'clock': return RiTimeLine
    case 'notes': return RiFileTextLine
    case 'quadro': return RiArtboardLine
    case 'energy': return RiFlashlightLine
    case 'chat': return RiMagicLine
    case 'settings': return RiSettings3Line
    default: return null
  }
}

export default function AppSelector({ isOpen, currentAppId, onSelect, onClose }) {
  const { t } = useTranslation()

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
        }}
        onClick={onClose}
      >
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          style={{
            width: '100%',
            maxWidth: 500,
            maxHeight: '70vh',
            background: 'var(--surface)',
            borderRadius: '20px 20px 0 0',
            padding: '20px',
            paddingBottom: 'calc(env(safe-area-inset-bottom, 20px) + 20px)',
            overflowY: 'auto',
          }}
        >
          <div style={{
            width: 40,
            height: 4,
            background: 'var(--border)',
            borderRadius: 2,
            margin: '0 auto 20px',
          }} />

          <div style={{
            fontSize: 16,
            fontWeight: 600,
            color: 'var(--text-pri)',
            marginBottom: 16,
            textAlign: 'center',
          }}>
            Tela Dividida
          </div>

          <div style={{
            fontSize: 12,
            color: 'var(--text-ter)',
            marginBottom: 16,
            textAlign: 'center',
          }}>
            Selecione o segundo app para dividir a tela
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 12,
          }}>
            {APP_REGISTRY.map((app) => {
              const Icon = getIconForId(app.id)
              const isSelected = app.id === currentAppId
              const isDisabled = app.disabled || isSelected

              return (
                <motion.button
                  key={app.id}
                  whileHover={!isDisabled ? { scale: 1.05 } : {}}
                  whileTap={!isDisabled ? { scale: 0.95 } : {}}
                  onClick={() => !isDisabled && onSelect(app.id)}
                  disabled={isDisabled}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 8,
                    padding: '16px 12px',
                    borderRadius: 12,
                    border: isSelected 
                      ? `2px solid var(--accent)` 
                      : '1px solid var(--border)',
                    background: isSelected 
                      ? 'var(--accent)20' 
                      : isDisabled 
                        ? 'transparent' 
                        : 'var(--surface-hover)',
                    cursor: isDisabled ? 'not-allowed' : 'pointer',
                    opacity: isDisabled ? 0.4 : 1,
                    fontFamily: 'inherit',
                  }}
                >
                  <div style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: isSelected 
                      ? 'var(--accent)' 
                      : `${app.color}18`,
                    border: `1px solid ${app.color}28`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    {Icon && <Icon size={22} color={isSelected ? '#fff' : 'var(--text-pri)'} />}
                  </div>
                  <span style={{ 
                    fontSize: 11, 
                    color: isSelected ? 'var(--accent)' : 'var(--text-sec)',
                    fontWeight: isSelected ? 600 : 400,
                  }}>
                    {t(app.appKey)}
                  </span>
                </motion.button>
              )
            })}
          </div>

          <button
            onClick={onClose}
            style={{
              width: '100%',
              marginTop: 20,
              padding: '14px 20px',
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
            Cancelar
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
