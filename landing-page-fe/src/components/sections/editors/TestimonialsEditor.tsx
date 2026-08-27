'use client';

import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

interface TestimonialsEditorProps {
  content: any;
  onChange: (content: any) => void;
}

export default function TestimonialsEditor({ content, onChange }: TestimonialsEditorProps) {
  const t = useTranslations('testimonialsEditor');
  const tCommon = useTranslations('common');
  const items = content.items || [];

  const handleFieldChange = (field: string, value: string) => {
    onChange({ ...content, [field]: value });
  };

  const handleItemChange = (index: number, field: string, value: string) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    onChange({ ...content, items: newItems });
  };

  const addItem = () => {
    onChange({
      ...content,
      items: [...items, { quote: '', name: '', role: '', avatar: '' }],
    });
  };

  const removeItem = (index: number) => {
    onChange({ ...content, items: items.filter((_: any, i: number) => i !== index) });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>{t('subtitle')}</Label>
        <Input
          value={content.subtitle || ''}
          onChange={(e) => handleFieldChange('subtitle', e.target.value)}
          placeholder="Đánh giá"
        />
      </div>

      <div className="space-y-2">
        <Label>{t('sectionTitle')}</Label>
        <Input
          value={content.title || ''}
          onChange={(e) => handleFieldChange('title', e.target.value)}
          placeholder="Khách hàng nói gì về chúng tôi"
        />
      </div>

      <div className="space-y-2">
        <Label>{t('description')}</Label>
        <Input
          value={content.description || ''}
          onChange={(e) => handleFieldChange('description', e.target.value)}
          placeholder="Từ những người đã tin tưởng sử dụng"
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>{t('testimonialItems')}</Label>
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

            <div className="space-y-2">
              <Label>{t('quote')}</Label>
              <Textarea
                value={item.quote || ''}
                onChange={(e) => handleItemChange(index, 'quote', e.target.value)}
                placeholder="Sản phẩm tuyệt vời, giúp tôi tiết kiệm rất nhiều thời gian..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>{t('name')}</Label>
                <Input
                  value={item.name || ''}
                  onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                  placeholder="Nguyễn Văn A"
                />
              </div>

              <div className="space-y-2">
                <Label>{t('role')}</Label>
                <Input
                  value={item.role || ''}
                  onChange={(e) => handleItemChange(index, 'role', e.target.value)}
                  placeholder="CEO, Company X"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t('avatar')}</Label>
              <Input
                value={item.avatar || ''}
                onChange={(e) => handleItemChange(index, 'avatar', e.target.value)}
                placeholder="https://example.com/avatar.jpg"
              />
            </div>
          </div>
        ))}

        {items.length === 0 && (
          <p className="text-sm text-gray-500 text-center py-4">
            {t('noItems')}
          </p>
        )}
      </div>
    </div>
  );
}
