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

const EmailForm = () => {
  const { updateQRData } = useQR();
  const { register, watch, formState: { errors } } = useForm({ resolver: zodResolver(schema) });
  const values = watch();

  useEffect(() => {
    const { email, subject, body } = values;
    if (!email) return;

    // Build the mailto URI manually. URLSearchParams encodes spaces as
    // "+" which some Samsung/iOS mail clients display literally.
    const encodeMailtoValue = (value = '') =>
      encodeURIComponent(String(value))
        .replace(/%0A/g, '%0D%0A');

    const params = [];

    if (subject?.trim()) {
      params.push(`subject=${encodeMailtoValue(subject)}`);
    }

    if (body?.trim()) {
      params.push(`body=${encodeMailtoValue(body)}`);
    }

    const query = params.length ? `?${params.join('&')}` : '';
    updateQRData(`mailto:${email.trim()}${query}`);
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
