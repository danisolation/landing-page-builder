'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { useSections } from '@/hooks/useSections';
import { Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import SectionPreviewModal from '@/components/sections/SectionPreviewModal';
import { defaultContent, sectionEditors, sectionTypes } from '@/components/sections/section-constants';

export default function NewSectionPage() {
  const t = useTranslations('sectionEditor');
  const tCommon = useTranslations('common');
  const router = useRouter();
  const params = useParams();
  const pageId = params.id as string;

  const { createSection, isCreating } = useSections(pageId);

  const [type, setType] = useState('hero');
  const [content, setContent] = useState(defaultContent['hero']);
  const [order, setOrder] = useState(0);
  const [showPreview, setShowPreview] = useState(false);

  const handleTypeChange = (newType: string) => {
    setType(newType);
    setContent(defaultContent[newType] || {});
  };

  const handleSave = () => {
    createSection(
      { type, content, order },
      {
        onSuccess: () => {
          toast.success(t('sectionAdded'));
          router.push(`/pages/${pageId}/edit`);
        },
        onError: (error: any) => {
          toast.error(error.message || t('sectionAddFailed'));
        },
      }
    );
  };

  const EditorComponent = sectionEditors[type];

  return (
    <div>
      <Breadcrumbs />

      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-foreground tracking-tight">
          {t('addSection')}
        </h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPreview(true)}
          >
            <Eye size={14} className="mr-1.5" />
            {t('preview')}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/pages/${pageId}/edit`)}
          >
            {tCommon('back')}
          </Button>
        </div>
      </div>

      <div className="max-w-3xl space-y-5">
        {/* Type + Order */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {t('sectionType')}
            </Label>
            <Select value={type} onValueChange={handleTypeChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hero">Hero</SelectItem>
                <SelectItem value="features">Features</SelectItem>
                <SelectItem value="cta">CTA</SelectItem>
                <SelectItem value="stats">Stats</SelectItem>
                <SelectItem value="testimonials">Testimonials</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {t('order')}
            </Label>
            <Input
              type="number"
              value={order}
              onChange={(e) => setOrder(Number(e.target.value))}
              min={0}
            />
          </div>
        </div>

        {/* Type-specific editor */}
        {EditorComponent && (
          <div className="border-t border-border pt-5">
            <EditorComponent content={content} onChange={setContent} />
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button onClick={handleSave} disabled={isCreating} size="sm">
            {isCreating ? tCommon('saving') : tCommon('save')}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/pages/${pageId}/edit`)}
          >
            {tCommon('cancel')}
          </Button>
        </div>
      </div>

      {/* Preview Modal */}
      <SectionPreviewModal
        type={type}
        content={content}
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
      />
    </div>
  );
}
