import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect } from 'react';
import { useQR } from '../../contexts/QRContext';
import FormWrapper from '../../components/FormWrapper';

const schema = z.object({
  eventTitle: z.string().min(1, 'Event title is required'),
  location: z.string().optional(),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional(),
  description: z.string().optional(),
  title: z.string().optional(),
});

// datetime-local values represent the user's local time. Convert that exact
// selected local time to UTC before putting it into the ICS payload. This
// prevents calendar apps from interpreting the time as UTC/floating time and
// shifting it when the QR code is scanned.
const toICSDateTimeUTC = (value) => {
  if (!value) return '';

  const localDate = new Date(value);
  if (Number.isNaN(localDate.getTime())) return '';

  const pad = (number) => String(number).padStart(2, '0');

  return `${localDate.getUTCFullYear()}${pad(localDate.getUTCMonth() + 1)}${pad(localDate.getUTCDate())}T${pad(localDate.getUTCHours())}${pad(localDate.getUTCMinutes())}${pad(localDate.getUTCSeconds())}Z`;
};

// Escape characters required by RFC 5545 so calendar apps receive the same
// title/location/description that the user entered.
const escapeICS = (value = '') => String(value)
  .replace(/\\/g, '\\\\')
  .replace(/;/g, '\\;')
  .replace(/,/g, '\\,')
  .replace(/\r?\n/g, '\\n');

const EventForm = () => {
  const { updateQRData } = useQR();
  const { register, watch, formState: { errors } } = useForm({ resolver: zodResolver(schema) });
  const values = watch();

  useEffect(() => {
    const { eventTitle, location, startDate, endDate, description } = values;
    if (eventTitle && startDate) {
      const start = toICSDateTimeUTC(startDate);
      const end = toICSDateTimeUTC(endDate);

      if (!start) return;

      const now = new Date();
      const stamp = `${now.getUTCFullYear()}${String(now.getUTCMonth() + 1).padStart(2, '0')}${String(now.getUTCDate()).padStart(2, '0')}T${String(now.getUTCHours()).padStart(2, '0')}${String(now.getUTCMinutes()).padStart(2, '0')}${String(now.getUTCSeconds()).padStart(2, '0')}Z`;

      const ics = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//LumaLink//QR Event//EN',
        'BEGIN:VEVENT',
        `UID:lumalink-${Date.now()}@lumalink`,
        `DTSTAMP:${stamp}`,
        `SUMMARY:${escapeICS(eventTitle)}`,
        `DTSTART:${start}`,
        end ? `DTEND:${end}` : '',
        location ? `LOCATION:${escapeICS(location)}` : '',
        description ? `DESCRIPTION:${escapeICS(description)}` : '',
        'END:VEVENT',
        'END:VCALENDAR',
      ].filter(Boolean).join('\r\n');

      updateQRData(ics);
    }
  }, [JSON.stringify(values), updateQRData]);

  return (
    <FormWrapper title="Event QR Code" icon="📅" description="Add an event to the calendar when scanned." type="EVENT" formData={values}>
      <div>
        <label className="label">Event Title *</label>
        <input {...register('eventTitle')} className="input" placeholder="Product Launch Party" />
        {errors.eventTitle && <p className="field-error">{errors.eventTitle.message}</p>}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Start Date & Time *</label>
          <input type="datetime-local" {...register('startDate')} className="input" />
          {errors.startDate && <p className="field-error">{errors.startDate.message}</p>}
        </div>
        <div>
          <label className="label">End Date & Time</label>
          <input type="datetime-local" {...register('endDate')} className="input" />
        </div>
      </div>
      <div>
        <label className="label">Location</label>
        <input {...register('location')} className="input" placeholder="Conference Hall, NYC" />
      </div>
      <div>
        <label className="label">Description</label>
        <textarea {...register('description')} className="input min-h-[80px] resize-y" placeholder="Event details..." />
      </div>
    </FormWrapper>
  );
};

export default EventForm;
