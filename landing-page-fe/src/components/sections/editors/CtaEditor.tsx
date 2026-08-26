'use client';

import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface CtaEditorProps {
  content: any;
  onChange: (content: any) => void;
}

export default function CtaEditor({ content, onChange }: CtaEditorProps) {
  const t = useTranslations('ctaEditor');

  const handleChange = (field: string, value: string) => {
    onChange({
      ...content,
      [field]: value,
    });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>{t('heading')}</Label>
        <Input
          value={content.heading || ''}
          onChange={(e) => handleChange('heading', e.target.value)}
          placeholder="Sẵn sàng bắt đầu?"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>{t('buttonText')}</Label>
          <Input
            value={content.buttonText || ''}
            onChange={(e) => handleChange('buttonText', e.target.value)}
            placeholder="Liên hệ ngay"
          />
        </div>

        <div className="space-y-2">
          <Label>{t('buttonLink')}</Label>
          <Input
            value={content.buttonLink || ''}
            onChange={(e) => handleChange('buttonLink', e.target.value)}
            placeholder="/lien-he"
          />
        </div>
      </div>
    </div>
  );
}
