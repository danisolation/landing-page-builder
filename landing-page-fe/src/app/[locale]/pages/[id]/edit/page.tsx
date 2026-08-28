'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { usePage, usePages } from '@/hooks/usePages';
import { useSections } from '@/hooks/useSections';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { SkeletonForm } from '@/components/ui/loading';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import SectionList from '@/components/sections/SectionList';
import SectionPreviewModal from '@/components/sections/SectionPreviewModal';
import FullPagePreview from '@/components/sections/FullPagePreview';
import { showConfirm } from '@/components/ui/confirm-dialog';
import { Eye } from 'lucide-react';

export default function EditPagePage() {
  const t = useTranslations('editPage');
  const tCommon = useTranslations('common');
  const tValidation = useTranslations('validation');

  const editPageSchema = z.object({
    title: z.string().min(1, tValidation('required', { field: t('titleLabel') })),
    slug: z
      .string()
      .min(1, tValidation('required', { field: t('slugLabel') }))
      .regex(/^[a-z0-9-]+$/, tValidation('slugFormat')),
    description: z.string().optional(),
  });

  type EditPageFormData = z.infer<typeof editPageSchema>;
  const router = useRouter();
  const params = useParams();
  const pageId = params.id as string;

  const { data: page, isLoading } = usePage(pageId);
  const { updatePage, isUpdating } = usePages();
  const { createSection, updateSection, deleteSection } = useSections(pageId);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditPageFormData>({
    resolver: zodResolver(editPageSchema),
    defaultValues: {
      title: '',
      slug: '',
      description: '',
    },
  });

  useEffect(() => {
    if (page) {
      reset({
        title: page.title,
        slug: page.slug,
        description: page.description || '',
      });
    }
  }, [page, reset]);

  // Preview state
  const [previewSection, setPreviewSection] = useState<any>(null);
  const [showFullPreview, setShowFullPreview] = useState(false);

  const onSubmit = (data: EditPageFormData) => {
    updatePage(
      { id: pageId, data },
      {
        onSuccess: () => toast.success(t('saveSuccess')),
        onError: (error: any) => toast.error(error.message || t('saveFailed')),
      }
    );
  };

  const handleDuplicateSection = (section: any) => {
    const maxOrder = Math.max(
      0,
      ...(page?.sections?.map((s: any) => s.order) || [0])
    );
    createSection(
      {
        type: section.type,
        content: { ...section.content },
        order: maxOrder + 1,
      },
      {
        onSuccess: () => toast.success(t('sectionDuplicated')),
        onError: (error: any) =>
          toast.error(error.message || t('sectionDuplicateFailed')),
      }
    );
  };

  const handleDeleteSection = async (section: any) => {
    const confirmed = await showConfirm(
      t('deleteConfirmTitle'),
      t('deleteConfirmMessage')
    );
    if (!confirmed) return;

    deleteSection(section.id, {
      onSuccess: () => toast.success(t('sectionDeleted')),
      onError: (error: any) =>
        toast.error(error.message || t('sectionDeleteFailed')),
    });
  };

  const handleReorder = (sectionIds: string[]) => {
    sectionIds.forEach((id, index) => {
      updateSection({ sectionId: id, data: { order: index } });
    });
  };

  if (isLoading) {
    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            {t('title')}
          </h1>
          <Button variant="outline" disabled size="sm">
            {tCommon('back')}
          </Button>
        </div>
        <div className="space-y-8">
          <SkeletonForm />
        </div>
      </div>
    );
  }

  return (
    <div>
      <Breadcrumbs />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-foreground tracking-tight">
          {t('title')}
        </h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFullPreview(true)}
          >
            <Eye size={14} className="mr-1.5" />
            {t('previewPage')}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/dashboard')}
          >
            {tCommon('back')}
          </Button>
        </div>
      </div>

      {/* Page Info */}
      <Card className="mb-6">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">{t('pageInfo')}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  {t('titleLabel')}
                </Label>
                <Input
                  {...register('title')}
                />
                {errors.title && (
                  <p className="text-xs text-destructive">{errors.title.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  {t('slugLabel')}
                </Label>
                <Input
                  {...register('slug')}
                />
                {errors.slug && (
                  <p className="text-xs text-destructive">{errors.slug.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">
                {t('descLabel')}
              </Label>
              <Textarea
                {...register('description')}
                rows={2}
              />
            </div>

            <Button type="submit" disabled={isUpdating} size="sm">
              {isUpdating ? tCommon('saving') : tCommon('save')}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Section List */}
      <SectionList
        sections={page?.sections || []}
        pageId={pageId}
        onPreview={(section) => setPreviewSection(section)}
        onDuplicate={handleDuplicateSection}
        onDelete={handleDeleteSection}
        onReorder={handleReorder}
      />

      {/* Section Preview Modal */}
      {previewSection && (
        <SectionPreviewModal
          type={previewSection.type}
          content={previewSection.content}
          isOpen={!!previewSection}
          onClose={() => setPreviewSection(null)}
        />
      )}

      {/* Full Page Preview */}
      {page && (
        <FullPagePreview
          page={page}
          isOpen={showFullPreview}
          onClose={() => setShowFullPreview(false)}
        />
      )}
    </div>
  );
}
