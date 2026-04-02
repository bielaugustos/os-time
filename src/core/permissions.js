export const PERMISSION_DEFS = {
  microphone:  { key: 'microphone',       icon: '◎', labelKey: 'permissions.microphone', reasonKey: 'permissions.micReason',     how: 'mediaDevices' },
  camera:      { key: 'camera',           icon: '◉', labelKey: 'permissions.camera',     reasonKey: 'permissions.camReason',     how: 'camera'       },
  geolocation: { key: 'geolocation',      icon: '◍', labelKey: 'permissions.location',   reasonKey: 'permissions.geoReason',     how: 'geolocation'  },
  notifications:{ key: 'notifications',   icon: '◈', labelKey: 'permissions.notifications',reasonKey:'permissions.notifReason',  how: 'notifications'},
  storage:     { key: 'persistent-storage',icon: '◫',labelKey: 'permissions.storage',    reasonKey: 'permissions.storageReason', how: 'storage'      },
  clipboard:   { key: 'clipboard-read',   icon: '◧', labelKey: 'permissions.clipboard',  reasonKey: 'permissions.clipReason',    how: 'clipboard'    },
}

export async function check(permKey) {
  const def = Object.values(PERMISSION_DEFS).find(d => d.key === permKey)
  if (!def) return 'unknown'
  try {
    if (def.how === 'notifications') return Notification.permission === 'default' ? 'prompt' : Notification.permission
    if (def.how === 'storage') { const v = await navigator.storage?.persisted?.(); return v ? 'granted' : 'prompt' }
    const r = await navigator.permissions.query({ name: permKey })
    return r.state
  } catch { return 'unknown' }
}

export async function request(permKey) {
  const def = Object.values(PERMISSION_DEFS).find(d => d.key === permKey)
  if (!def) return 'unknown'
  try {
    if (def.how === 'mediaDevices') { const s = await navigator.mediaDevices.getUserMedia({ audio: true }); s.getTracks().forEach(t => t.stop()); return 'granted' }
    if (def.how === 'camera')       { const s = await navigator.mediaDevices.getUserMedia({ video: true }); s.getTracks().forEach(t => t.stop()); return 'granted' }
    if (def.how === 'geolocation')  return new Promise(res => navigator.geolocation.getCurrentPosition(() => res('granted'), () => res('denied'), { timeout: 8000 }))
    if (def.how === 'notifications'){ const r = await Notification.requestPermission(); return r === 'default' ? 'prompt' : r }
    if (def.how === 'storage')      { const v = await navigator.storage?.persist?.(); return v ? 'granted' : 'denied' }
    if (def.how === 'clipboard')    { await navigator.clipboard.readText(); return 'granted' }
  } catch { return 'denied' }
}

export async function checkAll() {
  const results = {}
  await Promise.all(Object.values(PERMISSION_DEFS).map(async def => { results[def.key] = await check(def.key) }))
  return results
}
