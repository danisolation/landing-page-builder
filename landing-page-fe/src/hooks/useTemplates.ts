"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getTemplates, createTemplate, deleteTemplate } from "@/lib/api";
import { templateKeys } from "@/lib/query-keys";

export function useTemplates() {
  const queryClient = useQueryClient();

  // Fetch all custom templates
  const {
    data: templates,
    isLoading,
    error,
  } = useQuery({
    queryKey: templateKeys.all,
    queryFn: getTemplates,
  });

  // Create template — toast handled at call-site
  const createMutation = useMutation({
    mutationFn: createTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: templateKeys.all });
    },
  });

  // Delete template — toast handled at call-site
  const deleteMutation = useMutation({
    mutationFn: deleteTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: templateKeys.all });
    },
  });

  return {
    templates,
    isLoading,
    error,
    createTemplate: createMutation.mutate,
    isCreating: createMutation.isPending,
    deleteTemplate: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
  };
}
