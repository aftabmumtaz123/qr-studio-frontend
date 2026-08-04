import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect } from 'react';
import { useQR } from '../../contexts/QRContext';
import FormWrapper from '../../components/FormWrapper';

const schema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().optional(),
  phone: z.string().min(7, 'Phone is required'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  website: z.string().url('Invalid URL').optional().or(z.literal('')),
  company: z.string().optional(),
  title: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
});

const VCardForm = () => {
  const { updateQRData, updateCardData, setActiveType } = useQR();
  const { register, watch, formState: { errors } } = useForm({ resolver: zodResolver(schema) });
  const values = watch();

  useEffect(() => {
    setActiveType('VCARD');
  }, [setActiveType]);

  useEffect(() => {
    const { firstName, lastName, phone, email, website, company, title, address, notes } = values;

    const fullName = `${firstName || ''} ${lastName || ''}`.trim() || 'John Doe';
    updateCardData({
      name: fullName,
      phone: phone || '+1234567890',
      email: email || 'john@example.com',
      website: website || 'https://example.com',
      company: company || 'Acme Inc.',
      title: title || 'CEO & Founder',
      address: address || '123 Tech Blvd',
    });

    if (!firstName && !phone) return;

    const vcard = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `FN:${fullName}`,
      `N:${lastName || ''};${firstName || ''};;;`,
      phone ? `TEL:${phone}` : '',
      email ? `EMAIL:${email}` : '',
      website ? `URL:${website}` : '',
      company ? `ORG:${company}` : '',
      title ? `TITLE:${title}` : '',
      address ? `ADR:;;${address};;;;` : '',
      notes ? `NOTE:${notes}` : '',
      'END:VCARD',
    ].filter(Boolean).join('\n');

    updateQRData(vcard);
  }, [JSON.stringify(values)]);

  return (
    <FormWrapper title="vCard QR Code" icon="👤" description="Share contact info that can be saved to a phone." type="VCARD" formData={values}>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">First Name *</label>
          <input {...register('firstName')} className="input" placeholder="John" />
          {errors.firstName && <p className="field-error">{errors.firstName.message}</p>}
        </div>
        <div>
          <label className="label">Last Name</label>
          <input {...register('lastName')} className="input" placeholder="Doe" />
        </div>
      </div>
      <div>
        <label className="label">Phone *</label>
        <input {...register('phone')} className="input" placeholder="+1234567890" />
        {errors.phone && <p className="field-error">{errors.phone.message}</p>}
      </div>
      <div>
        <label className="label">Email</label>
        <input {...register('email')} className="input" placeholder="john@example.com" />
        {errors.email && <p className="field-error">{errors.email.message}</p>}
      </div>
      <div>
        <label className="label">Website</label>
        <input {...register('website')} className="input" placeholder="https://example.com" />
        {errors.website && <p className="field-error">{errors.website.message}</p>}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Company</label>
          <input {...register('company')} className="input" placeholder="Acme Inc." />
        </div>
        <div>
          <label className="label">Job Title</label>
          <input {...register('title')} className="input" placeholder="CEO" />
        </div>
      </div>
      <div>
        <label className="label">Address</label>
        <input {...register('address')} className="input" placeholder="123 Main St, City" />
      </div>
      <div>
        <label className="label">Notes</label>
        <textarea {...register('notes')} className="input min-h-[60px] resize-y" placeholder="Any notes..." />
      </div>
    </FormWrapper>
  );
};

export default VCardForm;
