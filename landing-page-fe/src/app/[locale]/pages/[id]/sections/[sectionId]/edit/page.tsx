'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { usePage } from '@/hooks/usePages';
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
import { SkeletonForm } from '@/components/ui/loading';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import SectionPreviewModal from '@/components/sections/SectionPreviewModal';
import { sectionEditors, sectionTypes } from '@/components/sections/section-constants';

export default function EditSectionPage() {
  const t = useTranslations('sectionEditor');
  const tCommon = useTranslations('common');
  const router = useRouter();
  const params = useParams();
  const pageId = params.id as string;
  const sectionId = params.sectionId as string;

  const { data: page, isLoading } = usePage(pageId);
  const { updateSection, isUpdating } = useSections(pageId);

  const section = page?.sections?.find((s: any) => s.id === sectionId);

  const [type, setType] = useState('');
  const [content, setContent] = useState<any>({});
  const [order, setOrder] = useState(0);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (section) {
      setType(section.type);
      setContent(section.content);
      setOrder(section.order);
    }
  }, [section]);

  const handleSave = () => {
    updateSection(
      { sectionId, data: { type, content, order } },
      {
        onSuccess: () => {
          toast.success(t('sectionUpdated'));
          router.push(`/pages/${pageId}/edit`);
        },
        onError: (error: any) => {
          toast.error(error.message || t('sectionUpdateFailed'));
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div>
        <Breadcrumbs />
        <h1 className="text-2xl font-bold text-foreground tracking-tight mb-6">
          {t('editSection')}
        </h1>
        <SkeletonForm />
      </div>
    );
  }

  if (!section) {
    return (
      <div>
        <Breadcrumbs />
        <h1 className="text-2xl font-bold text-foreground tracking-tight mb-6">
          {t('editSection')}
        </h1>
        <p className="text-muted-foreground">Section not found.</p>
      </div>
    );
  }

  const EditorComponent = sectionEditors[type];

  return (
    <div>
      <Breadcrumbs />

      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-foreground tracking-tight">
          {t('editSection')}
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

      <div className="space-y-5">
        {/* Type + Order */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {t('sectionType')}
            </Label>
            <Select value={type} disabled>
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
            <p className="text-xs text-muted-foreground">{t('typeLocked')}</p>
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
          <Button onClick={handleSave} disabled={isUpdating} size="sm">
            {isUpdating ? tCommon('saving') : tCommon('save')}
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
