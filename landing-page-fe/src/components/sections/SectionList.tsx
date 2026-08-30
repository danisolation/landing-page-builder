'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { monitorForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { reorder } from '@atlaskit/pragmatic-drag-and-drop/reorder';
import { useTranslations } from 'next-intl';
import { Plus, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from '@/i18n/navigation';
import SectionCard from './SectionCard';
import DragOverlay from './DragOverlay';
import type { Section, SectionType, SectionContent } from '@/types';

interface DragOverlayData {
  sectionId: string;
  sectionType: SectionType;
  sectionContent: SectionContent;
  sectionOrder: number;
}

export interface SectionListProps {
  sections: Section[];
  pageId: string;
  onPreview: (section: Section) => void;
  onDuplicate: (section: Section) => void;
  onDelete: (section: Section) => void;
  onReorder: (sectionIds: string[]) => void;
}

export default function SectionList({
  sections,
  pageId,
  onPreview,
  onDuplicate,
  onDelete,
  onReorder,
}: SectionListProps) {
  const t = useTranslations('sectionList');
  const [dragOverlay, setDragOverlay] = useState<DragOverlayData | null>(null);

  // Compute sorted sections from props directly — no useState + useEffect needed
  const orderedSections = useMemo(
    () => [...sections].sort((a, b) => a.order - b.order),
    [sections],
  );

  // Keep a ref for the drag monitor callback
  const orderedSectionsRef = useRef(orderedSections);

  // Sync ref with latest orderedSections
  useEffect(() => {
    orderedSectionsRef.current = orderedSections;
  });

  const handleDragOverlayChange = useCallback((data: DragOverlayData | null) => {
    setDragOverlay(data);
  }, []);

  // Register global drag monitor once
  useEffect(() => {
    return monitorForElements({
      canMonitor: ({ source }) =>
        (source.data as Record<string, unknown>)?.type === 'section-card',
      onDrop: ({ source, location }) => {
        const dropTarget = location.current.dropTargets[0];
        if (!dropTarget) return;

        const startIndex = (source.data as Record<string, unknown>)?.index as number;
        const finishIndex = (dropTarget.data as Record<string, unknown>)?.index as number;
        if (startIndex === undefined || finishIndex === undefined) return;
        if (startIndex === finishIndex) return;

        const current = orderedSectionsRef.current;
        const newOrder = reorder({
          list: current,
          startIndex,
          finishIndex,
        });

        orderedSectionsRef.current = newOrder;
        onReorder(newOrder.map((s) => s.id));
      },
    });
  }, [onReorder]);

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Layers size={18} className="text-muted-foreground" />
            {t('title')}
            <span className="text-sm font-normal text-muted-foreground">
              ({sections.length})
            </span>
          </CardTitle>
          <Link href={`/pages/${pageId}/sections/new`}>
            <Button size="sm">
              <Plus size={14} className="mr-1.5" />
              {t('addSection')}
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {orderedSections.length === 0 ? (
          <div className="text-center py-12">
            <Layers size={40} className="mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground mb-4">{t('noSections')}</p>
            <Link href={`/pages/${pageId}/sections/new`}>
              <Button size="sm" variant="outline">
                <Plus size={14} className="mr-1.5" />
                {t('addSection')}
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {orderedSections.map((section, index) => (
              <SectionCard
                key={section.id}
                section={section}
                index={index}
                pageId={pageId}
                onPreview={() => onPreview(section)}
                onDuplicate={() => onDuplicate(section)}
                onDelete={() => onDelete(section)}
                onDragOverlayChange={handleDragOverlayChange}
              />
            ))}
          </div>
        )}
      </CardContent>

      {/* Floating drag overlay */}
      {dragOverlay && <DragOverlay data={dragOverlay} />}
    </Card>
  );
}
