function ensureApplicationReady() {
  var props = PropertiesService.getScriptProperties();
  if (!props.getProperty('SpreadsheetID') || !props.getProperty('RootFolderID')) {
    setupApplication();
  }
}

function createApplicationFolders() {
  var props = PropertiesService.getScriptProperties();
  var rootFolderId = props.getProperty('RootFolderID');
  var root = rootFolderId ? DriveApp.getFolderById(rootFolderId) : getOrCreateFolder(null, APP_CONFIG.ROOT_FOLDER_NAME);
  props.setProperty('RootFolderID', root.getId());

  var names = ['Assets', 'Backgrounds', 'Logos', 'Icons', 'Textures', 'Uploads', 'Generated Covers', 'Thumbnails'];
  var folders = { RootFolderID: root.getId(), RootFolderURL: root.getUrl() };
  names.forEach(function(name) {
    var folder = getOrCreateFolder(root, name);
    folders[name.replace(/\s+/g, '') + 'FolderID'] = folder.getId();
  });
  return folders;
}

function initializeSpreadsheet() {
  var props = PropertiesService.getScriptProperties();
  var spreadsheetId = props.getProperty('SpreadsheetID');
  var spreadsheet = spreadsheetId ? SpreadsheetApp.openById(spreadsheetId) : SpreadsheetApp.create(APP_CONFIG.APP_NAME + ' Database');
  props.setProperty('SpreadsheetID', spreadsheet.getId());

  ensureSheet(APP_CONFIG.SHEETS.TEMPLATES, getTemplateHeaders());
  ensureSheet(APP_CONFIG.SHEETS.HISTORY, getHistoryHeaders());
  ensureSheet(APP_CONFIG.SHEETS.SETTINGS, getSettingsHeaders());
  return spreadsheet;
}

function initializeDefaultSettings() {
  createApplicationFolders();
  initializeSpreadsheet();
  var props = PropertiesService.getScriptProperties();
  var defaults = {
    InstagramUsername: '@overthinkingit.id',
    LogoFileID: '',
    SpreadsheetID: props.getProperty('SpreadsheetID') || '',
    RootFolderID: props.getProperty('RootFolderID') || '',
    DefaultTemplateID: 'tpl-cinematic-dark-story',
    DefaultExportFormat: 'png',
    DefaultAccentColor: '#E53935',
    MaxUploadSize: String(APP_CONFIG.MAX_UPLOAD_SIZE),
    AppName: APP_CONFIG.APP_NAME
  };
  Object.keys(defaults).forEach(function(key) {
    if (!getSetting(key)) {
      setSetting(key, defaults[key], 'Pengaturan default aplikasi.');
    }
  });
  return defaults;
}

function initializeDefaultTemplates() {
  initializeSpreadsheet();
  var existing = readSheetObjects(APP_CONFIG.SHEETS.TEMPLATES);
  if (existing.length > 0) return existing;
  var templates = getDefaultTemplates();
  templates.forEach(function(template) {
    appendSheetObject(APP_CONFIG.SHEETS.TEMPLATES, templateToSheetRow(template));
  });
  CacheService.getScriptCache().removeAll([APP_CONFIG.CACHE_KEYS.TEMPLATES, APP_CONFIG.CACHE_KEYS.ACTIVE_TEMPLATES]);
  return templates;
}

function getTemplateHeaders() {
  return ['TemplateID', 'TemplateName', 'Category', 'SupportedFormat', 'BackgroundType', 'BackgroundValue', 'BackgroundImageID', 'FontTitle', 'FontDescription', 'TitleColor', 'DescriptionColor', 'AccentColor', 'OverlayColor', 'OverlayOpacity', 'TitlePosition', 'DescriptionPosition', 'LabelPosition', 'LogoPosition', 'UsernamePosition', 'TitleFontSize', 'DescriptionFontSize', 'MaxTitleLines', 'TextAlignment', 'DecorationConfig', 'IsActive', 'CreatedAt', 'UpdatedAt'];
}

function getHistoryHeaders() {
  return ['DesignID', 'Timestamp', 'Title', 'Description', 'Category', 'TemplateID', 'TemplateName', 'Format', 'FileName', 'FileID', 'FileURL', 'ThumbnailURL', 'Status'];
}

