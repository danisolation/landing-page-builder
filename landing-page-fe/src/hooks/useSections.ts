"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createSection, updateSection, deleteSection } from "@/lib/api";
import { sectionKeys, pageKeys } from "@/lib/query-keys";
import type { CreateSectionInput, UpdateSectionInput } from "@/types";

export function useSections(pageId: string) {
  const queryClient = useQueryClient();

  // Create section — toast handled at call-site
  const createMutation = useMutation({
    mutationFn: (data: CreateSectionInput) => createSection(pageId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sectionKeys.byPage(pageId) });
      queryClient.invalidateQueries({ queryKey: pageKeys.detail(pageId) });
    },
  });

  // Update section — toast handled at call-site
  const updateMutation = useMutation({
    mutationFn: ({ sectionId, data }: { sectionId: string; data: UpdateSectionInput }) =>
      updateSection(pageId, sectionId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sectionKeys.byPage(pageId) });
      queryClient.invalidateQueries({ queryKey: pageKeys.detail(pageId) });
    },
  });

  // Delete section — toast handled at call-site
  const deleteMutation = useMutation({
    mutationFn: (sectionId: string) => deleteSection(pageId, sectionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sectionKeys.byPage(pageId) });
      queryClient.invalidateQueries({ queryKey: pageKeys.detail(pageId) });
    },
  });

  return {
    createSection: createMutation.mutate,
    isCreating: createMutation.isPending,
    updateSection: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
    deleteSection: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
  };
}
