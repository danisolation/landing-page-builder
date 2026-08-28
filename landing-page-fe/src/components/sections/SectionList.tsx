'use client';

import { useState, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useTranslations } from 'next-intl';
import { Plus, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import SectionCard from './SectionCard';

interface SectionListProps {
  sections: any[];
  activeSectionId?: string | null;
  onEdit: (section: any) => void;
  onAdd: () => void;
  onPreview: (section: any) => void;
  onDuplicate: (section: any) => void;
  onDelete: (section: any) => void;
  onReorder: (sectionIds: string[]) => void;
}

export default function SectionList({
  sections,
  activeSectionId,
  onEdit,
  onAdd,
  onPreview,
  onDuplicate,
  onDelete,
  onReorder,
}: SectionListProps) {
  const t = useTranslations('sectionList');
  const [orderedSections, setOrderedSections] = useState(() =>
    [...sections].sort((a, b) => a.order - b.order)
  );

  // Sync with prop changes (e.g. after API refetch)
  useEffect(() => {
    setOrderedSections([...sections].sort((a, b) => a.order - b.order));
  }, [sections]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = orderedSections.findIndex((s) => s.id === active.id);
    const newIndex = orderedSections.findIndex((s) => s.id === over.id);

    const newOrder = arrayMove(orderedSections, oldIndex, newIndex);
    setOrderedSections(newOrder);
    onReorder(newOrder.map((s) => s.id));
  };

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
          <Button size="sm" onClick={onAdd}>
            <Plus size={14} className="mr-1.5" />
            {t('addSection')}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {orderedSections.length === 0 ? (
          <div className="text-center py-12">
            <Layers size={40} className="mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground mb-4">{t('noSections')}</p>
            <Button size="sm" variant="outline" onClick={onAdd}>
              <Plus size={14} className="mr-1.5" />
              {t('addSection')}
            </Button>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={orderedSections.map((s) => s.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {orderedSections.map((section) => (
                  <SectionCard
                    key={section.id}
                    section={section}
                    isActive={activeSectionId === section.id}
                    onEdit={() => onEdit(section)}
                    onPreview={() => onPreview(section)}
                    onDuplicate={() => onDuplicate(section)}
                    onDelete={() => onDelete(section)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </CardContent>
    </Card>
  );
}
