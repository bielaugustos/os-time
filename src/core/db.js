import Dexie from 'dexie'

export const db = new Dexie('OSShell')

db.version(1).stores({
  notes:       '++id, title, body, updatedAt, pinned, archived, icon, cover, syncStatus',
  preferences: 'key',
  chatHistory: '++id, role, content, timestamp, lang',
  syncQueue:   '++id, tableName, recordId, operation, data, timestamp, status',
  users:       '++id, email, name, createdAt, lastSync',
  encryption:  '++id, key, iv, data',
})

db.version(2).stores({
  notes:       '++id, title, body, updatedAt, pinned, archived, icon, cover, syncStatus, encrypted',
  archivedNotes: '++id, title, body, updatedAt, pinned, icon, cover, syncStatus, encrypted',
  preferences: 'key',
  chatHistory: '++id, role, content, timestamp, lang, syncStatus',
  syncQueue:   '++id, tableName, recordId, operation, data, timestamp, status, retryCount',
  users:       '++id, email, name, createdAt, lastSync',
  encryption:  '++id, key, iv, data',
})

db.version(3).stores({
  notes:       '++id, title, body, updatedAt, pinned, archived, icon, cover, syncStatus, encrypted, deviceId',
  archivedNotes: '++id, title, body, updatedAt, pinned, icon, cover, syncStatus, encrypted, deviceId',
  preferences: 'key',
  chatHistory: '++id, role, content, timestamp, lang, syncStatus, deviceId',
  syncQueue:   '++id, tableName, recordId, operation, data, timestamp, status, retryCount, deviceId',
  users:       '++id, email, name, createdAt, lastSync, deviceId',
  encryption:  '++id, key, iv, data, deviceId',
  devices:     '++id, deviceId, name, lastSeen, status',
  offlineData: '++id, key, value, timestamp, syncStatus',
})

export const SYNC_STATUS = {
  SYNCED: 'synced',
  PENDING: 'pending',
  CONFLICT: 'conflict',
  ERROR: 'error',
}

export const OPERATION = {
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
}

export const getPref    = async (key, fallback = null) => { 
  const r = await db.preferences.get(key); 
  return r?.value ?? fallback 
}

export const setPref    = async (key, value) => db.preferences.put({ key, value })

export const saveNote   = async (note) => {
  const deviceId = await getDeviceId()
  const now = Date.now()
  const noteWithMeta = { 
    ...note, 
    updatedAt: now, 
    syncStatus: SYNC_STATUS.PENDING,
    deviceId 
  }
  const id = await db.notes.put(noteWithMeta)
  await queueSync('notes', id, OPERATION.UPDATE, noteWithMeta)
  return id
}

export const getNotes   = async () => db.notes.orderBy('updatedAt').reverse().toArray()

export const deleteNote = async (id) => {
  const note = await db.notes.get(id)
  if (note) {
    await db.notes.delete(id)
    await queueSync('notes', id, OPERATION.DELETE, { id })
  }
}

export const archiveNote = async (id) => {
  const note = await db.notes.get(id)
  if (note) {
    const deviceId = await getDeviceId()
    await db.archivedNotes.put({ ...note, archivedAt: Date.now(), syncStatus: SYNC_STATUS.PENDING, deviceId })
    await db.notes.delete(id)
    await queueSync('archivedNotes', id, OPERATION.CREATE, { ...note, archivedAt: Date.now() })
  }
}

export const getArchivedNotes = async () => db.archivedNotes.orderBy('updatedAt').reverse().toArray()

export const restoreNote = async (id) => {
  const note = await db.archivedNotes.get(id)
  if (note) {
    await db.notes.put({ ...note, archived: false, syncStatus: SYNC_STATUS.PENDING })
    await db.archivedNotes.delete(id)
  }
}

export const permanentlyDeleteNote = async (id) => db.archivedNotes.delete(id)

export const appendChat = async (role, content, lang = 'en') => {
  const deviceId = await getDeviceId()
  return db.chatHistory.add({ 
    role, 
    content, 
    lang, 
    timestamp: Date.now(), 
    syncStatus: SYNC_STATUS.PENDING,
    deviceId 
  })
}

export const getRecentChat = async (limit = 20) => db.chatHistory.orderBy('timestamp').reverse().limit(limit).toArray()

async function getDeviceId() {
  let deviceId = await getPref('device_id')
  if (!deviceId) {
    deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    await setPref('device_id', deviceId)
  }
  return deviceId
}

async function queueSync(tableName, recordId, operation, data) {
  await db.syncQueue.add({
    tableName,
    recordId,
    operation,
    data,
    timestamp: Date.now(),
    status: SYNC_STATUS.PENDING,
    retryCount: 0,
    deviceId: await getDeviceId(),
  })
}

export const getSyncQueue = async () => db.syncQueue.toArray()

export const updateSyncStatus = async (id, status) => {
  await db.syncQueue.update(id, { status })
}

export const incrementRetryCount = async (id) => {
  const item = await db.syncQueue.get(id)
  if (item) {
    await db.syncQueue.update(id, { retryCount: item.retryCount + 1 })
  }
}

export const clearSyncQueue = async () => {
  await db.syncQueue.where('status').equals(SYNC_STATUS.SYNCED).delete()
}

export const getPendingChanges = async () => {
  return db.syncQueue.where('status').equals(SYNC_STATUS.PENDING).toArray()
}

export const saveOfflineData = async (key, value) => {
  await db.offlineData.put({ key, value, timestamp: Date.now(), syncStatus: SYNC_STATUS.PENDING })
}

export const getOfflineData = async (key) => {
  const item = await db.offlineData.get(key)
  return item?.value
}