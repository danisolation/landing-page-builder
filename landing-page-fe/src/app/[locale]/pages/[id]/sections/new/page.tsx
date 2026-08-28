'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
import { defaultContent, sectionEditors } from '@/components/sections/section-constants';

export default function NewSectionPage() {
  const t = useTranslations('sectionEditor');
  const tCommon = useTranslations('common');
  const tValidation = useTranslations('validation');
  const tTypes = useTranslations('sectionTypes');

  const newSectionSchema = z.object({
    type: z.string().min(1, tValidation('sectionTypeRequired')),
    order: z.coerce.number().min(0, tValidation('minOrder')),
  });

  type NewSectionFormData = z.infer<typeof newSectionSchema>;
  const router = useRouter();
  const params = useParams();
  const pageId = params.id as string;

  const { createSection, isCreating } = useSections(pageId);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<NewSectionFormData>({
    resolver: zodResolver(newSectionSchema),
    defaultValues: {
      type: 'hero',
      order: 0,
    },
  });

  const typeValue = watch('type');
  const [content, setContent] = useState(defaultContent['hero']);
  const [showPreview, setShowPreview] = useState(false);

  const handleTypeChange = (newType: string) => {
    setValue('type', newType);
    setContent(defaultContent[newType] || {});
  };

  const onSubmit = (data: NewSectionFormData) => {
    createSection(
      { type: data.type, content, order: data.order },
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

  const EditorComponent = sectionEditors[typeValue];

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

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Type + Order */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {t('sectionType')}
            </Label>
            <Select value={typeValue} onValueChange={handleTypeChange}>
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
            {errors.type && (
              <p className="text-xs text-destructive">{errors.type.message}</p>
            )}
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
          <Button type="submit" disabled={isCreating} size="sm">
            {isCreating ? tCommon('saving') : tCommon('save')}
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
