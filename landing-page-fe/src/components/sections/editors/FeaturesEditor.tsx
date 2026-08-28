'use client';

import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

interface FeaturesEditorProps {
  content: any;
  onChange: (content: any) => void;
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
    const newItems = items.filter((_: any, i: number) => i !== index);
    onChange({
      ...content,
      items: newItems,
    });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>{t('sectionTitle')}</Label>
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

        {items.map((item: any, index: number) => (
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

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label>{t('icon')}</Label>
                <Input
                  value={item.icon || ''}
                  onChange={(e) => handleItemChange(index, 'icon', e.target.value)}
                  placeholder="⚡"
                />
              </div>

              <div className="space-y-2">
                <Label>{t('name')}</Label>
                <Input
                  value={item.name || ''}
                  onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                  placeholder={t('namePlaceholder')}
                />
              </div>

              <div className="space-y-2">
                <Label>{t('description')}</Label>
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
