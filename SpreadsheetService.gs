function getSpreadsheet() {
  var spreadsheetId = PropertiesService.getScriptProperties().getProperty('SpreadsheetID');
  if (spreadsheetId) {
    return SpreadsheetApp.openById(spreadsheetId);
  }
  return initializeSpreadsheet();
}

function getSheetByName(sheetName) {
  var sheet = getSpreadsheet().getSheetByName(sheetName);
  if (!sheet) throw new Error('Sheet tidak ditemukan: ' + sheetName);
  return sheet;
}

function ensureSheet(sheetName, headers) {
  var spreadsheet = getSpreadsheet();
  var sheet = spreadsheet.getSheetByName(sheetName) || spreadsheet.insertSheet(sheetName);
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function readSheetObjects(sheetName) {
  var sheet = getSheetByName(sheetName);
  var values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];
  var headers = values[0];
  return values.slice(1).filter(function(row) {
    return row.join('') !== '';
  }).map(function(row) {
    var object = {};
    headers.forEach(function(header, index) {
      object[header] = row[index];
    });
    return object;
  });
}

function appendSheetObject(sheetName, data) {
  var lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    var sheet = getSheetByName(sheetName);
    var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    var row = headers.map(function(header) {
      return data[header] !== undefined ? data[header] : '';
    });
    sheet.appendRow(row);
    return data;
  } finally {
    lock.releaseLock();
  }
}

function updateSheetObject(sheetName, keyColumn, keyValue, data) {
  var lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    var sheet = getSheetByName(sheetName);
    var values = sheet.getDataRange().getValues();
    var headers = values[0];
    var keyIndex = headers.indexOf(keyColumn);
    if (keyIndex === -1) throw new Error('Kolom kunci tidak ditemukan: ' + keyColumn);

    for (var i = 1; i < values.length; i++) {
      if (String(values[i][keyIndex]) === String(keyValue)) {
        var row = headers.map(function(header, index) {
          return data[header] !== undefined ? data[header] : values[i][index];
        });
        sheet.getRange(i + 1, 1, 1, headers.length).setValues([row]);
        return data;
      }
    }
    throw new Error('Data tidak ditemukan: ' + keyValue);
  } finally {
    lock.releaseLock();
  }
}

function deleteSheetObject(sheetName, keyColumn, keyValue) {
  var lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    var sheet = getSheetByName(sheetName);
    var values = sheet.getDataRange().getValues();
    var headers = values[0];
    var keyIndex = headers.indexOf(keyColumn);
    if (keyIndex === -1) throw new Error('Kolom kunci tidak ditemukan: ' + keyColumn);

    for (var i = 1; i < values.length; i++) {
      if (String(values[i][keyIndex]) === String(keyValue)) {
        sheet.deleteRow(i + 1);
        return true;
      }
    }
    return false;
  } finally {
    lock.releaseLock();
  }
}

