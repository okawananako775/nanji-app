# Survey → Google Sheets setup

nanji? sends feedback from the in-app survey card to a Google Apps Script web app, which appends a row to a spreadsheet.

## 1. Create a spreadsheet

Columns (row 1 headers):

| submittedAt | rating | comment | locale | appVersion |
|---|---|---|---|---|

## 2. Apps Script

In the spreadsheet: **Extensions → Apps Script**. Replace the default code with:

```javascript
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    // Use the first/active sheet (works for both "Sheet1" and "シート1")
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    sheet.appendRow([
      data.submittedAt || new Date().toISOString(),
      data.rating ?? "",
      data.comment || "",
      data.locale || "",
      data.appVersion || "",
    ]);
    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

**Important after editing the script:** Deploy → Manage deployments → ✎ Edit → Version: **New version** → Deploy.  
(Just saving the code is not enough; the web app keeps serving the old version.)

## 3. Deploy as web app

1. **Deploy → New deployment**
2. Type: **Web app**
3. Execute as: **Me**
4. Who has access: **Anyone**
5. Deploy and copy the **Web app URL**

## 4. Configure the app

Local (direct to GAS; Vite has no CSP):

```bash
# .env.local
VITE_SURVEY_ENDPOINT=https://script.google.com/macros/s/XXXX/exec
```

Vercel (read by the `/api/survey` serverless proxy):

1. Project Settings → Environment Variables
2. Add `VITE_SURVEY_ENDPOINT` (or server-only `SURVEY_ENDPOINT`) = the Web app URL
3. Environment: Production (and Preview if needed)
4. Save → Redeploy

Production submits to same-origin `/api/survey`, which forwards to GAS. This avoids the site CSP blocking `script.google.com`.

## Notes

- Without an endpoint env var, local submit completes without network (console warning); production `/api/survey` returns 500.
- No personal data is sent (no email, city names, or location).
- Auto-show rules: ContextualGuide done + 3+ days since first open + 3+ usage actions (add city / Convert / Jump). Auto prompt is once only; Settings → Feedback can be submitted anytime, repeatedly.
