const pad = (value) => String(value).padStart(2, '0');

const escapeICSText = (value = '') => String(value)
  .replace(/\\/g, '\\\\')
  .replace(/;/g, '\\;')
  .replace(/,/g, '\\,')
  .replace(/\r?\n/g, '\\n');

// Samsung's built-in QR handling is less tolerant of large/full iCalendar
// envelopes and folded lines than some other scanners.  For a QR payload we
// therefore use a compact, single VEVENT with local/floating time. This keeps
// the event at the same wall-clock time at the venue and avoids timezone
// conversion quirks seen in some Samsung Calendar versions.
const toLocalStamp = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}T${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;
};

export const buildEventQRPayload = (
  { eventTitle, startDate, endDate, location, description },
) => {
  const start = toLocalStamp(startDate);
  const end = endDate ? toLocalStamp(endDate) : '';

  // Keep the payload intentionally compact for Samsung Camera/QR handling.
  // Avoid UID/DTSTAMP/folding here: they are useful in .ics files but add
  // density and can cause manufacturer scanners to treat the QR as plain text.
  const lines = [
    'BEGIN:VEVENT',
    `SUMMARY:${escapeICSText(eventTitle || 'LumaLink Event')}`,
    start ? `DTSTART:${start}` : '',
    end ? `DTEND:${end}` : '',
    location ? `LOCATION:${escapeICSText(location)}` : '',
    description ? `DESCRIPTION:${escapeICSText(description)}` : '',
    'END:VEVENT',
  ].filter(Boolean);

  // Do not fold lines. The EventForm limits the fields so the QR stays compact
  // and Samsung's scanner does not have to unfold RFC 5545 continuation lines.
  return lines.join('\r\n');
};

export const getEventPayloadStats = (payload) => {
  const bytes = new TextEncoder().encode(payload || '').length;
  return {
    characters: (payload || '').length,
    bytes,
    lines: (payload || '').split(/\r\n|\n/).filter(Boolean).length,
  };
};
