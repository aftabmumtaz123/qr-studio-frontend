const pad = (value) => String(value).padStart(2, '0');

const escapeICSText = (value = '') => String(value)
  .replace(/\\/g, '\\\\')
  .replace(/;/g, '\\;')
  .replace(/,/g, '\\,')
  .replace(/\r?\n/g, '\\n');

const toUTCStamp = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}T${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}${pad(date.getUTCSeconds())}Z`;
};

// iCalendar lines are folded at 75 octets. This keeps UTF-8 event text valid
// for stricter calendar parsers while remaining compact enough for QR codes.
const foldICSLine = (line) => {
  const chunks = [];
  let current = '';
  let bytes = 0;

  for (const character of String(line)) {
    const charBytes = new TextEncoder().encode(character).length;
    const limit = chunks.length === 0 ? 75 : 74;
    if (bytes + charBytes > limit && current) {
      chunks.push(current);
      current = ' ';
      bytes = 1;
    }
    current += character;
    bytes += charBytes;
  }

  if (current) chunks.push(current);
  return chunks.join('\r\n');
};

export const buildEventQRPayload = ({ eventTitle, startDate, endDate, location, description }, uid = crypto.randomUUID()) => {
  const start = toUTCStamp(startDate);
  const end = endDate ? toUTCStamp(endDate) : '';
  const stamp = toUTCStamp(new Date());

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//LumaLink//Event QR//EN',
    'BEGIN:VEVENT',
    `UID:lumalink-${uid}@lumalink`,
    `DTSTAMP:${stamp}`,
    start ? `DTSTART:${start}` : '',
    end ? `DTEND:${end}` : '',
    `SUMMARY:${escapeICSText(eventTitle || 'LumaLink Event')}`,
    location ? `LOCATION:${escapeICSText(location)}` : '',
    description ? `DESCRIPTION:${escapeICSText(description)}` : '',
    'END:VEVENT',
    'END:VCALENDAR',
  ].filter(Boolean);

  return lines.map(foldICSLine).join('\r\n') + '\r\n';
};

export const getEventPayloadStats = (payload) => {
  const bytes = new TextEncoder().encode(payload || '').length;
  return {
    characters: (payload || '').length,
    bytes,
    lines: (payload || '').split(/\r\n|\n/).filter(Boolean).length,
  };
};
