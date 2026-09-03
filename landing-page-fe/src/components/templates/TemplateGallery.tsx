'use client';

import { Suspense, lazy, useMemo, useState } from 'react';

import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { showConfirm } from '@/components/ui/confirm-dialog';
import TemplateCard from './TemplateCard';
import { builtInTemplates } from './template-constants';

import { useTemplates } from '@/hooks/useTemplates';

import type { Section, SectionType, TemplateSectionDef } from '@/types';

const FullPagePreview = lazy(() => import('@/components/sections/FullPagePreview'));

interface PreviewState {
  name: string;
  sections: TemplateSectionDef[];
}

export interface TemplateGalleryProps {
  selectedId: string;
  onSelect: (id: string, sections: TemplateSectionDef[]) => void;
}

const SECTION_TYPES: SectionType[] = ['hero', 'features', 'cta', 'stats', 'testimonials'];

export default function TemplateGallery({ selectedId, onSelect }: TemplateGalleryProps) {
  const t = useTranslations('templates');
  const tSection = useTranslations('sectionTypes');
  const { templates, error, deleteTemplate } = useTemplates();
  const [preview, setPreview] = useState<PreviewState | null>(null);

  const sectionLabels = useMemo(
    () =>
      Object.fromEntries(SECTION_TYPES.map((type) => [type, tSection(type)])) as Record<
        SectionType,
        string
      >,
    [tSection]
  );

  const cardLabels = useMemo(
    () => ({
      preview: t('preview'),
      deleteTemplate: t('deleteTemplate'),
      customBadge: t('customBadge'),
    }),
    [t]
  );

  // Synthetic page — FullPagePreview cần Section[] đầy đủ field
  const previewPage = useMemo(() => {
    if (!preview) return null;
    const now = new Date().toISOString();
    return {
      title: preview.name,
      slug: 'preview',
      sections: preview.sections.map((s, i) => ({
        ...s,
        id: `preview-${i}`,
        pageId: 'preview',
        createdAt: now,
        updatedAt: now,
      })) as Section[],
    };
  }, [preview]);

  const handleDelete = async (id: string) => {
    const confirmed = await showConfirm(t('deleteConfirmTitle'), t('deleteConfirmMessage'));
    if (!confirmed) return;

    deleteTemplate(id, {
      onSuccess: () => {
        toast.success(t('deleted'));
        if (selectedId === id) onSelect('blank', []);
      },
      onError: (err: Error) => toast.error(err.message || t('deleteFailed')),
    });
  };

  return (
    <Card className="mb-6">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">{t('chooseTemplate')}</CardTitle>
        <p className="text-sm text-muted-foreground">{t('chooseTemplateHint')}</p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <TemplateCard
            data={{
              id: 'blank',
              name: t('blankName'),
              description: t('blankDescription'),
              sectionTypes: [],
            }}
            selected={selectedId === 'blank'}
            sectionLabels={sectionLabels}
            labels={cardLabels}
            onSelect={() => onSelect('blank', [])}
          />

          {builtInTemplates.map((template) => (
            <TemplateCard
              key={template.id}
              data={{
                id: template.id,
                name: t(`builtin.${template.id}.name`),
                description: t(`builtin.${template.id}.description`),
                sectionTypes: template.sections.map((s) => s.type),
              }}
              selected={selectedId === template.id}
              sectionLabels={sectionLabels}
              labels={cardLabels}
              onSelect={() => onSelect(template.id, template.sections)}
              onPreview={() =>
                setPreview({ name: t(`builtin.${template.id}.name`), sections: template.sections })
              }
            />
          ))}

          {(templates || []).map((template) => (
            <TemplateCard
              key={template.id}
              data={{
                id: template.id,
                name: template.name,
                description: template.description,
                sectionTypes: template.sections.map((s) => s.type),
                isCustom: true,
              }}
              selected={selectedId === template.id}
              sectionLabels={sectionLabels}
              labels={cardLabels}
              onSelect={() => onSelect(template.id, template.sections)}
              onPreview={() => setPreview({ name: template.name, sections: template.sections })}
              onDelete={() => handleDelete(template.id)}
            />
          ))}
        </div>

        {error && (
          <p className="text-xs text-muted-foreground mt-3">{t('loadCustomFailed')}</p>
        )}
      </CardContent>

      {previewPage && (
        <Suspense fallback={null}>
          <FullPagePreview
            page={previewPage}
            isOpen={!!preview}
            onClose={() => setPreview(null)}
            showOpenLink={false}
          />
        </Suspense>
      )}
    </Card>
  );
}
