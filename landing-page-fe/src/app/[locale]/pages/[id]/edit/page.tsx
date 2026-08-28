'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
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
import SectionEditPanel from '@/components/sections/SectionEditPanel';
import SectionPreviewModal from '@/components/sections/SectionPreviewModal';
import FullPagePreview from '@/components/sections/FullPagePreview';
import { showConfirm } from '@/components/ui/confirm-dialog';
import { Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function EditPagePage() {
  const t = useTranslations('editPage');
  const tCommon = useTranslations('common');
  const router = useRouter();
  const params = useParams();
  const pageId = params.id as string;

  const { data: page, isLoading } = usePage(pageId);
  const { updatePage, isUpdating } = usePages();
  const { createSection, updateSection, deleteSection } = useSections(pageId);

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');

  // Section editing state
  const [editingSection, setEditingSection] = useState<any>(null);
  const [isAddingSection, setIsAddingSection] = useState(false);

  // Preview state
  const [previewSection, setPreviewSection] = useState<any>(null);
  const [showFullPreview, setShowFullPreview] = useState(false);

  useEffect(() => {
    if (page) {
      setTitle(page.title);
      setSlug(page.slug);
      setDescription(page.description || '');
    }
  }, [page]);

  const handleSavePage = (e: React.FormEvent) => {
    e.preventDefault();
    updatePage(
      { id: pageId, data: { title, slug, description } },
      {
        onSuccess: () => toast.success(t('saveSuccess')),
        onError: (error: any) => toast.error(error.message || t('saveFailed')),
      }
    );
  };

  const handleSaveSection = (data: {
    type: string;
    content: any;
    order: number;
  }) => {
    if (editingSection) {
      updateSection(
        { sectionId: editingSection.id, data },
        {
          onSuccess: () => {
            setEditingSection(null);
            toast.success(t('sectionUpdated'));
          },
          onError: (error: any) =>
            toast.error(error.message || t('sectionUpdateFailed')),
        }
      );
    } else {
      createSection(data, {
        onSuccess: () => {
          setIsAddingSection(false);
          toast.success(t('sectionAdded'));
        },
        onError: (error: any) =>
          toast.error(error.message || t('sectionAddFailed')),
      });
    }
  };

  const handleEditSection = (section: any) => {
    setIsAddingSection(false);
    setEditingSection(section);
  };

  const handleAddSection = () => {
    setEditingSection(null);
    setIsAddingSection(true);
  };

  const handleClosePanel = () => {
    setEditingSection(null);
    setIsAddingSection(false);
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
    // Update each section's order based on new position
    sectionIds.forEach((id, index) => {
      const section = page?.sections?.find((s: any) => s.id === id);
      if (section && section.order !== index) {
        updateSection({ sectionId: id, data: { order: index } });
      }
    });
  };

  const isPanelOpen = isAddingSection || !!editingSection;

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
        <div className="max-w-7xl space-y-8">
          <SkeletonForm />
        </div>
      </div>
    );
  }

  return (
    <div>
      <Breadcrumbs />

      <div className="flex gap-6">
        {/* Main content — left side */}
        <div className="flex-1 min-w-0 space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
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
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">{t('pageInfo')}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSavePage} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      {t('titleLabel')}
                    </Label>
                    <Input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      {t('slugLabel')}
                    </Label>
                    <Input
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    {t('descLabel')}
                  </Label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
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
            activeSectionId={editingSection?.id}
            onEdit={handleEditSection}
            onAdd={handleAddSection}
            onPreview={(section) => setPreviewSection(section)}
            onDuplicate={handleDuplicateSection}
            onDelete={handleDeleteSection}
            onReorder={handleReorder}
          />
        </div>

        {/* Edit Panel — right side (desktop only) */}
        <AnimatePresence>
          {isPanelOpen && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: '40%', opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="shrink-0 hidden lg:block overflow-hidden"
              style={{ maxWidth: '480px', minWidth: '360px' }}
            >
              <div className="h-[calc(100vh-120px)] sticky top-6">
                <SectionEditPanel
                  section={editingSection}
                  onSave={handleSaveSection}
                  onClose={handleClosePanel}
                  isLoading={false}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Mobile + Tablet: full-screen panel overlay */}
      <AnimatePresence>
        {isPanelOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/40 lg:hidden"
            onClick={handleClosePanel}
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="absolute right-0 top-0 bottom-0 w-full sm:w-[85%] sm:max-w-[420px]"
              onClick={(e) => e.stopPropagation()}
            >
              <SectionEditPanel
                section={editingSection}
                onSave={handleSaveSection}
                onClose={handleClosePanel}
                isLoading={false}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
