'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
import { sectionEditors } from '@/components/sections/section-constants';
import type { SectionType, SectionContent } from '@/types';

export default function EditSectionPage() {
  const t = useTranslations('sectionEditor');
  const tCommon = useTranslations('common');
  const tSectionEdit = useTranslations('sectionEditPage');
  const tValidation = useTranslations('validation');
  const tTypes = useTranslations('sectionTypes');

  const editSectionSchema = z.object({
    type: z.string().min(1, tValidation('sectionTypeRequired')),
    order: z.coerce.number().min(0, tValidation('minOrder')),
  });

  type EditSectionFormData = z.infer<typeof editSectionSchema>;
  const router = useRouter();
  const params = useParams();
  const pageId = params.id as string;
  const sectionId = params.sectionId as string;

  const { data: page, isLoading } = usePage(pageId);
  const { updateSection, isUpdating } = useSections(pageId);

  const section = page?.sections?.find((s) => s.id === sectionId);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<EditSectionFormData>({
    resolver: zodResolver(editSectionSchema),
    defaultValues: {
      type: '',
      order: 0,
    },
  });

  const typeValue = watch('type') as SectionType;
  const [content, setContent] = useState<SectionContent>({} as SectionContent);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (section) {
      reset({
        type: section.type,
        order: section.order,
      });
      setContent(section.content);
    }
  }, [section, reset]);

  const onSubmit = (data: EditSectionFormData) => {
    updateSection(
      { sectionId, data: { type: data.type as SectionType, content, order: data.order } },
      {
        onSuccess: () => {
          toast.success(t('sectionUpdated'));
          router.push(`/pages/${pageId}/edit`);
        },
        onError: (error: Error) => {
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
        <Breadcrumbs pageTitle={page?.title} />
        <h1 className="text-2xl font-bold text-foreground tracking-tight mb-6">
          {t('editSection')}
        </h1>
        <p className="text-muted-foreground">{tSectionEdit('sectionNotFound')}</p>
      </div>
    );
  }

  const EditorComponent = sectionEditors[typeValue];

  return (
    <div>
      <Breadcrumbs pageTitle={page?.title} />

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

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Type + Order */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {t('sectionType')}
            </Label>
            <Select value={typeValue} disabled>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hero">{tTypes('hero')}</SelectItem>
                <SelectItem value="features">{tTypes('features')}</SelectItem>
                <SelectItem value="cta">{tTypes('cta')}</SelectItem>
                <SelectItem value="stats">{tTypes('stats')}</SelectItem>
                <SelectItem value="testimonials">{tTypes('testimonials')}</SelectItem>
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
              {...register('order')}
              min={0}
            />
            {errors.order && (
              <p className="text-xs text-destructive">{errors.order.message}</p>
            )}
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
          <Button type="submit" disabled={isUpdating} size="sm">
            {isUpdating ? tCommon('saving') : tCommon('save')}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => router.push(`/pages/${pageId}/edit`)}
          >
            {tCommon('cancel')}
          </Button>
        </div>
      </form>

      {/* Preview Modal */}
      <SectionPreviewModal
        type={typeValue}
        content={content}
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
      />
    </div>
  );
}
