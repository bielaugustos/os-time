import React, { useState } from 'react'

const UI_TEMPLATES = {
  // Existing templates...
  
  // NEW TEMPLATE EXAMPLE: Calendar Component
  calendar: {
    name: 'Calendar',
    currentMonth: 'January 2024',
    events: [
      { date: '2024-01-15', title: 'Team Meeting', time: '10:00 AM' },
      { date: '2024-01-20', title: 'Project Deadline', time: '5:00 PM' },
      { date: '2024-01-25', title: 'Client Call', time: '2:00 PM' },
    ]
  }
}

export default function ChatApp() {
  // ... existing code
  
  const processMessage = async (userMessage) => {
    // ... existing processing
    
    // ADD THIS CASE:
    else if (lowerMessage.includes('calendar') || lowerMessage.includes('schedule') || lowerMessage.includes('event')) {
      setGeneratedUI({ type: 'calendar', template: 'calendar' })
      setMessages(prev => [...prev, { 
        type: 'ai', 
        content: 'I\'ve created a calendar component with your scheduled events!' 
      }])
    }
    // ... rest of processing
  }
  
  const renderGeneratedUI = () => {
    // ... existing rendering
    
    // ADD THIS CASE:
    case 'calendar':
      return <CalendarTemplate template={UI_TEMPLATES[generatedUI.template]} />
    // ... rest of switch
  }
  
  // NEW TEMPLATE COMPONENT
  function CalendarTemplate({ template }) {
    const [selectedDate, setSelectedDate] = useState(null)
    const daysInMonth = 31
    const firstDayOffset = 0 // Monday starts at 0
    
    return (
      <div style={{ 
        marginTop:12, 
        background:'var(--surface)', 
        border:'1px solid var(--border)', 
        borderRadius:12, 
        padding:16 
      }}>
        <div style={{ 
          fontSize:12, 
          color:'var(--text-ter)', 
          marginBottom:12, 
          textTransform:'uppercase', 
          letterSpacing:1.5, 
          fontWeight:600,
          display:'flex',
          justifyContent:'space-between',
          alignItems:'center'
        }}>
          {template.name}
          <div style={{ display:'flex', gap:8 }}>
            <button style={{
              padding:'4px 8px',
              borderRadius:4,
              border:'1px solid var(--border)',
              background:'transparent',
              color:'var(--text-sec)',
              cursor:'pointer',
              fontSize:11,
            }}>
              Prev
            </button>
            <button style={{
              padding:'4px 8px',
              borderRadius:4,
              border:'1px solid var(--border)',
              background:'transparent',
              color:'var(--text-sec)',
              cursor:'pointer',
              fontSize:11,
            }}>
              Next
            </button>
          </div>
        </div>
        
        <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:4, marginBottom:8 }}>
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
            <div key={day} style={{
              fontSize:11,
              color:'var(--text-ter)',
              textAlign:'center',
              fontWeight:600,
            }}>
              {day}
            </div>
          ))}
        </div>
        
        <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:4, marginBottom:16 }}>
          {Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1
            const hasEvent = template.events.some(e => e.date.endsWith(`-${String(day).padStart(2, '0')}`))
            return (
              <button
                key={day}
                onClick={() => setSelectedDate(day)}
                style={{
                  padding:'8px 4px',
                  borderRadius:6,
                  border: selectedDate === day ? '1px solid var(--accent)' : '1px solid transparent',
                  background: hasEvent ? 'var(--accent)' : 'var(--surface-hover)',
                  color: hasEvent ? '#fff' : 'var(--text-pri)',
                  cursor:'pointer',
                  fontSize:12,
                  fontWeight:500,
                  textAlign:'center',
                }}
              >
                {day}
              </button>
            )
          })}
        </div>
        
        <div style={{ fontSize:11, color:'var(--text-ter)', marginBottom:8, textTransform:'uppercase', letterSpacing:1, fontWeight:600 }}>
          Upcoming Events
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          {template.events.map((event, idx) => (
            <div key={idx} style={{
              padding:'10px 12px',
              borderRadius:8,
              background:'var(--surface-hover)',
              border:'1px solid var(--border)',
            }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:4 }}>
                <span style={{ fontSize:13, fontWeight:600, color:'var(--text-pri)' }}>
                  {event.title}
                </span>
                <span style={{ fontSize:11, color:'var(--text-ter)' }}>
                  {event.time}
                </span>
              </div>
              <div style={{ fontSize:11, color:'var(--text-sec)' }}>
                {event.date}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }
  
  // ... rest of component
}
