"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createSection, updateSection, deleteSection } from "@/lib/api";

export function useSections(pageId: string) {
  const queryClient = useQueryClient();

  // Tạo section
  const createMutation = useMutation({
    mutationFn: (data: any) => createSection(pageId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pages", pageId] });
    },
  });

  // Cập nhật section
  const updateMutation = useMutation({
    mutationFn: ({ sectionId, data }: { sectionId: string; data: any }) =>
      updateSection(pageId, sectionId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pages", pageId] });
    },
  });

  // Xóa section
  const deleteMutation = useMutation({
    mutationFn: (sectionId: string) => deleteSection(pageId, sectionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pages", pageId] });
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
