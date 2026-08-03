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

const toICS = (t) => (t || '').replace(/[-:T]/g, '').slice(0, 15);

const EventForm = () => {
  const { updateQRData } = useQR();
  const { register, watch, formState: { errors } } = useForm({ resolver: zodResolver(schema) });
  const values = watch();

  useEffect(() => {
    const { eventTitle, location, startDate, endDate, description } = values;
    if (eventTitle && startDate) {
      const ics = [
        'BEGIN:VEVENT',
        `SUMMARY:${eventTitle}`,
        `DTSTART:${toICS(startDate)}`,
        endDate ? `DTEND:${toICS(endDate)}` : '',
        location ? `LOCATION:${location}` : '',
        description ? `DESCRIPTION:${description}` : '',
        'END:VEVENT',
      ].filter(Boolean).join('\n');
      updateQRData(ics);
    }
  }, [JSON.stringify(values)]);

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