function getSettingsHeaders() {
  return ['Key', 'Value', 'Description'];
}

function getDefaultTemplates() {
  var now = getCurrentIsoDate();
  var specs = [
    ['tpl-cinematic-dark-story', 'Dark Story', 'Cinematic Dark', '#0F0F0F', '#E53935', 'diagonal', 106],
    ['tpl-night-reflection', 'Night Reflection', 'Cinematic Dark', '#111827', '#60A5FA', 'bars', 96],
    ['tpl-cinematic-journey', 'Cinematic Journey', 'Cinematic Dark', '#141414', '#F59E0B', 'frame', 100],
    ['tpl-minimal-journal', 'Minimal Journal', 'Editorial Beige', '#E8DDCF', '#A16207', 'editorial', 92],
    ['tpl-soft-editorial', 'Soft Editorial', 'Editorial Beige', '#F1E7DA', '#BE123C', 'corner', 88],
    ['tpl-personal-notes', 'Personal Notes', 'Editorial Beige', '#EFE4D2', '#2563EB', 'lines', 84],
    ['tpl-purple-technology', 'Purple Technology', 'Modern Gradient', '#1E1238', '#A855F7', 'gradient', 94],
    ['tpl-blue-application', 'Blue Application', 'Modern Gradient', '#071A2F', '#38BDF8', 'grid', 92],
    ['tpl-neon-digital', 'Neon Digital', 'Modern Gradient', '#080A12', '#22C55E', 'neon', 90],
    ['tpl-clean-tips', 'Clean Tips', 'Minimal Education', '#F5F5F5', '#E53935', 'minimal', 82],
    ['tpl-professional-information', 'Professional Information', 'Minimal Education', '#EFF6FF', '#2563EB', 'info', 80],
    ['tpl-simple-listicle', 'Simple Listicle', 'Minimal Education', '#FAFAFA', '#111111', 'list', 78],
    ['tpl-full-photo-title', 'Full Photo Title', 'Photo Focus', '#0F0F0F', '#E53935', 'photo-full', 96],
    ['tpl-split-image', 'Split Image', 'Photo Focus', '#121212', '#F59E0B', 'split', 90],
    ['tpl-bottom-gradient-story', 'Bottom Gradient Story', 'Photo Focus', '#101010', '#22C55E', 'bottom-gradient', 92]
  ];

  return specs.map(function(spec, index) {
    return {
      TemplateID: spec[0],
      TemplateName: spec[1],
      Category: spec[2],
      SupportedFormat: jsonStringify(['feed-portrait', 'feed-square', 'story', 'reels-cover']),
      BackgroundType: spec[5].indexOf('gradient') > -1 ? 'gradient' : 'color',
      BackgroundValue: spec[3],
      BackgroundImageID: '',
      FontTitle: index < 3 ? 'Oswald' : 'Poppins',
      FontDescription: 'Inter',
      TitleColor: spec[2] === 'Minimal Education' || spec[2] === 'Editorial Beige' ? '#171717' : '#F8F8F8',
      DescriptionColor: spec[2] === 'Minimal Education' || spec[2] === 'Editorial Beige' ? '#57534E' : '#D4D4D4',
      AccentColor: spec[4],
      OverlayColor: '#000000',
      OverlayOpacity: spec[2] === 'Photo Focus' ? 0.42 : 0.18,
      TitlePosition: jsonStringify({ x: 88, y: 470, width: 904, anchor: 'left' }),
      DescriptionPosition: jsonStringify({ x: 88, y: 735, width: 820, anchor: 'left' }),
      LabelPosition: jsonStringify({ x: 88, y: 150, width: 560, anchor: 'left' }),
      LogoPosition: jsonStringify({ x: 88, y: 1180, size: 54 }),
      UsernamePosition: jsonStringify({ x: 156, y: 1214, width: 520, anchor: 'left' }),
      TitleFontSize: spec[6],
      DescriptionFontSize: 34,
      MaxTitleLines: 3,
      TextAlignment: 'left',
      DecorationConfig: jsonStringify({ style: spec[5], showGrain: true, showFrame: true, showDots: index % 2 === 0 }),
      IsActive: true,
      CreatedAt: now,
      UpdatedAt: now
    };
  });
}

function templateToSheetRow(template) {
  return template;
}

