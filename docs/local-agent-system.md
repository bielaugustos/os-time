# AI UI - Local Agent System

This document describes the local conversation agent system that doesn't require external API calls.

## Overview

The AI UI app uses a **rule-based conversation system** with translation support. This means:
- No external API calls required
- Responses are generated based on keyword matching
- Fully translated in all supported languages
- Fast and offline-capable

## How It Works

### 1. Intent Detection

```javascript
const processMessage = async (userMessage) => {
  const lowerMessage = userMessage.toLowerCase()
  
  // Keywords trigger different intents
  if (lowerMessage.includes('registration') || 
      lowerMessage.includes('sign up') || 
      lowerMessage.includes('register')) {
    // Generate registration form
  }
  // ... more intents
}
```

### 2. Response Generation

Responses use the translation system:

```javascript
// Instead of hardcoded English:
content: 'I\'ve created a registration form for you.'

// Use translation key:
content: t('chat.registrationCreated')
```

### 3. UI Template Selection

When an intent is matched, the system:
1. Selects the appropriate template
2. Generates the UI component
3. Adds a translated response message

## Extending the Agent

To add new conversation patterns:

### Step 1: Add Translation Keys

In `src/config/i18n.js`:

```javascript
chat: {
  // ... existing keys
  myNewResponse: 'Here\'s your new component!'
}
```

Add to all languages:
```javascript
en: { myNewResponse: 'Here\'s your new component!' }
pt: { myNewResponse: 'Aqui está seu novo componente!' }
es: { myNewResponse: '¡Aquí está tu nuevo componente!' }
fr: { myNewResponse: 'Voici votre nouveau composant!' }
```

### Step 2: Create Intent Handler

In `src/apps/ChatApp.jsx`:

```javascript
const processMessage = async (userMessage) => {
  // ... existing processing
  
  // Add your new intent
  else if (lowerMessage.includes('mykeyword') || 
             lowerMessage.includes('alternative keyword')) {
    setGeneratedUI({ type: 'mytype', template: 'mytemplate' })
    setMessages(prev => [...prev, { 
      type: 'ai', 
      content: t('chat.myNewResponse')
    }])
  }
  // ... rest of processing
}
```

### Step 3: Create Template Component

Add the template component to render the UI:

```javascript
function MyTemplate({ template }) {
  return <div>{/* Your component JSX */}</div>
}
```

### Step 4: Add to Renderer

```javascript
const renderGeneratedUI = () => {
  // ... existing cases
  
  case 'mytype':
    return <MyTemplate template={UI_TEMPLATES[generatedUI.template]} />
  // ... rest of cases
}
```

## Supported Intents

| Intent | Keywords | Template |
|--------|-----------|-----------|
| Registration | register, sign up, registration | form/registration |
| Login | login, sign in, auth | form/login |
| Todo List | todo, task, list | todo |
| Weather Dashboard | weather, forecast | weather |
| User Profile | profile, user, account | profile |
| Statistics Dashboard | stat, dashboard, chart, analytics | stats |
| Help | help, what can you do, examples | None |

## Advantages of Local Agent

✅ **No API costs** - Everything runs locally
✅ **No network required** - Works offline
✅ **Fast response** - No network latency
✅ **Privacy** - No data sent to external services
✅ **Reliable** - No API rate limits or downtime
✅ **Full control** - You define all behaviors

## Limitations

⚠️ **Limited vocabulary** - Only responds to predefined keywords
⚠️ **No real AI** - Can't understand complex natural language
⚠️ **Maintenance** - Must manually add new intents and responses
⚠️ **No learning** - Doesn't improve from conversations

## Future Enhancements

To make it more "AI-like", you could:

### Option 1: Web Speech API Integration
```javascript
// Use browser's built-in speech recognition
const recognition = new webkitSpeechRecognition()
recognition.onresult = (event) => {
  const transcript = event.results[0][0].transcript
  processMessage(transcript)
}
```

### Option 2: Local AI Model
```javascript
// Use TensorFlow.js with a local model
import * as tf from '@tensorflow/tfjs'

async function getLocalAIResponse(input) {
  // Use local NLP model
  const response = await localModel.predict(input)
  return response
}
```

### Option 3: Pattern Matching System
```javascript
// More sophisticated pattern matching
const patterns = [
  {
    pattern: /(create|build|make|generate)\\s*(a|an|the)?\\s*(\w+)/i,
    handler: (match) => generateUI(match[3])
  },
  // ... more patterns
]
```

## Adding Context Awareness

To make conversations more natural, track conversation state:

```javascript
const [conversationState, setConversationState] = useState({
  lastIntent: null,
  topic: null,
  context: {}
})

const processMessage = (message) => {
  // Use context to provide better responses
  if (conversationState.lastIntent === 'registration' && 
      message.includes('submit')) {
    // Handle form submission
  }
}
```

## Example: Custom Agent Behavior

```javascript
// Add personality and conversation flow
const CONVERSATION_RULES = [
  {
    triggers: ['hello', 'hi', 'hey'],
    responses: [
      'Hello! How can I help you create UI today?',
      'Hi there! Ready to build something amazing?',
      'Hey! What kind of interface do you need?'
    ]
  },
  {
    triggers: ['thank'],
    responses: [
      'You\'re welcome! Let me know if you need anything else.',
      'Happy to help! Want to create another component?',
      'Anytime! Just ask when you need more UI.'
    ]
  },
  {
    triggers: ['bye', 'goodbye'],
    responses: [
      'Goodbye! Come back anytime you need UI.',
      'See you soon! Happy designing!'
    ]
  }
]

function processMessage(message) {
  const lower = message.toLowerCase()
  
  for (const rule of CONVERSATION_RULES) {
    if (rule.triggers.some(trigger => lower.includes(trigger))) {
      const response = rule.responses[
        Math.floor(Math.random() * rule.responses.length)
      ]
      setMessages(prev => [...prev, { 
        type: 'ai', 
        content: t(`chat.${response}`)
      }])
      return
    }
  }
  
  // Fall back to UI generation logic
  processUIGeneration(message)
}
```

## Testing Your Agent

Create test scenarios in `docs/test-scenarios.md`:

```markdown
# Test Scenarios

## Scenario 1: Registration Flow
**User:** "I need a sign up form"
**Expected:** Registration form appears
**AI Response:** (translated) "I've created a registration form..."

## Scenario 2: Language Switch
**User:** Switches language to Portuguese
**Action:** Ask for a todo list
**Expected:** Response in Portuguese, UI labels in Portuguese

## Scenario 3: Unknown Request
**User:** "Create a spaceship dashboard"
**Expected:** Helpful error message in current language
```

## Conclusion

The local agent system provides a fast, reliable, and privacy-preserving way to have conversational UI generation. While it doesn't have true AI capabilities, it can be extended with more sophisticated pattern matching and context awareness to provide increasingly natural conversations.

// In construct @bielaugustos