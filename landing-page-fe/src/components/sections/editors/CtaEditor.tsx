'use client';

import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import FieldHint from '@/components/ui/field-hint';
import type { CtaContent } from '@/types';

export interface CtaEditorProps {
  content: CtaContent;
  onChange: (content: CtaContent) => void;
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
        <div className="flex items-center">
          <Label htmlFor="cta-heading">{t('heading')}</Label>
          <FieldHint text={t('headingHint')} />
        </div>
        <Input
          id="cta-heading"
          value={content.heading || ''}
          onChange={(e) => handleChange('heading', e.target.value)}
          placeholder={t('headingPlaceholder')}
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center">
          <Label htmlFor="cta-description">{t('description')}</Label>
          <FieldHint text={t('descriptionHint')} />
        </div>
        <Input
          id="cta-description"
          value={content.description || ''}
          onChange={(e) => handleChange('description', e.target.value)}
          placeholder={t('descriptionPlaceholder')}
        />
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div className="space-y-2">
          <div className="flex items-center">
            <Label htmlFor="cta-buttonText">{t('buttonText')}</Label>
            <FieldHint text={t('buttonTextHint')} />
          </div>
          <Input
            id="cta-buttonText"
            value={content.buttonText || ''}
            onChange={(e) => handleChange('buttonText', e.target.value)}
            placeholder={t('buttonPlaceholder')}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center">
            <Label htmlFor="cta-buttonLink">{t('buttonLink')}</Label>
            <FieldHint text={t('buttonLinkHint')} />
          </div>
          <Input
            id="cta-buttonLink"
            value={content.buttonLink || ''}
            onChange={(e) => handleChange('buttonLink', e.target.value)}
            placeholder={t('buttonLinkPlaceholder')}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div className="space-y-2">
          <div className="flex items-center">
            <Label htmlFor="cta-secondaryButtonText">{t('secondaryButtonText')}</Label>
            <FieldHint text={t('secondaryButtonTextHint')} />
          </div>
          <Input
            id="cta-secondaryButtonText"
            value={content.secondaryButtonText || ''}
            onChange={(e) => handleChange('secondaryButtonText', e.target.value)}
            placeholder={t('secondaryButtonPlaceholder')}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center">
            <Label htmlFor="cta-secondaryButtonLink">{t('secondaryButtonLink')}</Label>
            <FieldHint text={t('secondaryButtonLinkHint')} />
          </div>
          <Input
            id="cta-secondaryButtonLink"
            value={content.secondaryButtonLink || ''}
            onChange={(e) => handleChange('secondaryButtonLink', e.target.value)}
            placeholder={t('secondaryButtonLinkPlaceholder')}
          />
        </div>
      </div>
    </div>
  );
}
