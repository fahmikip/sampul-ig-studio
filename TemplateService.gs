function getTemplates() {
  var cache = CacheService.getScriptCache();
  var cached = cache.get(APP_CONFIG.CACHE_KEYS.TEMPLATES);
  if (cached) return JSON.parse(cached);

  var rows = readSheetObjects(APP_CONFIG.SHEETS.TEMPLATES);
  var templates = rows.map(sheetRowToTemplate);
  cache.put(APP_CONFIG.CACHE_KEYS.TEMPLATES, JSON.stringify(templates), 600);
  return templates;
}

function getActiveTemplates() {
  var cache = CacheService.getScriptCache();
  var cached = cache.get(APP_CONFIG.CACHE_KEYS.ACTIVE_TEMPLATES);
  if (cached) return JSON.parse(cached);

  var templates = getTemplates().filter(function(template) {
    return String(template.IsActive) === 'true' || template.IsActive === true;
  });
  cache.put(APP_CONFIG.CACHE_KEYS.ACTIVE_TEMPLATES, JSON.stringify(templates), 600);
  return templates;
}

function getTemplateById(templateId) {
  var template = getTemplates().filter(function(item) {
    return item.TemplateID === templateId;
  })[0];
  if (!template) throw new Error('Template tidak ditemukan: ' + sanitizeInput(templateId));
  return template;
}

function saveTemplate(templateData, adminToken) {
  try {
    requireAdminAccess(adminToken);
    validateTemplateData(templateData);
    var now = getCurrentIsoDate();
    var row = normalizeTemplateForSheet(templateData);
    row.TemplateID = row.TemplateID || generateUniqueId('TPL');
    row.CreatedAt = now;
    row.UpdatedAt = now;
    appendSheetObject(APP_CONFIG.SHEETS.TEMPLATES, row);
    clearApplicationCache();
    return createSuccessResponse(sheetRowToTemplate(row), 'Template berhasil disimpan.');
  } catch (error) {
    return createErrorResponse(error);
  }
}

function updateTemplate(templateData, adminToken) {
  try {
    requireAdminAccess(adminToken);
    validateTemplateData(templateData);
    if (!templateData.TemplateID && !templateData.id) throw new Error('Template ID wajib diisi.');
    var row = normalizeTemplateForSheet(templateData);
    row.UpdatedAt = getCurrentIsoDate();
    updateSheetObject(APP_CONFIG.SHEETS.TEMPLATES, 'TemplateID', row.TemplateID, row);
    clearApplicationCache();
    return createSuccessResponse(sheetRowToTemplate(row), 'Template berhasil diperbarui.');
  } catch (error) {
    return createErrorResponse(error);
  }
}

function deleteTemplate(templateId, adminToken) {
  try {
    requireAdminAccess(adminToken);
    var deleted = deleteSheetObject(APP_CONFIG.SHEETS.TEMPLATES, 'TemplateID', templateId);
    clearApplicationCache();
    return createSuccessResponse({ deleted: deleted }, deleted ? 'Template berhasil dihapus.' : 'Template tidak ditemukan.');
  } catch (error) {
    return createErrorResponse(error);
  }
}

function sheetRowToTemplate(row) {
  var template = {};
  Object.keys(row).forEach(function(key) {
    template[key] = row[key];
  });
  template.SupportedFormat = jsonParseSafe(row.SupportedFormat, []);
  template.TitlePosition = jsonParseSafe(row.TitlePosition, {});
  template.DescriptionPosition = jsonParseSafe(row.DescriptionPosition, {});
  template.LabelPosition = jsonParseSafe(row.LabelPosition, {});
  template.LogoPosition = jsonParseSafe(row.LogoPosition, {});
  template.UsernamePosition = jsonParseSafe(row.UsernamePosition, {});
  template.DecorationConfig = jsonParseSafe(row.DecorationConfig, {});
  template.OverlayOpacity = Number(row.OverlayOpacity || 0);
  template.TitleFontSize = Number(row.TitleFontSize || 90);
  template.DescriptionFontSize = Number(row.DescriptionFontSize || 34);
  template.MaxTitleLines = Number(row.MaxTitleLines || 3);
  template.IsActive = String(row.IsActive) === 'true' || row.IsActive === true;
  return template;
}

function normalizeTemplateForSheet(data) {
  var now = getCurrentIsoDate();
  return {
    TemplateID: sanitizeInput(data.TemplateID || data.id || generateUniqueId('TPL')),
    TemplateName: sanitizeInput(data.TemplateName || data.name),
    Category: sanitizeInput(data.Category || data.category),
    SupportedFormat: typeof data.SupportedFormat === 'string' ? data.SupportedFormat : jsonStringify(data.SupportedFormat || data.supportedFormats || ['feed-portrait']),
    BackgroundType: sanitizeInput(data.BackgroundType || data.backgroundType || 'color'),
    BackgroundValue: sanitizeInput(data.BackgroundValue || data.backgroundValue || '#0F0F0F'),
    BackgroundImageID: sanitizeInput(data.BackgroundImageID || data.backgroundImageId || ''),
    FontTitle: sanitizeInput(data.FontTitle || data.fontTitle || 'Oswald'),
    FontDescription: sanitizeInput(data.FontDescription || data.fontDescription || 'Inter'),
    TitleColor: sanitizeInput(data.TitleColor || data.titleColor || '#F8F8F8'),
    DescriptionColor: sanitizeInput(data.DescriptionColor || data.descriptionColor || '#D4D4D4'),
    AccentColor: sanitizeInput(data.AccentColor || data.accentColor || '#E53935'),
    OverlayColor: sanitizeInput(data.OverlayColor || data.overlayColor || '#000000'),
    OverlayOpacity: Number(data.OverlayOpacity || data.overlayOpacity || 0.25),
    TitlePosition: typeof data.TitlePosition === 'string' ? data.TitlePosition : jsonStringify(data.TitlePosition || data.titlePosition || { x: 88, y: 470, width: 904, anchor: 'left' }),
    DescriptionPosition: typeof data.DescriptionPosition === 'string' ? data.DescriptionPosition : jsonStringify(data.DescriptionPosition || data.descriptionPosition || { x: 88, y: 735, width: 820, anchor: 'left' }),
    LabelPosition: typeof data.LabelPosition === 'string' ? data.LabelPosition : jsonStringify(data.LabelPosition || data.labelPosition || { x: 88, y: 150, width: 560, anchor: 'left' }),
    LogoPosition: typeof data.LogoPosition === 'string' ? data.LogoPosition : jsonStringify(data.LogoPosition || data.logoPosition || { x: 88, y: 1180, size: 54 }),
    UsernamePosition: typeof data.UsernamePosition === 'string' ? data.UsernamePosition : jsonStringify(data.UsernamePosition || data.usernamePosition || { x: 156, y: 1214, width: 520, anchor: 'left' }),
    TitleFontSize: Number(data.TitleFontSize || data.titleFontSize || 90),
    DescriptionFontSize: Number(data.DescriptionFontSize || data.descriptionFontSize || 34),
    MaxTitleLines: Number(data.MaxTitleLines || data.maxTitleLines || 3),
    TextAlignment: sanitizeInput(data.TextAlignment || data.textAlignment || 'left'),
    DecorationConfig: typeof data.DecorationConfig === 'string' ? data.DecorationConfig : jsonStringify(data.DecorationConfig || data.decorationConfig || {}),
    IsActive: data.IsActive === false || data.isActive === false ? false : true,
    CreatedAt: sanitizeInput(data.CreatedAt || now),
    UpdatedAt: sanitizeInput(data.UpdatedAt || now)
  };
}

