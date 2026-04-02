import Dexie from 'dexie'

export const db = new Dexie('OSShell')

db.version(1).stores({
  notes:       '++id, title, body, updatedAt, pinned',
  preferences: 'key',
  chatHistory: '++id, role, content, timestamp, lang',
})

export const getPref    = async (key, fallback = null) => { const r = await db.preferences.get(key); return r?.value ?? fallback }
export const setPref    = async (key, value) => db.preferences.put({ key, value })
export const saveNote   = async (note) => db.notes.put({ ...note, updatedAt: Date.now() })
export const getNotes   = async () => db.notes.orderBy('updatedAt').reverse().toArray()
export const deleteNote = async (id) => db.notes.delete(id)
export const appendChat = async (role, content, lang = 'en') => db.chatHistory.add({ role, content, lang, timestamp: Date.now() })
export const getRecentChat = async (limit = 20) => db.chatHistory.orderBy('timestamp').reverse().limit(limit).toArray()
