import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect } from 'react';
import { useQR } from '../../contexts/QRContext';
import FormWrapper from '../../components/FormWrapper';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  subject: z.string().optional(),
  body: z.string().optional(),
  title: z.string().optional(),
});

// mailto bodies must use URI percent-encoding. URLSearchParams is deliberately
// not used here because it serialises spaces as "+", which is form encoding
// and can appear literally in mail clients on Samsung/iOS.
const encodeMailtoValue = (value = '') => encodeURIComponent(value);

const EmailForm = () => {
  const { updateQRData } = useQR();
  const { register, watch, formState: { errors } } = useForm({ resolver: zodResolver(schema) });
  const values = watch();

  useEffect(() => {
    const email = values.email?.trim();
    const subject = values.subject ?? '';
    const body = values.body ?? '';

    if (!email) return;

    const params = [];

    if (subject) {
      params.push(`subject=${encodeMailtoValue(subject)}`);
    }

    if (body) {
      // Normalise textarea line endings to CRLF before URI encoding for
      // consistent paragraph/newline handling across mail clients.
      const normalizedBody = body.replace(/\r\n|\r|\n/g, '\r\n');
      params.push(`body=${encodeMailtoValue(normalizedBody)}`);
    }

    const query = params.length ? `?${params.join('&')}` : '';
    updateQRData(`mailto:${email}${query}`);
  }, [values.email, values.subject, values.body, updateQRData]);

  return (
    <FormWrapper title="Email QR Code" icon="✉️" description="Open an email compose window when scanned." type="EMAIL" formData={values}>
      <div>
        <label className="label">Title (optional)</label>
        <input {...register('title')} className="input" placeholder="Contact Us" />
      </div>
      <div>
        <label className="label">Email Address *</label>
        <input {...register('email')} className="input" placeholder="hello@example.com" />
        {errors.email && <p className="field-error">{errors.email.message}</p>}
      </div>
      <div>
        <label className="label">Subject</label>
        <input {...register('subject')} className="input" placeholder="Hello!" />
      </div>
      <div>
        <label className="label">Body</label>
        <textarea {...register('body')} className="input min-h-[80px] resize-y" placeholder="Message body..." />
      </div>
    </FormWrapper>
  );
};

export default EmailForm;
