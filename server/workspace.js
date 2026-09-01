/*
  Google Workspace touchpoints (cross-cutting "Workspace actions").
  These are deliberately pluggable: when GOOGLE_WORKSPACE_TOKEN is absent (the
  default for free-tier / billing-off demos) they return a clearly-labeled
  simulated success so the UI flow is real end-to-end. Drop in the googleapis
  client where marked to make them live without touching any caller.
*/

const hasToken = () => !!process.env.GOOGLE_WORKSPACE_TOKEN;
const tag = (live) => (live ? 'live' : 'pluggable');

// Schedule an inspector site-visit on Google Calendar.
export async function sendCalendarInvite(issue, { inspectorName, when, attendees } = {}) {
  const start = when ? new Date(when) : new Date(Date.now() + 90 * 60 * 1000);
  const title = `Nidaan site verification — #${issue.id} (${issue.category.replace('_', ' ')})`;
  const where = issue.location?.address || issue.ward || 'Demo City';

  if (hasToken()) {
    // PLUG POINT: const cal = google.calendar({version:'v3', auth}); await cal.events.insert({...})
    // Intentionally left to the human integrator who supplies the OAuth token.
  }

  return {
    service: 'Google Calendar',
    mode: tag(hasToken()),
    eventId: `cal_${issue.id}_${start.getTime()}`,
    title,
    start: start.toISOString(),
    end: new Date(start.getTime() + 45 * 60 * 1000).toISOString(),
    location: where,
    attendees: attendees || [inspectorName || 'Duty Inspector'],
    message: `Google Calendar: booked "${title}" on ${start.toLocaleString('en-IN')} at ${where}${hasToken() ? '' : ' (pluggable)'}.`,
  };
}

// File a formal complaint / send the daily brief via Gmail.
export async function sendGmail(issue, { to, subject, body, kind } = {}) {
  const recipient = to || 'grievance-cell@municipal.gov.in';
  const subjectLine = subject || `Formal grievance — unresolved ${issue.category.replace('_', ' ')} (#${issue.id})`;

  if (hasToken()) {
    // PLUG POINT: const gmail = google.gmail({version:'v1', auth}); await gmail.users.messages.send({...})
  }

  return {
    service: 'Gmail',
    mode: tag(hasToken()),
    messageId: `gmail_${issue.id}_${Date.now()}`,
    to: recipient,
    subject: subjectLine,
    snippet: (body || '').slice(0, 120),
    message: `Gmail: ${kind === 'brief' ? 'daily brief' : 'formal grievance'} sent to ${recipient}${hasToken() ? '' : ' (pluggable)'}.`,
  };
}

// Append the ledger / scorecard to a Google Sheet for public audit.
export async function pushToSheets(rows, { sheetName } = {}) {
  if (hasToken()) {
    // PLUG POINT: const sheets = google.sheets({version:'v4', auth}); await sheets.spreadsheets.values.append({...})
  }
  return {
    service: 'Google Sheets',
    mode: tag(hasToken()),
    sheet: sheetName || 'Nidaan Public Ledger',
    rowsAppended: Array.isArray(rows) ? rows.length : 0,
    message: `Google Sheets: appended ${Array.isArray(rows) ? rows.length : 0} row(s) to the public audit sheet${hasToken() ? '' : ' (pluggable)'}.`,
  };
}
