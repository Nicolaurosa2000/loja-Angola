import { useState, useRef } from 'react';
import api from '../services/api';

interface FileUploaderProps {
  onUploaded: (url: string) => void;
  accept?: string;
  label?: string;
}

export default function FileUploader({ onUploaded, accept = 'image/*', label = 'Upload' }: FileUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPreview(URL.createObjectURL(file));
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await api.post('/api/uploads', formData);
      const url = res.data.data.url;
      onUploaded(url);
    } catch (err) {
      console.error('Upload failed', err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <input ref={inputRef} type="file" accept={accept} onChange={handleFile} className="hidden" />
      {preview && <img src={preview} alt="Preview" className="h-24 w-24 object-cover rounded" />}
      <button type="button" onClick={() => inputRef.current?.click()} disabled={uploading} className="btn-outline text-sm">
        {uploading ? 'A enviar...' : label}
      </button>
    </div>
  );
}
