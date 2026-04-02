import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

const resources = {
  en: { translation: {
    greeting: { dawn:'Good early morning', morning:'Good morning', midday:'Good afternoon', afternoon:'Good afternoon', evening:'Good evening', night:'Good night' },
    nav: { home:'Home', clock:'Clock', notes:'Notes', calculator:'Calculator', settings:'Settings' },
    apps: { clock:'Clock', notes:'Notes', calculator:'Calculator', settings:'Settings' },
    notes: { search:'Search...', new:'New', untitled:'Untitled', placeholder:'Start writing...' },
    settings: { appearance:'Appearance', language:'Language', permissions:'Permissions', system:'System', themeAuto:'auto', refresh:'↻ Refresh', granted:'Granted', denied:'Denied', allow:'Allow', version:'Version', engine:'Engine', database:'Database', offline:'Offline', storageUsed:'Storage used' },
    permissions: { microphone:'Microphone', camera:'Camera', location:'Location', notifications:'Notifications', storage:'Storage', clipboard:'Clipboard', micReason:'Voice commands & Whisper STT', camReason:'QR scanner & avatar capture', geoReason:'Local weather & context', notifReason:'Alarms & reminders', storageReason:'Offline data never deleted', clipReason:'Paste between apps', deniedHint:'Change in browser settings', chromeHint:'Chrome: ⋮ → Settings → Privacy → Site settings', safariHint:'Safari: Settings → Safari → [this site]' },
    shortcuts: { title:'Keyboard shortcuts', apps:'Open apps', home:'Go home', settings:'Settings', newNote:'New note' },
  }},
  pt: { translation: {
    greeting: { dawn:'Bom amanhecer', morning:'Bom dia', midday:'Boa tarde', afternoon:'Boa tarde', evening:'Boa noite', night:'Boa madrugada' },
    nav: { home:'Início', clock:'Relógio', notes:'Notas', calculator:'Calculadora', settings:'Config' },
    apps: { clock:'Relógio', notes:'Notas', calculator:'Calculadora', settings:'Config' },
    notes: { search:'Buscar...', new:'Nova', untitled:'Sem título', placeholder:'Comece a escrever...' },
    settings: { appearance:'Aparência', language:'Idioma', permissions:'Permissões', system:'Sistema', themeAuto:'auto', refresh:'↻ Atualizar', granted:'Concedida', denied:'Negada', allow:'Permitir', version:'Versão', engine:'Engine', database:'Banco de dados', offline:'Offline', storageUsed:'Armazenamento' },
    permissions: { microphone:'Microfone', camera:'Câmera', location:'Localização', notifications:'Notificações', storage:'Armazenamento', clipboard:'Área de cópia', micReason:'Comandos de voz e transcrição', camReason:'Scanner QR e avatar', geoReason:'Clima local e contexto', notifReason:'Alarmes e lembretes', storageReason:'Dados offline permanentes', clipReason:'Colar entre apps', deniedHint:'Altere nas configurações do browser', chromeHint:'Chrome: ⋮ → Configurações → Privacidade → Configurações do site', safariHint:'Safari: Configurações → Safari → [este site]' },
    shortcuts: { title:'Atalhos de teclado', apps:'Abrir apps', home:'Ir para início', settings:'Configurações', newNote:'Nova nota' },
  }},
  es: { translation: {
    greeting: { dawn:'Buenos días temprano', morning:'Buenos días', midday:'Buenas tardes', afternoon:'Buenas tardes', evening:'Buenas noches', night:'Buenas noches' },
    nav: { home:'Inicio', clock:'Reloj', notes:'Notas', calculator:'Calculadora', settings:'Config' },
    apps: { clock:'Reloj', notes:'Notas', calculator:'Calculadora', settings:'Config' },
    notes: { search:'Buscar...', new:'Nueva', untitled:'Sin título', placeholder:'Empieza a escribir...' },
    settings: { appearance:'Apariencia', language:'Idioma', permissions:'Permisos', system:'Sistema', themeAuto:'auto', refresh:'↻ Actualizar', granted:'Concedido', denied:'Denegado', allow:'Permitir', version:'Versión', engine:'Motor', database:'Base de datos', offline:'Sin conexión', storageUsed:'Almacenamiento' },
    permissions: { microphone:'Micrófono', camera:'Cámara', location:'Ubicación', notifications:'Notificaciones', storage:'Almacenamiento', clipboard:'Portapapeles', micReason:'Comandos de voz', camReason:'Escáner QR y avatar', geoReason:'Clima local', notifReason:'Alarmas y recordatorios', storageReason:'Datos offline permanentes', clipReason:'Pegar entre apps', deniedHint:'Cambia en la configuración del navegador', chromeHint:'Chrome: ⋮ → Configuración → Privacidad → Config. del sitio', safariHint:'Safari: Ajustes → Safari → [este sitio]' },
    shortcuts: { title:'Atajos de teclado', apps:'Abrir apps', home:'Ir al inicio', settings:'Configuración', newNote:'Nueva nota' },
  }},
  fr: { translation: {
    greeting: { dawn:'Bonjour tôt', morning:'Bonjour', midday:'Bon après-midi', afternoon:'Bon après-midi', evening:'Bonsoir', night:'Bonne nuit' },
    nav: { home:'Accueil', clock:'Horloge', notes:'Notes', calculator:'Calculatrice', settings:'Réglages' },
    apps: { clock:'Horloge', notes:'Notes', calculator:'Calculatrice', settings:'Réglages' },
    notes: { search:'Rechercher...', new:'Nouvelle', untitled:'Sans titre', placeholder:'Commencez à écrire...' },
    settings: { appearance:'Apparence', language:'Langue', permissions:'Autorisations', system:'Système', themeAuto:'auto', refresh:'↻ Actualiser', granted:'Accordé', denied:'Refusé', allow:'Autoriser', version:'Version', engine:'Moteur', database:'Base de données', offline:'Hors ligne', storageUsed:'Stockage utilisé' },
    permissions: { microphone:'Microphone', camera:'Caméra', location:'Localisation', notifications:'Notifications', storage:'Stockage', clipboard:'Presse-papiers', micReason:'Commandes vocales', camReason:'Scanner QR et avatar', geoReason:'Météo locale', notifReason:'Alarmes et rappels', storageReason:'Données hors ligne permanentes', clipReason:'Coller entre les apps', deniedHint:'Modifiez dans les paramètres du navigateur', chromeHint:'Chrome: ⋮ → Paramètres → Confidentialité → Paramètres du site', safariHint:'Safari: Réglages → Safari → [ce site]' },
    shortcuts: { title:'Raccourcis clavier', apps:'Ouvrir les apps', home:"Aller à l'accueil", settings:'Paramètres', newNote:'Nouvelle note' },
  }},
}

const detected = navigator.language?.split('-')[0] || 'en'
const supported = Object.keys(resources)
const lng = supported.includes(detected) ? detected : 'en'

i18n.use(initReactI18next).init({
  resources, lng, fallbackLng: 'en',
  interpolation: { escapeValue: false },
})

export default i18n

export const SUPPORTED_LANGS = [
  { code: 'en', label: 'English' },
  { code: 'pt', label: 'Português' },
  { code: 'es', label: 'Español' },
  { code: 'fr', label: 'Français' },
]
