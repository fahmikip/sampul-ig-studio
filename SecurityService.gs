function requireOwnerExecution_() {
  var activeEmail = Session.getActiveUser().getEmail();
  var ownerEmail = Session.getEffectiveUser().getEmail();
  if (!activeEmail || !ownerEmail || activeEmail.toLowerCase() !== ownerEmail.toLowerCase()) {
    throw new Error('Fungsi ini hanya dapat dijalankan oleh pemilik proyek dari editor Apps Script.');
  }
  return true;
}

function rotateAdminAccessToken() {
  requireOwnerExecution_();
  return rotateAdminAccessToken_();
}

function showNewAdminToken() {
  console.log(JSON.stringify(rotateAdminAccessToken()));
}

function rotateAdminAccessToken_() {
  var token = Utilities.getUuid() + Utilities.getUuid().replace(/-/g, '');
  PropertiesService.getScriptProperties().setProperty('AdminAccessToken', token);
  return createSuccessResponse({ token: token }, 'Token admin baru berhasil dibuat. Simpan token ini dengan aman.');
}

function requireAdminAccess_(token) {
  var expected = PropertiesService.getScriptProperties().getProperty('AdminAccessToken');
  if (!expected) {
    throw new Error('Akses admin belum dikonfigurasi. Jalankan rotateAdminAccessToken() dari editor Apps Script.');
  }
  if (!token || !constantTimeEquals_(String(token), expected)) {
    throw new Error('Token admin tidak valid.');
  }
  return true;
}

function constantTimeEquals_(left, right) {
  if (left.length !== right.length) return false;
  var difference = 0;
  for (var i = 0; i < left.length; i++) {
    difference |= left.charCodeAt(i) ^ right.charCodeAt(i);
  }
  return difference === 0;
}

function validatePublicSessionId_(sessionId) {
  var value = String(sessionId || '');
  if (!/^[A-Za-z0-9_-]{20,100}$/.test(value)) {
    throw new Error('Sesi perangkat tidak valid. Muat ulang aplikasi.');
  }
  return value;
}
