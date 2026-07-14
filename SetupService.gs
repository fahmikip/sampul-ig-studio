function ensureApplicationReady_() {
  var props = PropertiesService.getScriptProperties();
  if (!props.getProperty('SpreadsheetID') || !props.getProperty('RootFolderID')) {
    setupApplication_();
    return;
  }
  ensureSheetColumns_(APP_CONFIG.SHEETS.HISTORY, getHistoryHeaders_());
}

function createApplicationFolders_() {
  var props = PropertiesService.getScriptProperties();
  var rootFolderId = props.getProperty('RootFolderID');
  var root = rootFolderId ? DriveApp.getFolderById(rootFolderId) : getOrCreateFolder_(null, APP_CONFIG.ROOT_FOLDER_NAME);
  props.setProperty('RootFolderID', root.getId());

  var names = ['Assets', 'Backgrounds', 'Logos', 'Icons', 'Textures', 'Uploads', 'Generated Covers', 'Thumbnails'];
  var folders = { RootFolderID: root.getId(), RootFolderURL: root.getUrl() };
  names.forEach(function(name) {
    var folder = getOrCreateFolder_(root, name);
    folders[name.replace(/\s+/g, '') + 'FolderID'] = folder.getId();
  });
  return folders;
}

function initializeSpreadsheet_() {
  var props = PropertiesService.getScriptProperties();
  var spreadsheetId = props.getProperty('SpreadsheetID');
  var spreadsheet = spreadsheetId ? SpreadsheetApp.openById(spreadsheetId) : SpreadsheetApp.create(APP_CONFIG.APP_NAME + ' Database');
  props.setProperty('SpreadsheetID', spreadsheet.getId());

  ensureSheet_(APP_CONFIG.SHEETS.TEMPLATES, getTemplateHeaders_());
  ensureSheet_(APP_CONFIG.SHEETS.HISTORY, getHistoryHeaders_());
  ensureSheet_(APP_CONFIG.SHEETS.SETTINGS, getSettingsHeaders_());
  ensureSheetColumns_(APP_CONFIG.SHEETS.HISTORY, getHistoryHeaders_());
  return spreadsheet;
}

function initializeDefaultSettings_() {
  createApplicationFolders_();
  initializeSpreadsheet_();
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
    if (!getSetting_(key)) {
      setSetting_(key, defaults[key], 'Pengaturan default aplikasi.');
    }
  });
  return defaults;
}

function initializeDefaultTemplates_() {
  initializeSpreadsheet_();
  removeDeprecatedDefaultTemplates_();
  var existing = readSheetObjects_(APP_CONFIG.SHEETS.TEMPLATES);
  var templates = getDefaultTemplates_();
  if (existing.length > 0) {
    var existingIds = existing.map(function(row) {
      return row.TemplateID;
    });
    var missingTemplates = templates.filter(function(template) {
      return existingIds.indexOf(template.TemplateID) === -1;
    });
    missingTemplates.forEach(function(template) {
      appendSheetObject_(APP_CONFIG.SHEETS.TEMPLATES, templateToSheetRow_(template));
    });
    CacheService.getScriptCache().removeAll([APP_CONFIG.CACHE_KEYS.TEMPLATES, APP_CONFIG.CACHE_KEYS.ACTIVE_TEMPLATES]);
    return existing.concat(missingTemplates);
  }
  templates.forEach(function(template) {
    appendSheetObject_(APP_CONFIG.SHEETS.TEMPLATES, templateToSheetRow_(template));
  });
  CacheService.getScriptCache().removeAll([APP_CONFIG.CACHE_KEYS.TEMPLATES, APP_CONFIG.CACHE_KEYS.ACTIVE_TEMPLATES]);
  return templates;
}

function getTemplateHeaders_() {
  return ['TemplateID', 'TemplateName', 'Category', 'SupportedFormat', 'BackgroundType', 'BackgroundValue', 'BackgroundImageID', 'FontTitle', 'FontDescription', 'TitleColor', 'DescriptionColor', 'AccentColor', 'OverlayColor', 'OverlayOpacity', 'TitlePosition', 'DescriptionPosition', 'LabelPosition', 'LogoPosition', 'UsernamePosition', 'TitleFontSize', 'DescriptionFontSize', 'MaxTitleLines', 'TextAlignment', 'DecorationConfig', 'IsActive', 'CreatedAt', 'UpdatedAt'];
}

