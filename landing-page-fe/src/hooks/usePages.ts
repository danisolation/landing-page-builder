"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getPages,
  getPage,
  createPage,
  updatePage,
  deletePage,
} from "@/lib/api";
import { pageKeys } from "@/lib/query-keys";
import type { CreatePageInput, UpdatePageInput } from "@/types";

export function usePages() {
  const queryClient = useQueryClient();

  // Lấy danh sách pages
  const {
    data: pages,
    isLoading,
    error,
  } = useQuery({
    queryKey: pageKeys.all,
    queryFn: getPages,
  });

  // Tạo page
  const createMutation = useMutation({
    mutationFn: createPage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pageKeys.all });
      toast.success("Tạo trang thành công");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Đã xảy ra lỗi khi tạo trang");
    },
  });

  // Cập nhật page
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePageInput }) =>
      updatePage(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pageKeys.all });
      toast.success("Cập nhật trang thành công");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Đã xảy ra lỗi khi cập nhật trang");
    },
  });

  // Xóa page
  const deleteMutation = useMutation({
    mutationFn: deletePage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pageKeys.all });
      toast.success("Xóa trang thành công");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Đã xảy ra lỗi khi xóa trang");
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
    queryKey: pageKeys.detail(id),
    queryFn: () => getPage(id),
    enabled: !!id,
  });
}
