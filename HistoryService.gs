function saveDesignHistory_(data) {
  try {
    var row = {
      DesignID: data.DesignID || generateUniqueId('DSN'),
      Timestamp: data.Timestamp || getCurrentIsoDate(),
      SessionID: validatePublicSessionId_(data.SessionID || data.sessionId),
      Title: sanitizeInput(data.Title || data.title),
      Description: sanitizeInput(data.Description || data.description || ''),
      Category: sanitizeInput(data.Category || data.category || ''),
      TemplateID: sanitizeInput(data.TemplateID || data.templateId || ''),
      TemplateName: sanitizeInput(data.TemplateName || data.templateName || ''),
      Format: sanitizeInput(data.Format || data.format || ''),
      FileName: sanitizeInput(data.FileName || data.fileName || ''),
      FileID: sanitizeInput(data.FileID || data.fileId || ''),
      FileURL: sanitizeInput(data.FileURL || data.fileUrl || ''),
      ThumbnailURL: sanitizeInput(data.ThumbnailURL || data.thumbnailUrl || ''),
      Status: sanitizeInput(data.Status || data.status || 'Saved')
    };
    appendSheetObject_(APP_CONFIG.SHEETS.HISTORY, row);
    return createSuccessResponse(row, 'Riwayat desain berhasil disimpan.');
  } catch (error) {
    return createErrorResponse(error);
  }
}

function getDesignHistory(filters) {
  try {
    filters = filters || {};
    var sessionId = validatePublicSessionId_(filters.sessionId);
    var rows = readSheetObjects_(APP_CONFIG.SHEETS.HISTORY).reverse();
    var query = sanitizeInput(filters.query || '').toLowerCase();
    var template = sanitizeInput(filters.template || '');
    var format = sanitizeInput(filters.format || '');
    var date = sanitizeInput(filters.date || '');

    var filtered = rows.filter(function(row) {
      if (String(row.SessionID || '') !== sessionId) return false;
      var matchesQuery = !query || String(row.Title + ' ' + row.Description).toLowerCase().indexOf(query) > -1;
      var matchesTemplate = !template || row.TemplateID === template || row.TemplateName === template;
      var matchesFormat = !format || row.Format === format;
      var matchesDate = !date || String(row.Timestamp).indexOf(date) === 0;
      return matchesQuery && matchesTemplate && matchesFormat && matchesDate;
    });
    return createSuccessResponse(filtered, 'Riwayat desain berhasil dimuat.');
  } catch (error) {
    return createErrorResponse(error);
  }
}

function deleteGeneratedDesign(designId, sessionId) {
  try {
    sessionId = validatePublicSessionId_(sessionId);
    var history = readSheetObjects_(APP_CONFIG.SHEETS.HISTORY);
    var item = history.filter(function(row) {
      return row.DesignID === designId && String(row.SessionID || '') === sessionId;
    })[0];
    if (!item) throw new Error('Desain tidak ditemukan atau bukan milik sesi ini.');
    if (item && item.FileID) {
      try {
        DriveApp.getFileById(item.FileID).setTrashed(true);
      } catch (driveError) {}
    }
    var deleted = deleteSheetObject_(APP_CONFIG.SHEETS.HISTORY, 'DesignID', designId);
    return createSuccessResponse({ deleted: deleted }, deleted ? 'Desain berhasil dihapus.' : 'Desain tidak ditemukan.');
  } catch (error) {
    return createErrorResponse(error);
  }
}

function duplicateDesign(designId, sessionId) {
  try {
    sessionId = validatePublicSessionId_(sessionId);
    var history = readSheetObjects_(APP_CONFIG.SHEETS.HISTORY);
    var source = history.filter(function(row) {
      return row.DesignID === designId && String(row.SessionID || '') === sessionId;
    })[0];
    if (!source) throw new Error('Desain tidak ditemukan.');

    var copy = {};
    Object.keys(source).forEach(function(key) {
      copy[key] = source[key];
    });
    copy.DesignID = generateUniqueId('DSN');
    copy.Timestamp = getCurrentIsoDate();
    copy.Title = source.Title + ' Copy';
    copy.Status = 'Duplicated';
    appendSheetObject_(APP_CONFIG.SHEETS.HISTORY, copy);
    return createSuccessResponse(copy, 'Desain berhasil diduplikat.');
  } catch (error) {
    return createErrorResponse(error);
  }
}

