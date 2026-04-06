# Ioverso - OS-Style Productivity Suite

## Dev Commands

```bash
npm run dev      # Start dev server (port 3000)
npm run build    # Production build
npm run preview  # Preview production build
```

No test framework, linting, or typechecking configured.

## Architecture

- **Entry point**: `src/main.jsx` → `src/App.jsx`
- **Apps**: `src/apps/` - registered in `src/config/appRegistry.js` (lazy-loaded)
- **Themes**: `src/config/theme.js` - 6 time-based periods (dawn, morning, midday, afternoon, evening, night)
- **i18n**: `src/config/i18n.js` - 4 languages (en, pt, es, fr)
- **State**: Dexie.js (IndexedDB) for data, localStorage for preferences

## App Registry

Apps are registered in `src/config/appRegistry.js` with lazy imports. Each app has: `id`, `color`, `navKey`, `appKey`, `iconSize`, `component`, and optional `disabled`.

## Adding a New App

1. Create component in `src/apps/`
2. Register in `src/config/appRegistry.js`
3. Add icon mapping in `App.jsx:getIconForId()`
4. Add translation keys in `src/config/i18n.js` (all 4 languages)

## Keyboard Shortcuts

- `1-6`: Open apps
- `Esc`: Go home
- `Ctrl+,`: Settings
- `Ctrl+N`: New note

## AI Chat UI System

The chat app (`src/apps/ChatApp.jsx`) uses a local rule-based system (no external APIs). Templates are defined as `UI_TEMPLATES` objects and rendered via `renderGeneratedUI()`. See `docs/local-agent-system.md` for extending intents.

## Theme System

Themes use CSS custom properties (`--bg`, `--surface`, `--accent`, etc.) applied via `applyTheme()` in `src/config/theme.js`. Theme auto-switches based on time of day, overridable via menu.
