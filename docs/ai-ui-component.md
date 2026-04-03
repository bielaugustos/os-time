# AI UI - Generative Interface Component

This app demonstrates a generative UI system that creates interactive interfaces from natural language prompts.

## Features

### Template-Based Generation
The system uses pre-defined UI templates that can be instantiated dynamically:

1. **Forms** - Registration, Login, Contact forms
2. **Task Management** - Interactive Todo lists
3. **Information Display** - Weather dashboards, User profiles
4. **Data Analytics** - Statistics dashboards with charts

### How to Use

Simply describe what UI you want in the chat interface:

- "Create a registration form"
- "Show me a todo list"
- "Build a weather dashboard"
- "Generate a user profile"
- "Display statistics dashboard"

### Technical Implementation

The system works by:

1. **Parsing natural language** - Simple keyword matching to understand user intent
2. **Template selection** - Choosing the appropriate UI template
3. **Dynamic rendering** - Rendering interactive React components inline

### Architecture

```
ChatApp
├── Message History
│   ├── User Messages
│   └── AI Responses
├── Generative UI Renderer
│   ├── Form Templates
│   ├── Todo Template
│   ├── Weather Template
│   ├── Profile Template
│   └── Stats Template
└── Chat Interface
    ├── Message List
    ├── Input Area
    └── Typing Indicator
```

### Extending the System

To add new UI templates:

1. Define the template in `UI_TEMPLATES` object
2. Create a template component function
3. Add the case in `renderGeneratedUI()` switch
4. Add keyword matching in `processMessage()`

Example:

```jsx
const UI_TEMPLATES = {
  // ... existing templates
  myNewTemplate: {
    name: 'My New Component',
    // template data
  }
}

function MyNewTemplate({ template }) {
  return <div>{/* component JSX */}</div>
}

// In renderGeneratedUI():
case 'mynew':
  return <MyNewTemplate template={UI_TEMPLATES[generatedUI.template]} />

// In processMessage():
else if (lowerMessage.includes('my keyword')) {
  setGeneratedUI({ type: 'mynew', template: 'myNewTemplate' })
  // ... message response
}
```

### Future Enhancements

1. **AI Integration** - Connect to actual LLM API for true generative UI
2. **More Templates** - Expand template library
3. **Natural Language Understanding** - Better intent parsing
4. **Component Persistence** - Save generated components to local storage
5. **Component Sharing** - Export/import generated UIs

### Current Limitations

- Uses keyword matching instead of true NLP
- Limited to pre-defined templates
- No persistent storage
- No actual AI integration (simulated)
