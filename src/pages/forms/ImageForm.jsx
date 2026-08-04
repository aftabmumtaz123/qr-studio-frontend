import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQR } from '../../contexts/QRContext';
import FormWrapper from '../../components/FormWrapper';
import { Upload, Image as ImageIcon, CheckCircle2 } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const schema = z.object({
  title: z.string().optional(),
  imageUrl: z.string().url('Enter a valid Image URL').or(z.literal('')),
});

const ImageForm = () => {
  const { updateQRData, updateCardData, setActiveType } = useQR();
  const { register, watch, setValue, formState: { errors } } = useForm({ resolver: zodResolver(schema) });
  const values = watch();

  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);

  useEffect(() => {
    setActiveType('IMAGE');
  }, [setActiveType]);

  useEffect(() => {
    const targetUrl = values.imageUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe';
    updateQRData(targetUrl);
    updateCardData({
      subtitle: values.title || 'View Image Gallery',
      badgeText: 'IMAGE QR CODE',
    });
  }, [values.imageUrl, values.title]);

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setIsUploading(true);
    const toastId = toast.loading('Uploading Image to Cloudinary...');

    try {
      const res = await axios.post(
        "https://qr-studio-backend.vercel.app/api/media/upload",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );

      if (res.data?.url) {
        setValue('imageUrl', res.data.url);
        updateQRData(res.data.url);
        setUploadedFile({
          name: file.name,
          size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
          url: res.data.url,
        });
        toast.success('Image uploaded to Cloudinary! QR Code generated.', { id: toastId });
      }
    }  catch (err) {
  console.error(err);
  console.log(err.response?.data);

  toast.error(
    err.response?.data?.message || "Upload failed",
    { id: toastId }
  );
} finally {
      setIsUploading(false);
    }
  };

  return (
    <FormWrapper title="Image QR Code" icon="🖼️" description="Upload an image or link directly to an image asset." type="IMAGE" formData={values}>
      <div className="space-y-4">
        {/* Title Input */}
        <div>
          <label className="label">Image Title</label>
          <input {...register('title')} className="input" placeholder="e.g. Event Gallery Photo" />
        </div>

        {/* Upload Box */}
        <div>
          <label className="label">Upload Image</label>
          <div className="relative border-2 border-dashed border-surface-700 hover:border-brand-500 rounded-2xl p-6 text-center transition-all bg-surface-900/50 hover:bg-surface-850">
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleImageUpload} 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
            />
            <div className="flex flex-col items-center justify-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-brand-500/10 text-brand-400 flex items-center justify-center">
                <Upload size={24} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-200">
                  {isUploading ? 'Uploading Image...' : 'Click or Drag Image here'}
                </p>
                <p className="text-[11px] text-slate-400">PNG, JPG, WEBP up to 20MB</p>
              </div>
            </div>
          </div>
        </div>

        {/* Uploaded File Info */}
        {uploadedFile && (
          <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-xs">
            <div className="flex items-center gap-2 font-medium text-emerald-300 truncate">
              {uploadedFile.url ? (
                <img src={uploadedFile.url} alt="Preview" className="w-8 h-8 rounded object-cover border border-emerald-700" />
              ) : (
                <ImageIcon size={16} />
              )}
              <span className="truncate">{uploadedFile.name}</span>
              <span className="text-[10px] text-emerald-500 font-mono">({uploadedFile.size})</span>
            </div>
            <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
          </div>
        )}

        {/* Manual URL Input */}
        <div>
          <label className="label">Direct Image URL *</label>
          <input {...register('imageUrl')} className="input font-mono text-xs" placeholder="https://example.com/image.jpg" />
          {errors.imageUrl && <p className="field-error">{errors.imageUrl.message}</p>}
        </div>
      </div>
    </FormWrapper>
  );
};

export default ImageForm;
