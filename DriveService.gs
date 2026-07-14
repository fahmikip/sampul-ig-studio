function uploadTemplateAsset(base64Data, fileName, mimeType, adminToken) {
  try {
    requireAdminAccess(adminToken);
    validateUploadFile(base64Data, fileName, mimeType);
    var folders = createApplicationFolders();
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
  try {
    validateGeneratedImage(base64Data, fileName, mimeType);
    validateDesignMetadata(metadata);

    var folder = getOrCreateMonthlyFolder();
    var cleanName = sanitizeFileName(fileName);
    var bytes = parseBase64Data(base64Data);
    var blob = Utilities.newBlob(bytes, mimeType, cleanName);
    var file = folder.createFile(blob);

    var history = saveDesignHistory({
      Title: metadata.title,
      SessionID: validatePublicSessionId(metadata.sessionId),
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

    return createSuccessResponse({
      fileId: file.getId(),
      fileUrl: file.getUrl(),
      fileName: cleanName,
      history: history.data
    }, 'Desain berhasil disimpan ke Google Drive.');
  } catch (error) {
    return createErrorResponse(error);
  }
}

function getDriveAsset(fileId) {
  try {
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

function getOrCreateMonthlyFolder() {
  var folders = createApplicationFolders();
  var root = DriveApp.getFolderById(folders.GeneratedCoversFolderID);
  var parts = getCurrentYearMonthFolderName();
  var yearFolder = getOrCreateFolder(root, parts.year);
  return getOrCreateFolder(yearFolder, parts.month);
}

function getOrCreateFolder(parentFolder, folderName) {
  var folders = parentFolder ? parentFolder.getFoldersByName(folderName) : DriveApp.getFoldersByName(folderName);
  if (folders.hasNext()) return folders.next();
  return parentFolder ? parentFolder.createFolder(folderName) : DriveApp.createFolder(folderName);
}

