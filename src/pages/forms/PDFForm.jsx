import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQR } from "../../contexts/QRContext";
import FormWrapper from "../../components/FormWrapper";
import { Upload, FileText, CheckCircle2 } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";

const schema = z.object({
  title: z.string().optional(),
  pdfUrl: z.string().url("Enter a valid PDF URL").or(z.literal("")),
});

const PDFForm = () => {
  const { updateQRData, updateCardData, setActiveType } = useQR();
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) });
  const values = watch();

  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);

  useEffect(() => {
    setActiveType("PDF");
  }, [setActiveType]);

  useEffect(() => {
    const targetUrl = values.pdfUrl || "https://example.com/document.pdf";
    updateQRData(targetUrl);
    updateCardData({
      subtitle: values.title || "View PDF Document",
      badgeText: "PDF DOCUMENT",
    });
  }, [values.pdfUrl, values.title]);

  const handlePdfUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast.error("Please select a PDF document");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setIsUploading(true);
    const toastId = toast.loading("Uploading PDF to Cloudinary...");

    try {
      const res = await axios.post("/api/media/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data?.url) {
        setValue("pdfUrl", res.data.url);
        updateQRData(res.data.url);
        setUploadedFile({
          name: file.name,
          size: (file.size / 1024 / 1024).toFixed(2) + " MB",
          url: res.data.url,
          publicId: res.data.public_id,
          format: res.data.format,
        });
        toast.success("PDF uploaded to Cloudinary! QR Code generated.", {
          id: toastId,
        });
      }
    } catch (err) {
      console.error("PDF upload error:", err);
      toast.error("Upload failed. You can manually enter a PDF URL below.", {
        id: toastId,
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <FormWrapper
      title="PDF QR Code"
      icon="📄"
      description="Upload a PDF document or link to an existing PDF."
      type="PDF"
      formData={values}
    >
      <div className="space-y-4">
        {/* Title Input */}
        <div>
          <label className="label">Document Title</label>
          <input
            {...register("title")}
            className="input"
            placeholder="e.g. Product Catalog 2026"
          />
        </div>

        {/* Upload Box */}
        <div>
          <label className="label">Upload PDF Document</label>
          <div className="relative border-2 border-dashed border-surface-700 hover:border-brand-500 rounded-2xl p-6 text-center transition-all bg-surface-900/50 hover:bg-surface-850">
            <input
              type="file"
              accept="application/pdf"
              onChange={handlePdfUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="flex flex-col items-center justify-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-brand-500/10 text-brand-400 flex items-center justify-center">
                <Upload size={24} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-200">
                  {isUploading
                    ? "Uploading PDF..."
                    : "Click or Drag PDF file here"}
                </p>
                <p className="text-[11px] text-slate-400">
                  Supports PDF up to 50MB
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Uploaded File Info */}
        {uploadedFile && (
          <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-xs">
            <div className="flex items-center gap-2 font-medium text-emerald-300 truncate">
              <FileText size={16} />
              <span className="truncate">{uploadedFile.name}</span>
              <span className="text-[10px] text-emerald-500 font-mono">
                ({uploadedFile.size})
              </span>
            </div>
            <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
          </div>
        )}

        {/* Manual URL Input */}
        <div>
          <label className="label">Direct PDF URL *</label>
          <input
            {...register("pdfUrl")}
            className="input font-mono text-xs"
            placeholder="https://example.com/file.pdf"
          />
          {errors.pdfUrl && (
            <p className="field-error">{errors.pdfUrl.message}</p>
          )}
        </div>
      </div>
    </FormWrapper>
  );
};

export default PDFForm;