function getHistoryHeaders_() {
  return ['DesignID', 'Timestamp', 'SessionID', 'Title', 'Description', 'Category', 'TemplateID', 'TemplateName', 'Format', 'FileName', 'FileID', 'FileURL', 'ThumbnailURL', 'Status'];
}

function removeDeprecatedDefaultTemplates_() {
  var deprecatedIds = ['tpl-garuda-merdeka-1994', 'tpl-garuda-putih-hero'];
  var sheet = getSheetByName_(APP_CONFIG.SHEETS.TEMPLATES);
  var values = sheet.getDataRange().getValues();
  if (values.length < 2) return;
  var idColumn = values[0].indexOf('TemplateID');
  if (idColumn === -1) return;
  for (var row = values.length - 1; row >= 1; row--) {
    if (deprecatedIds.indexOf(String(values[row][idColumn])) !== -1) {
      sheet.deleteRow(row + 1);
    }
  }
}

function getSettingsHeaders_() {
  return ['Key', 'Value', 'Description'];
}

function getDefaultTemplates_() {
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
    ['tpl-bottom-gradient-story', 'Bottom Gradient Story', 'Photo Focus', '#101010', '#22C55E', 'bottom-gradient', 92],
    ['tpl-executive-slate', 'Executive Slate', 'Professional Modern', '#0B1220', '#14B8A6', 'executive-grid', 88, '#F8FAFC', '#CBD5E1', 0.2, 'Inter'],
    ['tpl-luxury-carbon', 'Luxury Carbon', 'Professional Modern', '#111827', '#D4AF37', 'premium-split', 92, '#FFFFFF', '#D1D5DB', 0.24, 'Oswald'],
    ['tpl-aurora-report', 'Aurora Report', 'Professional Modern', '#111D3A', '#8B5CF6', 'aurora', 86, '#F8FAFC', '#DDD6FE', 0.22, 'Poppins'],
    ['tpl-studio-glass', 'Studio Glass', 'Professional Modern', '#0E1726', '#38BDF8', 'glass-panel', 90, '#F8FAFC', '#BAE6FD', 0.18, 'Inter'],
    ['tpl-focus-rings', 'Focus Rings', 'Professional Modern', '#101828', '#F97316', 'focus-rings', 88, '#FFFFFF', '#FED7AA', 0.2, 'Poppins'],
    ['tpl-signal-lines', 'Signal Lines', 'Professional Modern', '#08111F', '#22C55E', 'signal-lines', 84, '#ECFDF5', '#BBF7D0', 0.16, 'Inter'],
    ['tpl-ivory-grid', 'Ivory Grid', 'Elegant Grid', '#F4F0E8', '#B08D57', 'elegant-grid', 86, null, '#172033', '#667085', 0.06, 'Poppins'],
    ['tpl-merdeka-proklamasi', 'Merdeka Proklamasi', 'Kemerdekaan 17 Agustus', '#B91C1C', '#FFFFFF', 'merdeka-ribbon', 92, '#FFFFFF', '#FEE2E2', 0.18, 'Oswald'],
    ['tpl-merah-putih-modern', 'Merah Putih Modern', 'Kemerdekaan 17 Agustus', '#FAFAFA', '#DC2626', 'red-white-modern', 88, '#111827', '#4B5563', 0.08, 'Poppins'],
    ['tpl-nusantara-bold', 'Nusantara Bold', 'Kemerdekaan 17 Agustus', '#7F1D1D', '#FACC15', 'nusantara-bold', 96, '#FFF7ED', '#FED7AA', 0.2, 'Oswald']
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
      FontTitle: spec[11] || (index < 3 ? 'Oswald' : 'Poppins'),
      FontDescription: 'Inter',
      TitleColor: spec[8] || (spec[2] === 'Minimal Education' || spec[2] === 'Editorial Beige' ? '#171717' : '#F8F8F8'),
      DescriptionColor: spec[9] || (spec[2] === 'Minimal Education' || spec[2] === 'Editorial Beige' ? '#57534E' : '#D4D4D4'),
      AccentColor: spec[4],
      OverlayColor: '#000000',
      OverlayOpacity: spec[10] !== undefined ? spec[10] : (spec[2] === 'Photo Focus' ? 0.42 : 0.18),
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

function templateToSheetRow_(template) {
  return template;
}
