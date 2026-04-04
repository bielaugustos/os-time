// Copy and paste this into your browser console (F12)

console.log('=== CLEARING ALL CACHES ===');

// 1. Clear all localStorage
try {
  localStorage.clear();
  console.log('✓ localStorage cleared');
} catch (e) {
  console.error('✗ Failed to clear localStorage:', e);
}

// 2. Clear sessionStorage
try {
  sessionStorage.clear();
  console.log('✓ sessionStorage cleared');
} catch (e) {
  console.error('✗ Failed to clear sessionStorage:', e);
}

// 3. Unregister all service workers
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(function(registrations) {
    for (let registration of registrations) {
      registration.unregister();
    }
    console.log('✓ Service workers unregistered');
  });
}

// 4. Clear IndexedDB
try {
  const databases = await indexedDB.databases();
  for (const db of databases) {
    indexedDB.deleteDatabase(db.name);
  }
  console.log('✓ IndexedDB cleared');
} catch (e) {
  console.error('✗ Failed to clear IndexedDB:', e);
}

console.log('=== CACHES CLEARED ===');
console.log('Now reload the page with: location.reload()');

// Auto-reload after 2 seconds
setTimeout(() => {
  console.log('Reloading page...');
  location.reload(true); // true = force reload from server
}, 2000);
