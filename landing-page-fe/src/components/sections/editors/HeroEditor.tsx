'use client';

import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface HeroEditorProps {
  content: any;
  onChange: (content: any) => void;
}

export default function HeroEditor({ content, onChange }: HeroEditorProps) {
  const t = useTranslations('heroEditor');

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
          placeholder="Chào mừng đến với ABC"
        />
      </div>

      <div className="space-y-2">
        <Label>{t('subheading')}</Label>
        <Textarea
          value={content.subheading || ''}
          onChange={(e) => handleChange('subheading', e.target.value)}
          placeholder="Giải pháp tốt nhất cho bạn"
          rows={2}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>{t('buttonText')}</Label>
          <Input
            value={content.buttonText || ''}
            onChange={(e) => handleChange('buttonText', e.target.value)}
            placeholder="Đăng ký ngay"
          />
        </div>

        <div className="space-y-2">
          <Label>{t('buttonLink')}</Label>
          <Input
            value={content.buttonLink || ''}
            onChange={(e) => handleChange('buttonLink', e.target.value)}
            placeholder="/dang-ky"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>{t('secondaryButtonText')}</Label>
          <Input
            value={content.secondaryButtonText || ''}
            onChange={(e) => handleChange('secondaryButtonText', e.target.value)}
            placeholder="Xem demo"
          />
        </div>

        <div className="space-y-2">
          <Label>{t('secondaryButtonLink')}</Label>
          <Input
            value={content.secondaryButtonLink || ''}
            onChange={(e) => handleChange('secondaryButtonLink', e.target.value)}
            placeholder="/demo"
          />
        </div>
      </div>
    </div>
  );
}
