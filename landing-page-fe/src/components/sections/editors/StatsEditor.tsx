'use client';

import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

interface StatsEditorProps {
  content: any;
  onChange: (content: any) => void;
}

export default function StatsEditor({ content, onChange }: StatsEditorProps) {
  const t = useTranslations('statsEditor');
  const tCommon = useTranslations('common');
  const items = content.items || [];

  const handleTitleChange = (value: string) => {
    onChange({ ...content, title: value });
  };

  const handleItemChange = (index: number, field: string, value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    onChange({ ...content, items: newItems });
  };

  const addItem = () => {
    onChange({
      ...content,
      items: [...items, { value: 0, suffix: '', label: '' }],
    });
  };

  const removeItem = (index: number) => {
    onChange({ ...content, items: items.filter((_: any, i: number) => i !== index) });
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
          <Label>{t('statItems')}</Label>
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
                <Label>{t('value')}</Label>
                <Input
                  type="number"
                  value={item.value || ''}
                  onChange={(e) => handleItemChange(index, 'value', parseInt(e.target.value) || 0)}
                  placeholder="1000"
                />
              </div>

              <div className="space-y-2">
                <Label>{t('suffix')}</Label>
                <Input
                  value={item.suffix || ''}
                  onChange={(e) => handleItemChange(index, 'suffix', e.target.value)}
                  placeholder="+"
                />
              </div>

              <div className="space-y-2">
                <Label>{t('label')}</Label>
                <Input
                  value={item.label || ''}
                  onChange={(e) => handleItemChange(index, 'label', e.target.value)}
                  placeholder={t('labelPlaceholder')}
                />
              </div>
            </div>
          </div>
        ))}

        {items.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            {t('noItems')}
          </p>
        )}
      </div>
    </div>
  );
}
