function sanitizeInput(value) {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .trim();
}

function validateTemplateData(templateData) {
  if (!templateData || typeof templateData !== 'object') {
    throw new Error('Data template tidak valid.');
  }
  if (!sanitizeInput(templateData.TemplateName || templateData.name)) {
    throw new Error('Nama template wajib diisi.');
  }
  if (!sanitizeInput(templateData.Category || templateData.category)) {
    throw new Error('Kategori template wajib diisi.');
  }
  return true;
}

function validateGeneratedImage(base64Data, fileName, mimeType) {
  validateMimeType(mimeType, ['image/png', 'image/jpeg']);
  validateBase64Image(base64Data, APP_CONFIG.MAX_UPLOAD_SIZE, mimeType);
  if (!sanitizeInput(fileName)) throw new Error('Nama file wajib diisi.');
  return true;
}

function validateUploadFile(base64Data, fileName, mimeType) {
  validateMimeType(mimeType, APP_CONFIG.ALLOWED_IMAGE_TYPES);
  validateBase64Image(base64Data, APP_CONFIG.MAX_UPLOAD_SIZE, mimeType);
  if (!sanitizeInput(fileName)) throw new Error('Nama file wajib diisi.');
  return true;
}

function validateDesignMetadata(metadata) {
  if (!metadata || typeof metadata !== 'object') {
    throw new Error('Metadata desain tidak valid.');
  }
  if (!sanitizeInput(metadata.title)) {
    throw new Error('Judul desain wajib diisi.');
  }
  assertTextLength_(metadata.title, 'Judul', 500);
  assertTextLength_(metadata.description, 'Deskripsi', 5000);
  assertTextLength_(metadata.category, 'Kategori', 200);
  assertTextLength_(metadata.templateId, 'Template ID', 200);
  assertTextLength_(metadata.templateName, 'Nama template', 300);
  assertTextLength_(metadata.format, 'Format', 100);
  validatePublicSessionId_(metadata.sessionId);
  return true;
}

function validateBase64Image(base64Data, maxBytes, expectedMimeType) {
  if (!base64Data || typeof base64Data !== 'string') {
    throw new Error('Data gambar tidak valid.');
  }
  var match = base64Data.match(/^data:([^;,]+);base64,([A-Za-z0-9+/]+={0,2})$/);
  var payload = match ? match[2] : base64Data;
  if (!match && !/^[A-Za-z0-9+/]+={0,2}$/.test(payload)) {
    throw new Error('Format base64 gambar tidak valid.');
  }
  if (match && expectedMimeType && match[1] !== expectedMimeType) {
    throw new Error('Tipe data gambar tidak sesuai dengan MIME type.');
  }
  if (payload.length % 4 !== 0) throw new Error('Panjang data base64 tidak valid.');
  var padding = payload.slice(-2) === '==' ? 2 : (payload.slice(-1) === '=' ? 1 : 0);
  var estimatedBytes = (payload.length * 3 / 4) - padding;
  if (maxBytes && estimatedBytes > maxBytes) {
    throw new Error('Ukuran file melebihi batas ' + Math.floor(maxBytes / 1048576) + ' MB.');
  }
  validateImageSignature_(Utilities.base64Decode(payload), expectedMimeType);
  return true;
}

function validateImageSignature_(bytes, mimeType) {
  var unsigned = bytes.map(function(value) { return value < 0 ? value + 256 : value; });
  var valid = false;
  if (mimeType === 'image/png') {
    valid = unsigned.length >= 8 && [137,80,78,71,13,10,26,10].every(function(value, index) { return unsigned[index] === value; });
  } else if (mimeType === 'image/jpeg') {
    valid = unsigned.length >= 3 && unsigned[0] === 255 && unsigned[1] === 216 && unsigned[2] === 255;
  } else if (mimeType === 'image/webp') {
    valid = unsigned.length >= 12 && String.fromCharCode.apply(null, unsigned.slice(0, 4)) === 'RIFF' && String.fromCharCode.apply(null, unsigned.slice(8, 12)) === 'WEBP';
  }
  if (!valid) throw new Error('Isi file tidak sesuai dengan tipe gambar yang dipilih.');
  return true;
}

function validateMimeType(mimeType, allowedTypes) {
  if (allowedTypes.indexOf(mimeType) === -1) {
    throw new Error('Tipe file tidak didukung: ' + sanitizeInput(mimeType));
  }
  return true;
}

