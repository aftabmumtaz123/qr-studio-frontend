import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect, useMemo, useState } from 'react';
import { CalendarPlus, CheckCircle2, Copy, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { useQR } from '../../contexts/QRContext';
import { qrAPI } from '../../services/api';
import FormWrapper from '../../components/FormWrapper';
import { buildEventQRPayload, getEventPayloadStats } from '../../utils/eventQR';

const schema = z.object({
  eventTitle: z.string().min(1, 'Event title is required').max(120, 'Event title is too long'),
  location: z.string().max(160, 'Location is too long').optional(),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional(),
  description: z.string().max(240, 'Keep the description under 240 characters for better QR compatibility').optional(),
  title: z.string().optional(),
});

const EventForm = () => {
  const { updateQRData, setActiveType, qrStyle, updateStyle, logo } = useQR();
  const [saving, setSaving] = useState(false);
  const [savedPayload, setSavedPayload] = useState('');
  const [eventUid] = useState(() => crypto.randomUUID());

  const { register, watch, handleSubmit, formState: { errors, isValid } } = useForm({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: {
      eventTitle: '',
      location: '',
      startDate: '',
      endDate: '',
      description: '',
    },
  });
  const values = watch();

  useEffect(() => {
    setActiveType('EVENT');
    // Event QRs are dense by nature. Keep a stronger default and a smaller
    // logo so Samsung/Android camera scanners have more recovery headroom.
    if (logo && qrStyle.errorCorrectionLevel !== 'H') {
      updateStyle({ errorCorrectionLevel: 'H' });
    }
  }, [setActiveType, logo, qrStyle.errorCorrectionLevel, updateStyle]);

  const eventPayload = useMemo(() => {
    if (!values.eventTitle || !values.startDate) return '';
    return buildEventQRPayload(values, eventUid);
  }, [values, eventUid]);

  const payloadStats = useMemo(() => getEventPayloadStats(eventPayload), [eventPayload]);

  useEffect(() => {
    if (!savedPayload) updateQRData(eventPayload || 'BEGIN:VEVENT\r\nSUMMARY:LumaLink Event\r\nEND:VEVENT');
  }, [eventPayload, savedPayload, updateQRData]);

  const handleCreate = handleSubmit(async (formValues) => {
    setSaving(true);
    try {
      const payload = buildEventQRPayload(formValues, eventUid);
      await qrAPI.create({
        title: formValues.eventTitle || 'Event QR Code',
        type: 'EVENT',
        dynamic: false,
        destination: payload,
        payload: formValues,
        style: qrStyle,
        logo,
      });

      setSavedPayload(payload);
      updateQRData(payload);
      toast.success('Static Event QR saved successfully.');
    } catch (err) {
      toast.error(err.message || 'Could not save Event QR');
    } finally {
      setSaving(false);
    }
  });

  const handleCopy = async () => {
    if (!savedPayload) return;
    await navigator.clipboard.writeText(savedPayload);
    toast.success('Calendar payload copied');
  };

  return (
    <FormWrapper
      title="Event QR Code"
      icon="📅"
      description="Encodes the calendar event directly in the QR — no website, redirect, or hosted page."
      type="EVENT"
      formData={values}
      dynamic={false}
    >
     

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
        <input {...register('location')} className="input" placeholder="Conference Hall, Lahore" />
        {errors.location && <p className="field-error">{errors.location.message}</p>}
      </div>

      <div>
        <label className="label">Description</label>
        <textarea {...register('description')} className="input min-h-[80px] resize-y" placeholder="Keep this short for a denser, more scanner-friendly QR..." />
        {errors.description && <p className="field-error">{errors.description.message}</p>}
      </div>

      <div className="pt-2 border-t border-surface-800 space-y-2">
        <button
          type="button"
          onClick={handleCreate}
          disabled={!isValid || saving}
          className="btn-primary w-full py-2.5 text-xs font-bold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {savedPayload ? <CheckCircle2 size={14} /> : <Save size={14} />}
          {saving ? 'Saving Event QR...' : savedPayload ? 'Event QR Saved ✓' : 'Save Static Event QR'}
        </button>

        {savedPayload && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <input readOnly value="Direct iCalendar / VEVENT payload" className="input bg-surface-900 text-[11px] text-brand-300" />
              <button type="button" onClick={handleCopy} className="btn-secondary px-3 py-2 text-xs flex items-center gap-1.5">
                <Copy size={13} /> Copy
              </button>
            </div>
            <p className="text-[10px] text-emerald-400 flex items-center gap-1">
              <CheckCircle2 size={11} /> Nothing is hosted or redirected; the event data is inside this QR code.
            </p>
          </div>
        )}
      </div>
    </FormWrapper>
  );
};

export default EventForm;
