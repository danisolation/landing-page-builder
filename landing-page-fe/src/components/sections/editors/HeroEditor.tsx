'use client';

import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import FieldHint from '@/components/ui/field-hint';
import type { HeroContent } from '@/types';

export interface HeroEditorProps {
  content: HeroContent;
  onChange: (content: HeroContent) => void;
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
        <div className="flex items-center">
          <Label>{t('heading')}</Label>
          <FieldHint text={t('headingHint')} />
        </div>
        <Input
          value={content.heading || ''}
          onChange={(e) => handleChange('heading', e.target.value)}
          placeholder={t('headingPlaceholder')}
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center">
          <Label>{t('subheading')}</Label>
          <FieldHint text={t('subheadingHint')} />
        </div>
        <Textarea
          value={content.subheading || ''}
          onChange={(e) => handleChange('subheading', e.target.value)}
          placeholder={t('subheadingPlaceholder')}
          rows={2}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex items-center">
            <Label>{t('buttonText')}</Label>
            <FieldHint text={t('buttonTextHint')} />
          </div>
          <Input
            value={content.buttonText || ''}
            onChange={(e) => handleChange('buttonText', e.target.value)}
            placeholder={t('buttonPlaceholder')}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center">
            <Label>{t('buttonLink')}</Label>
            <FieldHint text={t('buttonLinkHint')} />
          </div>
          <Input
            value={content.buttonLink || ''}
            onChange={(e) => handleChange('buttonLink', e.target.value)}
            placeholder={t('buttonLinkPlaceholder')}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex items-center">
            <Label>{t('secondaryButtonText')}</Label>
            <FieldHint text={t('secondaryButtonTextHint')} />
          </div>
          <Input
            value={content.secondaryButtonText || ''}
            onChange={(e) => handleChange('secondaryButtonText', e.target.value)}
            placeholder={t('secondaryButtonPlaceholder')}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center">
            <Label>{t('secondaryButtonLink')}</Label>
            <FieldHint text={t('secondaryButtonLinkHint')} />
          </div>
          <Input
            value={content.secondaryButtonLink || ''}
            onChange={(e) => handleChange('secondaryButtonLink', e.target.value)}
            placeholder={t('secondaryButtonLinkPlaceholder')}
          />
        </div>
      </div>
    </div>
  );
}
