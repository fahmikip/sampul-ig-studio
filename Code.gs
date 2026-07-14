function doGet(e) {
  try {
    ensureApplicationReady_();
    var template = HtmlService.createTemplateFromFile('Index');
    template.initialData = serializeJsonForHtml_(getInitialAppData_());

    return template.evaluate()
      .setTitle('Sampul IG Studio')
      .addMetaTag('viewport', 'width=device-width, initial-scale=1');
  } catch (error) {
    return HtmlService.createHtmlOutput(buildFallbackHtml_(error))
      .setTitle('Sampul IG Studio');
  }
}

function include_(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

function setupApplication_() {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(30000);
    var folders = createApplicationFolders_();
    var spreadsheet = initializeSpreadsheet_();
    var settings = initializeDefaultSettings_();
    var templates = initializeDefaultTemplates_();
    clearApplicationCache_();

    return createSuccessResponse({
      folders: folders,
      spreadsheetId: spreadsheet.getId(),
      settingsCount: Object.keys(settings).length,
      templatesCount: templates.length
    }, 'Setup Sampul IG Studio berhasil.');
  } catch (error) {
    return createErrorResponse(error);
  } finally {
    try {
      lock.releaseLock();
    } catch (releaseError) {}
  }
}

function getInitialAppData_() {
  var settings = getAppSettings_();
  return {
    appName: settings.AppName || APP_CONFIG.APP_NAME,
    settings: getPublicSettings_(settings),
    templates: getActiveTemplates(),
    formats: APP_CONFIG.FORMATS,
    colorPresets: APP_CONFIG.COLOR_PRESETS,
    exampleContent: APP_CONFIG.EXAMPLE_CONTENT
  };
}

function clearApplicationCache_() {
  try {
    CacheService.getScriptCache().removeAll([
      APP_CONFIG.CACHE_KEYS.SETTINGS,
      APP_CONFIG.CACHE_KEYS.TEMPLATES,
      APP_CONFIG.CACHE_KEYS.ACTIVE_TEMPLATES
    ]);
    return createSuccessResponse({ cleared: true }, 'Cache aplikasi berhasil dibersihkan.');
  } catch (error) {
    return createErrorResponse(error);
  }
}

function buildFallbackHtml_(error) {
  var message = sanitizeInput(error && error.message ? error.message : String(error));
  return '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">' +
    '<title>Sampul IG Studio</title><style>body{margin:0;background:#0f0f0f;color:#f8f8f8;font-family:Arial,sans-serif;display:grid;place-items:center;min-height:100vh;padding:24px;box-sizing:border-box}.box{max-width:720px;background:#1b1b1b;border:1px solid #2b2b2b;border-radius:12px;padding:24px}p{color:#a3a3a3;line-height:1.6}code{color:#f59e0b}</style></head>' +
    '<body><div class="box"><h1>Sampul IG Studio belum siap</h1><p>Jalankan fungsi <code>setupApplication_()</code> dari editor Google Apps Script, lalu buka ulang Web App.</p><p>' +
    message + '</p></div></body></html>';
}

