'use client';

import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import FieldHint from '@/components/ui/field-hint';
import type { FeaturesContent } from '@/types';

export interface FeaturesEditorProps {
  content: FeaturesContent;
  onChange: (content: FeaturesContent) => void;
}

export default function FeaturesEditor({ content, onChange }: FeaturesEditorProps) {
  const t = useTranslations('featuresEditor');
  const tCommon = useTranslations('common');
  const items = content.items || [];

  const handleTitleChange = (value: string) => {
    onChange({
      ...content,
      title: value,
    });
  };

  const handleItemChange = (index: number, field: string, value: string) => {
    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      [field]: value,
    };
    onChange({
      ...content,
      items: newItems,
    });
  };

  const addItem = () => {
    onChange({
      ...content,
      items: [
        ...items,
        { icon: '✨', name: '', description: '' },
      ],
    });
  };

  const removeItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    onChange({
      ...content,
      items: newItems,
    });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center">
          <Label>{t('sectionTitle')}</Label>
          <FieldHint text={t('titleHint')} />
        </div>
        <Input
          value={content.title || ''}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder={t('titlePlaceholder')}
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>{t('featureItems')}</Label>
          <Button type="button" variant="outline" size="sm" onClick={addItem}>
            {t('addItem')}
          </Button>
        </div>

        {items.map((item, index) => (
          <div key={index} className="border rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{t('item', { n: index + 1 })}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeItem(index)}
                className="text-red-500 hover:text-red-700"
              >
                {tCommon('delete')}
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <div className="space-y-2">
                <div className="flex items-center">
                  <Label>{t('icon')}</Label>
                  <FieldHint text={t('iconHint')} />
                </div>
                <Input
                  value={item.icon || ''}
                  onChange={(e) => handleItemChange(index, 'icon', e.target.value)}
                  placeholder="⚡"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center">
                  <Label>{t('name')}</Label>
                  <FieldHint text={t('nameHint')} />
                </div>
                <Input
                  value={item.name || ''}
                  onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                  placeholder={t('namePlaceholder')}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center">
                  <Label>{t('description')}</Label>
                  <FieldHint text={t('descriptionHint')} />
                </div>
                <Input
                  value={item.description || ''}
                  onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                  placeholder={t('descriptionPlaceholder')}
                />
              </div>
            </div>
          </div>
        ))}

        {items.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            {t('noFeatures')}
          </p>
        )}
      </div>
    </div>
  );
}
