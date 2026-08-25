"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getPages,
  getPage,
  createPage,
  updatePage,
  deletePage,
} from "@/lib/api";

export function usePages() {
  const queryClient = useQueryClient();

  // Lấy danh sách pages
  const {
    data: pages,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["pages"],
    queryFn: getPages,
  });

  // Tạo page
  const createMutation = useMutation({
    mutationFn: createPage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pages"] });
    },
  });

  // Cập nhật page
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      updatePage(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pages"] });
    },
  });

  // Xóa page
  const deleteMutation = useMutation({
    mutationFn: deletePage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pages"] });
    },
  });

  return {
    pages,
    isLoading,
    error,
    createPage: createMutation.mutate,
    isCreating: createMutation.isPending,
    updatePage: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
    deletePage: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
  };
}

// Hook cho 1 page cụ thể
export function usePage(id: string) {
  return useQuery({
    queryKey: ["pages", id],
    queryFn: () => getPage(id),
    enabled: !!id,
  });
}
