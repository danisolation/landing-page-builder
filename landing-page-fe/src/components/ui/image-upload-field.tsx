'use client';

import { useState } from 'react';
import { ImageIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export interface ImageUploadFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (url: string) => void;
  placeholder?: string;
}

/**
 * Image URL field with live preview.
 *
 * Note: local file upload was removed because the hosting tier has an
 * ephemeral filesystem — uploaded files are lost on every restart/redeploy.
 * Users paste an image URL from any free host (Cloudinary, Imgur, etc.).
 */
export default function ImageUploadField({
  id,
  label,
  value,
  onChange,
  placeholder,
}: ImageUploadFieldProps) {
  const [previewBroken, setPreviewBroken] = useState(false);

  return (
    <div className="space-y-2">
      <div className="flex items-center">
        <Label className="text-sm font-medium" htmlFor={id}>
          {label}
        </Label>
      </div>
      <Input
        id={id}
        value={value}
        onChange={(e) => {
          setPreviewBroken(false);
          onChange(e.target.value);
        }}
        placeholder={placeholder}
      />
      {value && (
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt=""
            className="h-20 w-auto max-w-full rounded-md border border-border object-contain bg-muted/30"
            onError={() => setPreviewBroken(true)}
            hidden={previewBroken}
          />
          {previewBroken && (
            <span className="text-xs text-destructive flex items-center gap-1">
              <ImageIcon size={14} />
              Failed to load image — check the URL
            </span>
          )}
        </div>
      )}
    </div>
  );
}
