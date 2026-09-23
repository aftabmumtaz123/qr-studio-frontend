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
    if (email) {
      const params = new URLSearchParams();
      if (subject) params.set('subject', subject);
      if (body) params.set('body', body);
      updateQRData(`mailto:${email}?${params.toString()}`);
    }
  }, [values.email, values.subject, values.body]);

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
