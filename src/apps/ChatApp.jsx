import React, { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { RiChat3Line, RiCloseLine } from '@remixicon/react'

const INTENT_PATTERNS = [
  {
    keywords: ['registration', 'sign up', 'register', 'criar', 'cadastro', 'formulário', 'inscrição'],
    template: 'registration',
    type: 'form'
  },
  {
    keywords: ['login', 'sign in', 'entrar', 'acesso', 'logar'],
    template: 'login',
    type: 'form'
  },
  {
    keywords: ['todo', 'tarefa', 'lista', 'tarefas', 'to-do', 'checklist'],
    template: 'todo',
    type: 'todo'
  },
  {
    keywords: ['weather', 'clima', 'previsão', 'meteo', 'tempo'],
    template: 'weather',
    type: 'weather'
  },
  {
    keywords: ['profile', 'perfil', 'usuário', 'usuario', 'account'],
    template: 'profile',
    type: 'profile'
  },
  {
    keywords: ['statistic', 'dashboard', 'chart', 'analytics', 'estatística', 'gráfico', 'dados'],
    template: 'stats',
    type: 'stats'
  },
]

export default function ChatApp({ onClose, isSplitMode }) {
  const { t } = useTranslation()
  const [messages, setMessages] = useState([{ type: 'ai', content: t('chat.intro') }])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [generatedUI, setGeneratedUI] = useState(null)
  const messagesEndRef = useRef(null)
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }
  
  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping, generatedUI])
  
  const detectIntent = (text) => {
    const lower = text.toLowerCase()
    console.log('Detecting intent for:', lower)
    
    for (const pattern of INTENT_PATTERNS) {
      if (pattern.keywords.some(keyword => lower.includes(keyword))) {
        console.log('Intent matched:', pattern.template, 'Keywords:', pattern.keywords)
        return pattern
      }
    }
    console.log('No intent matched')
    return null
  }
  
  const processMessage = async (userMessage) => {
    setIsTyping(true)
    setGeneratedUI(null)
    
    await new Promise(resolve => setTimeout(resolve, 600 + Math.random() * 800))
    
    const intent = detectIntent(userMessage)
    console.log('Intent detected:', intent)
    
    if (intent) {
      setGeneratedUI({ type: intent.type, template: intent.template })
      setMessages(prev => [...prev, { 
        type: 'ai', 
        content: t(`chat.${intent.template}Created`)
      }])
      console.log('Generating UI for template:', intent.template)
    } else {
      setMessages(prev => [...prev, { 
        type: 'ai', 
        content: t('chat.unknownRequest', { request: userMessage })
      }])
    }
    
    setIsTyping(false)
  }
  
  const handleSend = (content) => {
    if (!content.trim()) return
    
    setMessages(prev => [...prev, { type: 'user', content }])
    setInputValue('')
    processMessage(content)
  }
  
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend(inputValue)
    }
  }
  
  const renderGeneratedUI = () => {
    if (!generatedUI) return null
    
    const TemplateComponents = {
      form: FormTemplate,
      todo: TodoTemplate,
      weather: WeatherTemplate,
      profile: ProfileTemplate,
      stats: StatsTemplate,
    }
    
    const Component = TemplateComponents[generatedUI.type]
    return Component ? <Component /> : null
  }
  
  return (
    <div style={{ 
      display:'flex', 
      flexDirection:'column', 
      height:'100%',
      background:'var(--bg)',
    }}>
      {!isSplitMode && (
        <div style={{ 
          display:'flex', 
          alignItems:'center',
          padding:'12px 20px', 
          borderBottom:'1px solid var(--border)',
          background:'var(--surface)',
        }}>
          <button 
            onClick={onClose}
            style={{
              width:28, height:28, borderRadius:7, border:'1px solid var(--border)',
              background:'var(--surface)', cursor:'pointer', color:'var(--text-sec)',
              display:'flex', alignItems:'center', justifyContent:'center',
              transition:'all .12s', flexShrink:0,
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface-hover)'; e.currentTarget.style.borderColor = 'var(--accent)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--surface)'; e.currentTarget.style.borderColor = 'var(--border)' }}
          >
            <RiCloseLine size={14} />
          </button>
        </div>
      )}
      <div style={{ 
        flex:1,
        overflowY:'auto',
        padding: isSplitMode ? '12px 20px' : '20px',
      }}>
        <div style={{ 
          textAlign:'center',
          padding:'40px 20px',
          marginBottom:24,
          background:'var(--surface)',
          border:'1px solid var(--border)',
          borderRadius:12,
        }}>
          <div style={{ fontSize: 48, marginBottom:16 }}><RiChat3Line size={48} color="var(--accent)" /></div>
          <div style={{ fontSize: 18, color:'var(--text-sec)', marginBottom:8 }}>
            {t('chat.placeholder')}
          </div>
          <div style={{ fontSize: 13, color:'var(--text-ter)' }}>
            {t('chat.examplesPrompt')}
          </div>
        </div>
          
          <div style={{ fontSize:12, color:'var(--text-ter)', textTransform:'uppercase', letterSpacing:1.5, fontWeight:600, marginBottom:12, padding:'20px 0 10px' }}>
            {t('chat.examplesTitle')}
          </div>
          
          {messages.length === 0 && (
            <div style={{ 
              padding:'16px',
              borderRadius:10,
              background:'var(--surface-hover)',
              border:'1px solid var(--border)',
            }}>
              <div style={{ marginBottom:8 }}>
                <div style={{ fontSize:13, color:'var(--text-pri)', marginBottom:4 }}>
                  {t('chat.examplesPrompt')}
                </div>
                <div style={{ fontSize:12, color:'var(--text-ter)' }}>
                  {t('chat.examplesAI')}
                </div>
              </div>
              <div>
                <div style={{ fontSize:13, color:'var(--text-pri)', marginBottom:4 }}>
                  {t('chat.examplesPrompt2')}
                </div>
                <div style={{ fontSize:12, color:'var(--text-ter)' }}>
                  {t('chat.examplesAI2')}
                </div>
              </div>
            </div>
          )}
          
          {messages.map((msg, idx) => (
            <div key={idx} style={{
              display:'flex',
              justifyContent: msg.type === 'user' ? 'flex-end' : 'flex-start',
              marginBottom:20,
            }}>
              <div style={{
                maxWidth:'85%',
                display:'flex',
                flexDirection:'column',
                gap:8,
              }}>
                <div style={{
                  padding:'14px 18px',
                  borderRadius:16,
                  background: msg.type === 'user' ? 'var(--accent)' : 'var(--surface)',
                  color: msg.type === 'user' ? '#fff' : 'var(--text-pri)',
                  borderBottomRightRadius: msg.type === 'user' ? 4 : 16,
                  borderBottomLeftRadius: msg.type === 'user' ? 16 : 4,
                  border: msg.type === 'user' ? 'none' : '1px solid var(--border)',
                  whiteSpace:'pre-wrap',
                  lineHeight:1.6,
                  fontSize:14,
                }}>
                  {msg.content}
                </div>
                {msg.type === 'ai' && idx === messages.length - 1 && renderGeneratedUI()}
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div style={{
              display:'flex',
              justifyContent:'flex-start',
              marginBottom:20,
            }}>
              <div style={{
                padding:'14px 18px',
                borderRadius:16,
                background:'var(--surface)',
                border:'1px solid var(--border)',
                borderBottomLeftRadius:4,
                color:'var(--text-ter)',
                fontSize:14,
                display:'flex',
                gap:4,
                alignItems:'center',
              }}>
                <span style={{ animation:'pulse 1.5s infinite' }}>●</span>
                <span style={{ animation:'pulse 1.5s infinite 0.2s' }}>●</span>
                <span style={{ animation:'pulse 1.5s infinite 0.4s' }}>●</span>
                <style>{`
                  @keyframes pulse {
                    0%, 100% { opacity: 0.3; }
                    50% { opacity: 1; }
                  }
                `}</style>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
        
        <div style={{
          padding:'16px 20px',
          borderTop:'1px solid var(--border)',
          background:'var(--surface)',
        }}>
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('chat.placeholder')}
            rows={1}
            style={{
              width:'100%',
              padding:'12px 16px',
              borderRadius:12,
              border:'1px solid var(--border)',
              background:'var(--surface-hover)',
              color:'var(--text-pri)',
              fontFamily:'inherit',
              fontSize:14,
              resize:'none',
              outline:'none',
              minHeight:48,
              maxHeight:150,
              transition:'border-color 0.2s',
            }}
            onFocus={e => e.currentTarget.style.borderColor = 'var(--accent)'}
            onBlur={e => e.currentTarget.style.borderColor = 'var(--border)'}
          />
          <button
            onClick={() => handleSend(inputValue)}
            disabled={!inputValue.trim()}
            style={{
              marginTop:12,
              padding:'12px 24px',
              borderRadius:12,
              border:'none',
              cursor:'pointer',
              fontFamily:'Syne',
              fontSize:14,
              fontWeight:600,
              background:'var(--accent)',
              color:'#fff',
              transition:'all .15s',
              opacity: inputValue.trim() ? 1 : 0.5,
              minWidth:90,
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = inputValue.trim() ? 0.9 : 0.5}
            onMouseLeave={e => e.currentTarget.style.opacity = inputValue.trim() ? 1 : 0.5}
          >
            {t('chat.send')}
          </button>
        </div>
    </div>
  )
}

function FormTemplate() {
  const { t } = useTranslation()
  const [values, setValues] = useState({})
  
  return (
    <div style={{ marginTop:12, background:'var(--surface)', border:'1px solid var(--border)', borderRadius:12, padding:16 }}>
      <div style={{ fontSize:12, color:'var(--text-ter)', marginBottom:8, textTransform:'uppercase', letterSpacing:1.5, fontWeight:600 }}>
        {t('chat.placeholder')}
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
        {[
          { label: t('clock.hours'), type: 'text', placeholder: 'John Doe' },
          { label: 'Email', type: 'email', placeholder: 'john@example.com' },
          { label: 'Password', type: 'password', placeholder: '•••••••••' },
          { label: 'Confirm', type: 'password', placeholder: '•••••••••' },
        ].map((field, idx) => (
          <div key={idx} style={{ display:'flex', flexDirection:'column', gap:4 }}>
            <label style={{ fontSize:12, color:'var(--text-sec)', fontWeight:500 }}>
              {field.label}
            </label>
            <input
              type={field.type}
              placeholder={field.placeholder}
              value={values[idx] || ''}
              onChange={(e) => setValues({ ...values, [idx]: e.target.value })}
              style={{
                padding:'10px 12px',
                borderRadius:8,
                border:'1px solid var(--border)',
                background:'var(--surface-hover)',
                color:'var(--text-pri)',
                fontFamily:'inherit',
                fontSize:13,
                outline:'none',
              }}
              onFocus={e => e.currentTarget.style.borderColor = 'var(--accent)'}
              onBlur={e => e.currentTarget.style.borderColor = 'var(--border)'}
            />
          </div>
        ))}
      </div>
      <div style={{ display:'flex', gap:8, marginTop:16 }}>
        <button style={{
          flex:1,
          padding:'10px 16px',
          borderRadius:8,
          border:'none',
          background:'var(--accent)',
          color:'#fff',
          fontSize:13,
          fontWeight:600,
          fontFamily:'Syne',
          cursor:'pointer',
        }}>
          {t('shortcuts.home')}
        </button>
        <button style={{
          flex:1,
          padding:'10px 16px',
          borderRadius:8,
          border:'1px solid var(--border)',
          background:'transparent',
          color:'var(--text-sec)',
          fontSize:13,
          fontWeight:500,
          fontFamily:'Syne',
          cursor:'pointer',
        }}>
          Cancel
        </button>
      </div>
    </div>
  )
}

function TodoTemplate() {
  const [items, setItems] = useState([
    { id: 1, text: 'Revisar requisitos', completed: false },
    { id: 2, text: 'Criar wireframes', completed: false },
    { id: 3, text: 'Criar mockups', completed: true },
    { id: 4, text: 'Implementar recursos', completed: false },
    { id: 5, text: 'Testar e publicar', completed: false },
  ])
  const completedCount = items.filter(i => i.completed).length
  
  return (
    <div style={{ marginTop:12, background:'var(--surface)', border:'1px solid var(--border)', borderRadius:12, padding:16 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
        <div style={{ fontSize:12, color:'var(--text-ter)', textTransform:'uppercase', letterSpacing:1.5, fontWeight:600 }}>
          Lista de Tarefas
        </div>
        <div style={{ fontSize:12, color:'var(--accent)', fontWeight:500 }}>
          {completedCount}/{items.length} concluídas
        </div>
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
        <input
          type="text"
          placeholder="Adicionar nova tarefa..."
          style={{
            width:'100%',
            padding:'10px 12px',
            borderRadius:8,
            border:'1px solid var(--border)',
            background:'var(--surface-hover)',
            color:'var(--text-pri)',
            fontFamily:'inherit',
            fontSize:13,
            outline:'none',
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              if (e.target.value.trim()) {
                setItems([...items, { id: Date.now(), text: e.target.value, completed: false }])
                e.target.value = ''
              }
            }
          }}
        />
        {items.map(item => (
          <div key={item.id} style={{
            display:'flex',
            alignItems:'center',
            gap:10,
            padding:'10px 12px',
            borderRadius:8,
            background:item.completed ? 'var(--surface-hover)' : 'var(--surface)',
            border:item.completed ? '1px dashed var(--border)' : '1px solid var(--border)',
            transition:'all .2s',
          }}>
            <input
              type="checkbox"
              checked={item.completed}
              onChange={() => setItems(items.map(i => i.id === item.id ? { ...i, completed: !i.completed } : i))}
              style={{ width:16, height:16, cursor:'pointer' }}
            />
            <span style={{ 
              flex:1, 
              fontSize:13, 
              color:item.completed ? 'var(--text-ter)' : 'var(--text-pri)',
              textDecoration:item.completed ? 'line-through' : 'none',
            }}>
              {item.text}
            </span>
            <button
              onClick={() => setItems(items.filter(i => i.id !== item.id))}
              style={{
                padding:'4px 8px',
                borderRadius:4,
                border:'none',
                background:'transparent',
                color:'var(--text-ter)',
                cursor:'pointer',
                fontSize:12,
              }}
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

function WeatherTemplate() {
  const template = {
    location: 'New York, NY',
    current: {
      temp: 72,
      condition: 'Partly Cloudy',
      humidity: 65,
      wind: 12,
      icon: '⛅'
    },
    forecast: [
      { day: 'Mon', icon: '☀️', high: 75, low: 62 },
      { day: 'Tue', icon: '🌤️', high: 73, low: 60 },
      { day: 'Wed', icon: '🌧️', high: 68, low: 58 },
      { day: 'Thu', icon: '⛈️', high: 65, low: 55 },
      { day: 'Fri', icon: '☀️', high: 70, low: 59 },
    ]
  }
  const maxValue = Math.max(...template.forecast.map(d => d.high))
  
  return (
    <div style={{ marginTop:12, background:'var(--surface)', border:'1px solid var(--border)', borderRadius:12, padding:16 }}>
      <div style={{ fontSize:12, color:'var(--text-ter)', marginBottom:12, textTransform:'uppercase', letterSpacing:1.5, fontWeight:600 }}>
        Dashboard de Clima
      </div>
      
      <div style={{ display:'flex', gap:20, marginBottom:16, padding:'16px', borderRadius:8, background:'var(--surface-hover)' }}>
        <div style={{ fontSize:48, lineHeight:1 }}>{template.current.icon}</div>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:36, fontWeight:300, color:'var(--text-pri)', fontFamily:'Syne', marginBottom:4 }}>
            {template.current.temp}°F
          </div>
          <div style={{ fontSize:14, color:'var(--text-sec)', marginBottom:8 }}>
            {template.current.condition}
          </div>
          <div style={{ display:'flex', gap:12, fontSize:12, color:'var(--text-ter)' }}>
            <span>💧 {template.current.humidity}%</span>
            <span>💨 {template.current.wind} mph</span>
          </div>
        </div>
      </div>
      
      <div style={{ fontSize:11, color:'var(--text-ter)', marginBottom:8, textTransform:'uppercase', letterSpacing:1, fontWeight:600 }}>
        Previsão de 5 Dias
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:8 }}>
        {template.forecast.map((day, idx) => (
          <div key={idx} style={{
            padding:'12px 8px',
            borderRadius:8,
            background:'var(--surface-hover)',
            textAlign:'center',
          }}>
            <div style={{ fontSize:12, color:'var(--text-ter)', marginBottom:4 }}>{day.day}</div>
            <div style={{ fontSize:24, marginBottom:4 }}>{day.icon}</div>
            <div style={{ fontSize:12, fontWeight:600, color:'var(--text-pri)' }}>
              {day.high}°
            </div>
            <div style={{ fontSize:11, color:'var(--text-ter)' }}>{day.low}°</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ProfileTemplate() {
  const template = {
    user: {
      name: 'Sarah Johnson',
      username: '@sarahjohnson',
      bio: 'UI/UX Designer • Building beautiful interfaces ✨',
      avatar: '👩‍💻',
      stats: { followers: 2847, following: 542, posts: 156 },
      verified: true
    }
  }
  
  return (
    <div style={{ marginTop:12, background:'var(--surface)', border:'1px solid var(--border)', borderRadius:12, padding:16 }}>
      <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:16 }}>
        <div style={{
          width:64,
          height:64,
          borderRadius:'50%',
          background:'var(--accent)',
          display:'flex',
          alignItems:'center',
          justifyContent:'center',
          fontSize:32,
        }}>
          {template.user.avatar}
        </div>
        <div style={{ flex:1 }}>
          <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:2 }}>
            <span style={{ fontSize:16, fontWeight:600, color:'var(--text-pri)', fontFamily:'Syne' }}>
              {template.user.name}
            </span>
            {template.user.verified && <span style={{ color:'var(--accent)', fontSize:16 }}>✓</span>}
          </div>
          <div style={{ fontSize:13, color:'var(--text-ter)', marginBottom:4 }}>
            {template.user.username}
          </div>
          <div style={{ fontSize:12, color:'var(--text-sec)', lineHeight:1.4 }}>
            {template.user.bio}
          </div>
        </div>
      </div>
      
      <div style={{ display:'flex', gap:12, marginBottom:16, padding:'12px', borderRadius:8, background:'var(--surface-hover)' }}>
        {Object.entries(template.user.stats).map(([key, value], idx) => (
          <div key={idx} style={{ flex:1, textAlign:'center' }}>
            <div style={{ fontSize:18, fontWeight:600, color:'var(--text-pri)', fontFamily:'Syne' }}>
              {value.toLocaleString()}
            </div>
            <div style={{ fontSize:11, color:'var(--text-ter)', textTransform:'capitalize' }}>
              {key}
            </div>
          </div>
        ))}
      </div>
      
      <div style={{ display:'flex', gap:8 }}>
        <button style={{
          flex:1,
          padding:'10px 16px',
          borderRadius:8,
          border:'none',
          background:'var(--accent)',
          color:'#fff',
          fontSize:13,
          fontWeight:600,
          fontFamily:'Syne',
          cursor:'pointer',
        }}>
          Follow
        </button>
        <button style={{
          flex:1,
          padding:'10px 16px',
          borderRadius:8,
          border:'1px solid var(--border)',
          background:'transparent',
          color:'var(--text-sec)',
          fontSize:13,
          fontWeight:500,
          fontFamily:'Syne',
          cursor:'pointer',
        }}>
          Message
        </button>
      </div>
    </div>
  )
}

function StatsTemplate() {
  const template = {
    metrics: [
      { label: 'Total Sales', value: '$12,450', change: '+12%', trend: 'up' },
      { label: 'Active Users', value: '2,847', change: '+8%', trend: 'up' },
      { label: 'Conversion Rate', value: '3.2%', change: '-2%', trend: 'down' },
      { label: 'Avg Session', value: '4m 32s', change: '+5%', trend: 'up' },
    ],
    chartData: [
      { label: 'Mon', value: 450 },
      { label: 'Tue', value: 520 },
      { label: 'Wed', value: 490 },
      { label: 'Thu', value: 610 },
      { label: 'Fri', value: 580 },
      { label: 'Sat', value: 720 },
      { label: 'Sun', value: 690 },
    ]
  }
  const maxValue = Math.max(...template.chartData.map(d => d.value))
  
  return (
    <div style={{ marginTop:12, background:'var(--surface)', border:'1px solid var(--border)', borderRadius:12, padding:16 }}>
      <div style={{ fontSize:12, color:'var(--text-ter)', marginBottom:12, textTransform:'uppercase', letterSpacing:1.5, fontWeight:600 }}>
        Dashboard de Estatísticas
      </div>
      
      <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:10, marginBottom:16 }}>
        {template.metrics.map((metric, idx) => (
          <div key={idx} style={{
            padding:'12px',
            borderRadius:8,
            background:'var(--surface-hover)',
          }}>
            <div style={{ fontSize:12, color:'var(--text-ter)', marginBottom:4 }}>
              {metric.label}
            </div>
            <div style={{ fontSize:20, fontWeight:600, color:'var(--text-pri)', fontFamily:'Syne', marginBottom:2 }}>
              {metric.value}
            </div>
            <div style={{ 
              fontSize:11, 
              color: metric.trend === 'up' ? '#34d399' : '#f87171',
              fontWeight:500,
            }}>
              {metric.change} {metric.trend === 'up' ? '↑' : '↓'}
            </div>
          </div>
        ))}
      </div>
      
      <div style={{ fontSize:11, color:'var(--text-ter)', marginBottom:8, textTransform:'uppercase', letterSpacing:1, fontWeight:600 }}>
        Tendência Semanal
      </div>
      <div style={{ 
        display:'flex', 
        alignItems:'flex-end', 
        gap:12, 
        padding:'16px', 
        borderRadius:8, 
        background:'var(--surface-hover)',
        height:120,
      }}>
        {template.chartData.map((data, idx) => (
          <div key={idx} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
            <div style={{ 
              width:'100%', 
              height:`${(data.value / maxValue) * 80}px`, 
              background:'var(--accent)', 
              borderRadius:4,
              transition:'height .3s',
            }} />
            <div style={{ fontSize:10, color:'var(--text-ter)' }}>{data.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
