"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getPages,
  getPage,
  createPage,
  updatePage,
  deletePage,
} from "@/lib/api";
import { pageKeys } from "@/lib/query-keys";
import type { UpdatePageInput } from "@/types";

export function usePages() {
  const queryClient = useQueryClient();

  // Fetch all pages
  const {
    data: pages,
    isLoading,
    error,
  } = useQuery({
    queryKey: pageKeys.all,
    queryFn: getPages,
  });

  // Create page — toast handled at call-site
  const createMutation = useMutation({
    mutationFn: createPage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pageKeys.all });
    },
  });

  // Update page — toast handled at call-site
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePageInput }) =>
      updatePage(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pageKeys.all });
    },
  });

  // Delete page — toast handled at call-site
  const deleteMutation = useMutation({
    mutationFn: deletePage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pageKeys.all });
    },
  });

  // Publish/Unpublish page
  const publishMutation = useMutation({
    mutationFn: ({ id, isPublished }: { id: string; isPublished: boolean }) =>
      updatePage(id, { isPublished }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pageKeys.all });
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
    publishPage: publishMutation.mutate,
    isPublishing: publishMutation.isPending,
  };
}

// Hook for a single page
export function usePage(id: string) {
  return useQuery({
    queryKey: pageKeys.detail(id),
    queryFn: () => getPage(id),
    enabled: !!id,
  });
}
