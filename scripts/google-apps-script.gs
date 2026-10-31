/**
 * Lead sheet for the website. Every enquiry and dealer application is added as a row.
 *
 * Setup (once):
 * 1. Create a Google Sheet. Extensions > Apps Script. Paste this whole file. Save.
 * 2. Deploy > New deployment > type "Web app".
 *    Execute as: Me. Who has access: Anyone.
 * 3. Copy the web app URL (ends in /exec) into src/data/site.json > leads.appsScriptUrl, then push.
 *
 * Each form gets its own tab ("enquiry", "dealer"). New fields get new columns automatically.
 */
function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const data = e.parameter;
    if (data['bot-field']) return ContentService.createTextOutput('ok'); // spam honeypot

    const name = data.form === 'dealer' ? 'dealer' : 'enquiry';
    const book = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = book.getSheetByName(name) || book.insertSheet(name);

    const fields = Object.keys(data).filter((k) => k !== 'form' && k !== 'bot-field');
    let headers = sheet.getLastRow() ? sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0] : [];
    if (!headers.length) headers = ['received_at'];
    const missing = fields.filter((f) => headers.indexOf(f) === -1);
    if (missing.length) headers = headers.concat(missing);
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);

    const row = headers.map((h) => (h === 'received_at' ? new Date() : data[h] || ''));
    sheet.appendRow(row);
    return ContentService.createTextOutput('ok');
  } finally {
    lock.releaseLock();
  }
}
