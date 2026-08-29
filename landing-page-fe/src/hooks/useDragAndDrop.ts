"use client";

import { useRef, useEffect, useState } from "react";
import {
  draggable,
  dropTargetForElements,
} from "@atlaskit/pragmatic-drag-and-drop/element/adapter";

import type { SectionType, SectionContent } from '@/types';

interface DragAndDropData {
  sectionId: string;
  sectionType: SectionType;
  sectionContent: SectionContent;
  sectionOrder: number;
}

interface DragAndDropOptions {
  index: number;
  sectionId: string;
  sectionType: SectionType;
  sectionContent: SectionContent;
  sectionOrder: number;
  onDragOverlayChange?: (data: DragAndDropData | null) => void;
}

interface DragAndDropReturn {
  cardRef: React.RefObject<HTMLDivElement | null>;
  handleRef: React.RefObject<HTMLDivElement | null>;
  isDragging: boolean;
  closestEdge: "top" | "bottom" | null;
}

export function useDragAndDrop({
  index,
  sectionId,
  sectionType,
  sectionContent,
  sectionOrder,
  onDragOverlayChange,
}: DragAndDropOptions): DragAndDropReturn {
  const cardRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [closestEdge, setClosestEdge] = useState<"top" | "bottom" | null>(null);

  const onDragOverlayChangeRef = useRef(onDragOverlayChange);
  onDragOverlayChangeRef.current = onDragOverlayChange;

  useEffect(() => {
    const card = cardRef.current;
    const handle = handleRef.current;
    if (!card || !handle) return;

    const unsubs: (() => void)[] = [];

    // Make the card draggable via the handle only
    unsubs.push(
      draggable({
        element: handle,
        getInitialData: (): Record<string, unknown> => ({
          index,
          type: "section-card",
          sectionId,
        }),
        onDragStart: () => {
          setIsDragging(true);
          onDragOverlayChangeRef.current?.({
            sectionId,
            sectionType,
            sectionContent,
            sectionOrder,
          });
        },
        onDrop: () => {
          setIsDragging(false);
          onDragOverlayChangeRef.current?.(null);
        },
      })
    );

    // Make the card a drop target
    unsubs.push(
      dropTargetForElements({
        element: card,
        canDrop: ({ source }) =>
          (source.data as Record<string, unknown>)?.type === "section-card",
        getData: ({ input, element }) => {
          const rect = element.getBoundingClientRect();
          const midY = rect.top + rect.height / 2;
          const edge = input.clientY < midY ? "top" : "bottom";
          return { index, sectionId, closestEdge: edge };
        },
        onDrag: ({ self }) => {
          setClosestEdge((self.data.closestEdge as "top" | "bottom") ?? null);
        },
        onDragLeave: () => setClosestEdge(null),
        onDrop: () => setClosestEdge(null),
      })
    );

    return () => unsubs.forEach((unsub) => unsub());
  }, [index, sectionId, sectionType, sectionContent, sectionOrder]);

  return {
    cardRef,
    handleRef,
    isDragging,
    closestEdge,
  };
}
