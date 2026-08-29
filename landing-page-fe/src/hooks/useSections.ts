"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createSection, updateSection, deleteSection } from "@/lib/api";

export function useSections(pageId: string) {
  const queryClient = useQueryClient();

  // Tạo section
  const createMutation = useMutation({
    mutationFn: (data: any) => createSection(pageId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pages", pageId] });
      toast.success("Tạo section thành công");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Đã xảy ra lỗi khi tạo section");
    },
  });

  // Cập nhật section
  const updateMutation = useMutation({
    mutationFn: ({ sectionId, data }: { sectionId: string; data: any }) =>
      updateSection(pageId, sectionId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pages", pageId] });
      toast.success("Cập nhật section thành công");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Đã xảy ra lỗi khi cập nhật section");
    },
  });

  // Xóa section
  const deleteMutation = useMutation({
    mutationFn: (sectionId: string) => deleteSection(pageId, sectionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pages", pageId] });
      toast.success("Xóa section thành công");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Đã xảy ra lỗi khi xóa section");
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
