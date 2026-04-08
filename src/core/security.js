const ENCRYPTION_KEY_NAME = 'encryption_master_key'
const IV_LENGTH = 16
const TAG_LENGTH = 128

async function getMasterKey() {
  let keyData = await indexedDB.databases().then(dbs => {
    return localStorage.getItem(ENCRYPTION_KEY_NAME)
  })
  
  if (!keyData) {
    const key = crypto.subtle.generateKey(
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    )
    const exported = await crypto.subtle.exportKey('raw', key)
    keyData = btoa(String.fromCharCode(...new Uint8Array(exported)))
    localStorage.setItem(ENCRYPTION_KEY_NAME, keyData)
  }
  
  const raw = Uint8Array.from(atob(keyData), c => c.charCodeAt(0))
  return crypto.subtle.importKey('raw', raw, 'AES-GCM', true, ['encrypt', 'decrypt'])
}

export async function encryptData(data) {
  try {
    const key = await getMasterKey()
    const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH))
    const encoded = new TextEncoder().encode(JSON.stringify(data))
    
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv, tagLength: TAG_LENGTH },
      key,
      encoded
    )
    
    const ivArray = Array.from(iv)
    const encryptedArray = Array.from(new Uint8Array(encrypted))
    
    return {
      iv: btoa(String.fromCharCode(...ivArray)),
      data: btoa(String.fromCharCode(...encryptedArray)),
    }
  } catch (error) {
    console.error('Encryption error:', error)
    return null
  }
}

export async function decryptData(encryptedObj) {
  try {
    const key = await getMasterKey()
    const iv = Uint8Array.from(atob(encryptedObj.iv), c => c.charCodeAt(0))
    const encrypted = Uint8Array.from(atob(encryptedObj.data), c => c.charCodeAt(0))
    
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv, tagLength: TAG_LENGTH },
      key,
      encrypted
    )
    
    const decoded = new TextDecoder().decode(decrypted)
    return JSON.parse(decoded)
  } catch (error) {
    console.error('Decryption error:', error)
    return null
  }
}

export function generateSecureId() {
  const array = new Uint8Array(16)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

export function hashData(data) {
  const encoded = new TextEncoder().encode(JSON.stringify(data))
  return crypto.subtle.digest('SHA-256', encoded).then(hash => {
    return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('')
  })
}

export async function encryptField(value) {
  if (!value) return null
  return encryptData(value)
}

export async function decryptField(encryptedValue) {
  if (!encryptedValue) return null
  return decryptData(encryptedValue)
}