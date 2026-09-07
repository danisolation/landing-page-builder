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
          <Label htmlFor="hero-heading">{t('heading')}</Label>
          <FieldHint text={t('headingHint')} />
        </div>
        <Input
          id="hero-heading"
          value={content.heading || ''}
          onChange={(e) => handleChange('heading', e.target.value)}
          placeholder={t('headingPlaceholder')}
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center">
          <Label htmlFor="hero-subheading">{t('subheading')}</Label>
          <FieldHint text={t('subheadingHint')} />
        </div>
        <Textarea
          id="hero-subheading"
          value={content.subheading || ''}
          onChange={(e) => handleChange('subheading', e.target.value)}
          placeholder={t('subheadingPlaceholder')}
          rows={2}
        />
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div className="space-y-2">
          <div className="flex items-center">
            <Label htmlFor="hero-buttonText">{t('buttonText')}</Label>
            <FieldHint text={t('buttonTextHint')} />
          </div>
          <Input
            id="hero-buttonText"
            value={content.buttonText || ''}
            onChange={(e) => handleChange('buttonText', e.target.value)}
            placeholder={t('buttonPlaceholder')}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center">
            <Label htmlFor="hero-buttonLink">{t('buttonLink')}</Label>
            <FieldHint text={t('buttonLinkHint')} />
          </div>
          <Input
            id="hero-buttonLink"
            value={content.buttonLink || ''}
            onChange={(e) => handleChange('buttonLink', e.target.value)}
            placeholder={t('buttonLinkPlaceholder')}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div className="space-y-2">
          <div className="flex items-center">
            <Label htmlFor="hero-secondaryButtonText">{t('secondaryButtonText')}</Label>
            <FieldHint text={t('secondaryButtonTextHint')} />
          </div>
          <Input
            id="hero-secondaryButtonText"
            value={content.secondaryButtonText || ''}
            onChange={(e) => handleChange('secondaryButtonText', e.target.value)}
            placeholder={t('secondaryButtonPlaceholder')}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center">
            <Label htmlFor="hero-secondaryButtonLink">{t('secondaryButtonLink')}</Label>
            <FieldHint text={t('secondaryButtonLinkHint')} />
          </div>
          <Input
            id="hero-secondaryButtonLink"
            value={content.secondaryButtonLink || ''}
            onChange={(e) => handleChange('secondaryButtonLink', e.target.value)}
            placeholder={t('secondaryButtonLinkPlaceholder')}
          />
        </div>
      </div>
    </div>
  );
}
