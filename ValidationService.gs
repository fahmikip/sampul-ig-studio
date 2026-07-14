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
  validateBase64Image(base64Data);
  validateMimeType(mimeType, ['image/png', 'image/jpeg']);
  if (!sanitizeInput(fileName)) throw new Error('Nama file wajib diisi.');
  return true;
}

function validateUploadFile(base64Data, fileName, mimeType) {
  validateBase64Image(base64Data);
  validateMimeType(mimeType, APP_CONFIG.ALLOWED_IMAGE_TYPES);
  if (!sanitizeInput(fileName)) throw new Error('Nama file wajib diisi.');
  var estimatedBytes = Math.ceil((base64Data.length * 3) / 4);
  if (estimatedBytes > APP_CONFIG.MAX_UPLOAD_SIZE * 1.38) {
    throw new Error('Ukuran file melebihi batas 10 MB.');
  }
  return true;
}

function validateDesignMetadata(metadata) {
  if (!metadata || typeof metadata !== 'object') {
    throw new Error('Metadata desain tidak valid.');
  }
  if (!sanitizeInput(metadata.title)) {
    throw new Error('Judul desain wajib diisi.');
  }
  return true;
}

function validateBase64Image(base64Data) {
  if (!base64Data || typeof base64Data !== 'string') {
    throw new Error('Data gambar tidak valid.');
  }
  if (base64Data.indexOf('base64,') === -1 && !/^[A-Za-z0-9+/=]+$/.test(base64Data)) {
    throw new Error('Format base64 gambar tidak valid.');
  }
  return true;
}

function validateMimeType(mimeType, allowedTypes) {
  if (allowedTypes.indexOf(mimeType) === -1) {
    throw new Error('Tipe file tidak didukung: ' + sanitizeInput(mimeType));
  }
  return true;
}

