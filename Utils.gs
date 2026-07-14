var APP_CONFIG = {
  APP_NAME: 'Sampul IG Studio',
  ROOT_FOLDER_NAME: 'Sampul IG Studio',
  SHEETS: {
    TEMPLATES: 'Templates',
    HISTORY: 'DesignHistory',
    SETTINGS: 'Settings'
  },
  CACHE_KEYS: {
    SETTINGS: 'APP_SETTINGS',
    TEMPLATES: 'ALL_TEMPLATES',
    ACTIVE_TEMPLATES: 'ACTIVE_TEMPLATES'
  },
  MAX_UPLOAD_SIZE: 10485760,
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  FORMATS: [
    { id: 'feed-portrait', name: 'Feed Portrait', width: 1080, height: 1350, ratio: '4:5' },
    { id: 'feed-square', name: 'Feed Square', width: 1080, height: 1080, ratio: '1:1' },
    { id: 'story', name: 'Instagram Story', width: 1080, height: 1920, ratio: '9:16' },
    { id: 'reels-cover', name: 'Reels Cover', width: 1080, height: 1920, ratio: '9:16' }
  ],
  COLOR_PRESETS: [
    { id: 'cinematic-black', name: 'Cinematic Black', background: '#0F0F0F', title: '#F8F8F8', description: '#CFCFCF', accent: '#E53935', overlay: '#000000', frame: '#2B2B2B' },
    { id: 'dark-navy', name: 'Dark Navy', background: '#0B1120', title: '#F8FAFC', description: '#CBD5E1', accent: '#2563EB', overlay: '#020617', frame: '#1E293B' },
    { id: 'deep-blue', name: 'Deep Blue', background: '#071A2F', title: '#EFF6FF', description: '#BFDBFE', accent: '#38BDF8', overlay: '#06111F', frame: '#1D4ED8' },
    { id: 'editorial-beige', name: 'Editorial Beige', background: '#E8DDCF', title: '#1C1917', description: '#57534E', accent: '#A16207', overlay: '#FFFFFF', frame: '#C8B8A6' },
    { id: 'purple-gradient', name: 'Purple Gradient', background: '#1E1238', title: '#F8F8F8', description: '#DDD6FE', accent: '#A855F7', overlay: '#120820', frame: '#7C3AED' },
    { id: 'red-accent', name: 'Red Accent', background: '#111111', title: '#FFFFFF', description: '#D4D4D4', accent: '#E53935', overlay: '#000000', frame: '#991B1B' },
    { id: 'monochrome', name: 'Monochrome', background: '#F5F5F5', title: '#111111', description: '#444444', accent: '#111111', overlay: '#FFFFFF', frame: '#D4D4D4' }
  ],
  EXAMPLE_CONTENT: [
    { title: 'Setiap Kota Punya Cerita', description: 'Catatan singkat tentang perjalanan, ruang, dan hal-hal kecil yang sering luput.', label: 'CERITA', series: 'EP. 01', cta: 'Baca selengkapnya' },
    { title: 'Terlalu Banyak Mikir', description: 'Tentang jeda, pilihan, dan cara mengenali pikiran yang terlalu penuh.', label: 'REFLEKSI', series: 'EP. 02', cta: 'Simpan postingan ini' },
    { title: 'Fokus Pada Tujuan', description: 'Langkah kecil yang konsisten sering lebih kuat daripada rencana yang terlalu besar.', label: 'PRODUKTIF', series: 'EP. 03', cta: 'Mulai hari ini' },
    { title: 'Lima Kebiasaan Kecil', description: 'Rutinitas sederhana yang membantu hari terasa lebih rapi dan terkendali.', label: 'TIPS', series: 'EP. 04', cta: 'Coba satu dulu' },
    { title: 'Cerita Hari Ini', description: 'Satu momen pendek yang mengubah cara kita melihat hari.', label: 'JURNAL', series: 'EP. 05', cta: 'Bagikan cerita' }
  ]
};

function generateUniqueId(prefix) {
  var cleanPrefix = prefix ? String(prefix).toUpperCase().replace(/[^A-Z0-9]/g, '') : 'ID';
  return cleanPrefix + '-' + Utilities.getUuid().split('-')[0].toUpperCase() + '-' + Date.now();
}

function createSuccessResponse(data, message) {
  return { success: true, message: message || 'Berhasil.', data: data || null };
}

function createErrorResponse(error) {
  return {
    success: false,
    message: error && error.message ? error.message : String(error),
    data: null
  };
}

function parseBase64Data(base64Data) {
  if (!base64Data || typeof base64Data !== 'string') {
    throw new Error('Data base64 tidak valid.');
  }
  var parts = base64Data.split(',');
  var payload = parts.length > 1 ? parts[1] : parts[0];
  if (!payload || payload.length < 16) {
    throw new Error('Data gambar kosong atau rusak.');
  }
  return Utilities.base64Decode(payload);
}

function sanitizeFileName(fileName) {
  var cleanName = sanitizeInput(fileName || 'sampul-ig');
  cleanName = cleanName.replace(/[\\/:*?"<>|#%{}~&]/g, '-').replace(/\s+/g, '-').replace(/-+/g, '-');
  return cleanName.substring(0, 140).replace(/^-|-$/g, '') || 'sampul-ig';
}

function slugify(value) {
  return sanitizeInput(value || 'desain')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 70) || 'desain';
}

function getCurrentIsoDate() {
  return Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd'T'HH:mm:ssXXX");
}

function getCurrentDateForFile() {
  return Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
}

function getCurrentYearMonthFolderName() {
  var date = new Date();
  var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  return {
    year: Utilities.formatDate(date, Session.getScriptTimeZone(), 'yyyy'),
    month: Utilities.formatDate(date, Session.getScriptTimeZone(), 'MM') + '-' + months[date.getMonth()]
  };
}

function jsonParseSafe(value, fallback) {
  try {
    if (value === null || value === undefined || value === '') return fallback;
    return JSON.parse(value);
  } catch (error) {
    return fallback;
  }
}

function jsonStringify(value) {
  return JSON.stringify(value === undefined ? null : value);
}

function serializeJsonForHtml_(value) {
  return jsonStringify(value)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}

function escapeSpreadsheetFormula_(value) {
  if (typeof value !== 'string') return value;
  return /^[=+\-@]/.test(value) ? "'" + value : value;
}

