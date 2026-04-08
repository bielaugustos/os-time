import { getPref, setPref, getPendingChanges, updateSyncStatus, incrementRetryCount, SYNC_STATUS } from './db'

const MAX_RETRY = 3
const SYNC_INTERVAL = 30000

class SyncService {
  constructor() {
    this.isOnline = navigator.onLine
    this.listeners = new Set()
    this.syncTimer = null
    this.isSyncing = false
    this.initialized = false
  }

  init() {
    if (this.initialized) return
    this.initialized = true

    window.addEventListener('online', () => this.handleOnline())
    window.addEventListener('offline', () => this.handleOffline())
    
    this.loadInitialSync()
  }

  loadInitialSync() {
    const lastSync = localStorage.getItem('last_sync_timestamp')
    if (lastSync) {
      this.notifyListeners({ type: 'init', lastSync: parseInt(lastSync) })
    }
  }

  handleOnline() {
    this.isOnline = true
    this.notifyListeners({ type: 'online' })
    this.processSyncQueue()
  }

  handleOffline() {
    this.isOnline = false
    this.notifyListeners({ type: 'offline' })
  }

  startSyncTimer() {
    if (this.syncTimer) clearInterval(this.syncTimer)
    this.syncTimer = setInterval(() => {
      if (this.isOnline) {
        this.processSyncQueue()
      }
    }, SYNC_INTERVAL)
  }

  stopSyncTimer() {
    if (this.syncTimer) {
      clearInterval(this.syncTimer)
      this.syncTimer = null
    }
  }

  subscribe(callback) {
    this.listeners.add(callback)
    return () => this.listeners.delete(callback)
  }

  notifyListeners(event) {
    this.listeners.forEach(cb => cb(event))
  }

  async processSyncQueue() {
    if (this.isSyncing || !this.isOnline) return
    
    this.isSyncing = true
    this.notifyListeners({ type: 'sync_start' })

    try {
      const pending = await getPendingChanges()
      
      if (pending.length === 0) {
        this.isSyncing = false
        return
      }

      for (const item of pending) {
        try {
          await this.syncItem(item)
          await updateSyncStatus(item.id, SYNC_STATUS.SYNCED)
        } catch (error) {
          console.error('Sync error for item:', item.id, error)
          await incrementRetryCount(item.id)
          
          if (item.retryCount >= MAX_RETRY) {
            await updateSyncStatus(item.id, SYNC_STATUS.ERROR)
          }
        }
      }

      const timestamp = Date.now()
      localStorage.setItem('last_sync_timestamp', timestamp)
      this.notifyListeners({ type: 'sync_complete', timestamp, count: pending.length })
    } catch (error) {
      console.error('Sync queue error:', error)
      this.notifyListeners({ type: 'sync_error', error })
    } finally {
      this.isSyncing = false
    }
  }

  async syncItem(item) {
    const remoteEndpoint = await getPref('sync_endpoint')
    if (!remoteEndpoint) {
      console.log('No remote endpoint configured, storing locally')
      return
    }

    const response = await fetch(remoteEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        operation: item.operation,
        tableName: item.tableName,
        recordId: item.recordId,
        data: item.data,
        timestamp: item.timestamp,
        deviceId: item.deviceId,
      }),
    })

    if (!response.ok) {
      throw new Error(`Sync failed: ${response.status}`)
    }

    return response.json()
  }

  async syncNow() {
    if (!this.isOnline) {
      throw new Error('No internet connection')
    }
    await this.processSyncQueue()
  }

  getStatus() {
    return {
      isOnline: this.isOnline,
      isSyncing: this.isSyncing,
      lastSync: localStorage.getItem('last_sync_timestamp'),
    }
  }

  async resolveConflict(localItem, remoteItem, resolution = 'local') {
    if (resolution === 'local') {
      return localItem
    } else if (resolution === 'remote') {
      return remoteItem
    } else if (resolution === 'merge') {
      return { ...localItem, ...remoteItem, mergedAt: Date.now() }
    }
  }
}

export const syncService = new SyncService()