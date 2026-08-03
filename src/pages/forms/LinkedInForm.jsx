import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect } from 'react';
import { useQR } from '../../contexts/QRContext';
import FormWrapper from '../../components/FormWrapper';

const schema = z.object({ profileUrl: z.string().url('Enter a valid LinkedIn profile URL'), title: z.string().optional() });

const LinkedInForm = () => {
  const { updateQRData } = useQR();
  const { register, watch, formState: { errors } } = useForm({ resolver: zodResolver(schema) });
  const values = watch();
  useEffect(() => { if (values.profileUrl) updateQRData(values.profileUrl); }, [values.profileUrl]);
  return (
    <FormWrapper title="LinkedIn QR Code" icon="💼" description="Link to your LinkedIn profile." type="LINKEDIN" formData={values}>
      <div>
        <label className="label">LinkedIn Profile URL *</label>
        <input {...register('profileUrl')} className="input" placeholder="https://linkedin.com/in/yourname" />
        {errors.profileUrl && <p className="field-error">{errors.profileUrl.message}</p>}
      </div>
    </FormWrapper>
  );
};

export default LinkedInForm;
