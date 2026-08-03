import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect } from 'react';
import { useQR } from '../../contexts/QRContext';
import FormWrapper from '../../components/FormWrapper';

const schema = z.object({ spotifyUrl: z.string().url('Enter a valid Spotify URL'), title: z.string().optional() });

const SpotifyForm = () => {
  const { updateQRData } = useQR();
  const { register, watch, formState: { errors } } = useForm({ resolver: zodResolver(schema) });
  const values = watch();
  useEffect(() => { if (values.spotifyUrl) updateQRData(values.spotifyUrl); }, [values.spotifyUrl]);
  return (
    <FormWrapper title="Spotify QR Code" icon="🎵" description="Link to your Spotify profile, playlist or song." type="SPOTIFY" formData={values}>
      <div>
        <label className="label">Spotify URL *</label>
        <input {...register('spotifyUrl')} className="input" placeholder="https://open.spotify.com/..." />
        {errors.spotifyUrl && <p className="field-error">{errors.spotifyUrl.message}</p>}
      </div>
    </FormWrapper>
  );
};

export default SpotifyForm;
