function getAppSettings_() {
  var cache = CacheService.getScriptCache();
  var cached = cache.get(APP_CONFIG.CACHE_KEYS.SETTINGS);
  if (cached) return JSON.parse(cached);

  var settingsRows = readSheetObjects_(APP_CONFIG.SHEETS.SETTINGS);
  var settings = {};
  settingsRows.forEach(function(row) {
    settings[row.Key] = row.Value;
  });
  cache.put(APP_CONFIG.CACHE_KEYS.SETTINGS, JSON.stringify(settings), 600);
  return settings;
}

function getPublicSettings_(settings) {
  settings = settings || getAppSettings_();
  return {
    InstagramUsername: settings.InstagramUsername || '@overthinkingit.id',
    DefaultTemplateID: settings.DefaultTemplateID || 'tpl-cinematic-dark-story',
    DefaultExportFormat: settings.DefaultExportFormat || 'png',
    DefaultAccentColor: settings.DefaultAccentColor || '#E53935',
    MaxUploadSize: Number(settings.MaxUploadSize || APP_CONFIG.MAX_UPLOAD_SIZE),
    AppName: settings.AppName || APP_CONFIG.APP_NAME
  };
}

function saveAppSettings(settings, adminToken) {
  try {
    requireAdminAccess_(adminToken);
    Object.keys(settings || {}).forEach(function(key) {
      setSetting_(key, settings[key], 'Diperbarui dari halaman pengaturan.');
    });
    clearApplicationCache_();
    return createSuccessResponse(getAppSettings_(), 'Pengaturan berhasil disimpan.');
  } catch (error) {
    return createErrorResponse(error);
  }
}

function getSetting_(key) {
  return getAppSettings_()[key] || '';
}

function setSetting_(key, value, description) {
  var rows = readSheetObjects_(APP_CONFIG.SHEETS.SETTINGS);
  var exists = rows.some(function(row) {
    return row.Key === key;
  });
  var data = {
    Key: sanitizeInput(key),
    Value: sanitizeInput(value),
    Description: sanitizeInput(description || '')
  };
  if (exists) {
    updateSheetObject_(APP_CONFIG.SHEETS.SETTINGS, 'Key', key, data);
  } else {
    appendSheetObject_(APP_CONFIG.SHEETS.SETTINGS, data);
  }
  CacheService.getScriptCache().remove(APP_CONFIG.CACHE_KEYS.SETTINGS);
  return data;
}

