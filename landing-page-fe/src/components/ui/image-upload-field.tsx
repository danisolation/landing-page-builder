'use client';

import { useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { UploadCloud, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { uploadMedia } from '@/lib/api';

export interface ImageUploadFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (url: string) => void;
  placeholder?: string;
}

/**
 * URL input + image upload button. Uploads go to the backend media
 * endpoint and the returned URL is written into the field — so no-code
 * users never need to host images themselves.
 */
export default function ImageUploadField({
  id,
  label,
  value,
  onChange,
  placeholder,
}: ImageUploadFieldProps) {
  const t = useTranslations('common');
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [previewBroken, setPreviewBroken] = useState(false);

  const handleFile = async (file: File) => {
    setUploading(true);
    try {
      const { url } = await uploadMedia(file);
      onChange(url);
      setPreviewBroken(false);
    } catch (error) {
      throw error;
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center">
        <Label className="text-sm font-medium" htmlFor={id}>
          {label}
        </Label>
      </div>
      <div className="flex gap-2">
        <Input
          id={id}
          value={value}
          onChange={(e) => {
            setPreviewBroken(false);
            onChange(e.target.value);
          }}
          placeholder={placeholder}
        />
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = '';
            if (file) void handleFile(file);
          }}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="shrink-0 h-10"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? (
            <Loader2 size={16} className="mr-1.5 animate-spin" />
          ) : (
            <UploadCloud size={16} className="mr-1.5" />
          )}
          <span className="hidden sm:inline">{t('upload')}</span>
        </Button>
      </div>
      {value && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={value}
          alt=""
          className="h-20 w-auto max-w-full rounded-md border border-border object-contain bg-muted/30"
          onError={() => setPreviewBroken(true)}
          hidden={previewBroken}
        />
      )}
      {uploading && (
        <p className="text-xs text-muted-foreground">{t('uploading')}</p>
      )}
    </div>
  );
}
