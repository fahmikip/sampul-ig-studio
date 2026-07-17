function uploadTemplateAsset(base64Data, fileName, mimeType, adminToken) {
  try {
    requireAdminAccess_(adminToken);
    validateUploadFile(base64Data, fileName, mimeType);
    var folders = createApplicationFolders_();
    var folder = DriveApp.getFolderById(folders.AssetsFolderID);
    var bytes = parseBase64Data(base64Data);
    var blob = Utilities.newBlob(bytes, mimeType, sanitizeFileName(fileName));
    var file = folder.createFile(blob);

    return createSuccessResponse({
      fileId: file.getId(),
      fileName: file.getName(),
      fileUrl: file.getUrl()
    }, 'Aset template berhasil diunggah.');
  } catch (error) {
    return createErrorResponse(error);
  }
}

function saveGeneratedImage(base64Data, fileName, mimeType, metadata) {
  var file = null;
  try {
    validateGeneratedImage(base64Data, fileName, mimeType);
    validateDesignMetadata(metadata);
    var sessionId = validatePublicSessionId_(metadata.sessionId);
    consumePublicSaveQuota_(sessionId);

    var folder = getOrCreateMonthlyFolder_();
    var cleanName = sanitizeFileName(fileName);
    var bytes = parseBase64Data(base64Data);
    var blob = Utilities.newBlob(bytes, mimeType, cleanName);
    file = folder.createFile(blob);

    var history = saveDesignHistory_({
      Title: metadata.title,
      SessionID: sessionId,
      Description: metadata.description || '',
      Category: metadata.category || '',
      TemplateID: metadata.templateId || '',
      TemplateName: metadata.templateName || '',
      Format: metadata.format || '',
      FileName: cleanName,
      FileID: file.getId(),
      FileURL: file.getUrl(),
      ThumbnailURL: file.getUrl(),
      Status: 'Saved'
    });
    if (!history.success) throw new Error(history.message || 'Riwayat desain gagal disimpan.');

    return createSuccessResponse({
      fileId: file.getId(),
      fileUrl: file.getUrl(),
      fileName: cleanName,
      history: history.data
    }, 'Desain berhasil disimpan ke Google Drive.');
  } catch (error) {
    if (file) {
      try {
        file.setTrashed(true);
      } catch (cleanupError) {}
    }
    return createErrorResponse(error);
  }
}

function getDriveAsset(fileId, adminToken) {
  try {
    requireAdminAccess_(adminToken);
    if (!fileId) throw new Error('File ID wajib diisi.');
    var file = DriveApp.getFileById(fileId);
    var blob = file.getBlob();
    var encoded = Utilities.base64Encode(blob.getBytes());
    return createSuccessResponse({
      fileId: file.getId(),
      fileName: file.getName(),
      mimeType: blob.getContentType(),
      dataUrl: 'data:' + blob.getContentType() + ';base64,' + encoded
    }, 'Aset berhasil dimuat.');
  } catch (error) {
    return createErrorResponse(error);
  }
}

function getOrCreateMonthlyFolder_() {
  var folders = createApplicationFolders_();
  var root = DriveApp.getFolderById(folders.GeneratedCoversFolderID);
  var parts = getCurrentYearMonthFolderName();
  var yearFolder = getOrCreateFolder_(root, parts.year);
  return getOrCreateFolder_(yearFolder, parts.month);
}

function getOrCreateFolder_(parentFolder, folderName) {
  var folders = parentFolder ? parentFolder.getFoldersByName(folderName) : DriveApp.getFoldersByName(folderName);
  if (folders.hasNext()) return folders.next();
  return parentFolder ? parentFolder.createFolder(folderName) : DriveApp.createFolder(folderName);
}

