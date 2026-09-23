import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect } from 'react';
import { useQR } from '../../contexts/QRContext';
import FormWrapper from '../../components/FormWrapper';

const schema = z.object({
  phone: z.string().min(7, 'Enter a valid phone number'),
  message: z.string().optional(),
  title: z.string().optional(),
});

// Normalise common phone-number formatting without changing the user's
// international + prefix. This keeps the QR payload scanner-friendly.
const normalizePhoneNumber = (value = '') => {
  const trimmed = value.trim();
  if (!trimmed) return '';

  const hasPlus = trimmed.startsWith('+');
  const digits = trimmed.replace(/\D/g, '');

  return hasPlus ? `+${digits}` : digits;
};

const SMSForm = () => {
  const { updateQRData } = useQR();
  const { register, watch, formState: { errors } } = useForm({ resolver: zodResolver(schema) });
  const values = watch();

  useEffect(() => {
    const phone = normalizePhoneNumber(values.phone);

    if (!phone) return;

    // SMSTO is the QR/scanner convention supported by current iOS and
    // Android/Samsung scanners. Keep the message as literal text here;
    // percent-encoding the body would make scanners display %20, etc.
    const message = values.message ?? '';
    const payload = message
      ? `SMSTO:${phone}:${message}`
      : `SMSTO:${phone}`;

    updateQRData(payload);
  }, [values.phone, values.message, updateQRData]);

  return (
    <FormWrapper title="SMS QR Code" icon="💬" description="Compose a pre-filled SMS when scanned." type="SMS" formData={values}>
      <div>
        <label className="label">Title (optional)</label>
        <input {...register('title')} className="input" placeholder="Send us a message" />
      </div>
      <div>
        <label className="label">Phone Number *</label>
        <input {...register('phone')} className="input" placeholder="+1234567890" />
        {errors.phone && <p className="field-error">{errors.phone.message}</p>}
      </div>
      <div>
        <label className="label">Message (optional)</label>
        <textarea {...register('message')} className="input min-h-[80px] resize-y" placeholder="Pre-filled message..." />
      </div>
    </FormWrapper>
  );
};

export default SMSForm;
