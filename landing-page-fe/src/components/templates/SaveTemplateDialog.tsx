"use client";

import { useEffect, useRef } from "react";

import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export interface SaveTemplateDialogProps {
  isOpen: boolean;
  isSaving: boolean;
  onClose: () => void;
  onSave: (name: string, description?: string) => void;
}

export default function SaveTemplateDialog({
  isOpen,
  isSaving,
  onClose,
  onSave,
}: SaveTemplateDialogProps) {
  const t = useTranslations("saveTemplateDialog");
  const tCommon = useTranslations("common");
  const tValidation = useTranslations("validation");
  const dialogRef = useRef<HTMLDivElement>(null);

  const schema = z.object({
    name: z.string().min(1, tValidation("required", { field: t("nameLabel") })),
    description: z.string().optional(),
  });

  type FormData = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", description: "" },
  });

  // Reset form + focus khi mở dialog
  useEffect(() => {
    if (isOpen) {
      reset({ name: "", description: "" });
      dialogRef.current?.focus();
    }
  }, [isOpen, reset]);

  if (!isOpen) return null;

  const onSubmit = (data: FormData) => {
    onSave(data.name, data.description || undefined);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={t("title")}
        tabIndex={-1}
        onKeyDown={(e) => {
          if (e.key === "Escape") onClose();
        }}
        className="relative bg-card text-card-foreground rounded-xl shadow-xl w-full max-w-md p-6 outline-none"
      >
        <h2 className="text-lg font-semibold text-foreground mb-1">
          {t("title")}
        </h2>
        <p className="text-sm text-muted-foreground mb-4">{t("hint")}</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="template-name" className="text-sm font-medium">
              {t("nameLabel")}
            </Label>
            <Input
              id="template-name"
              {...register("name")}
              placeholder={t("namePlaceholder")}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="template-description"
              className="text-sm font-medium"
            >
              {t("descLabel")}
            </Label>
            <Textarea
              id="template-description"
              {...register("description")}
              rows={2}
              placeholder={t("descPlaceholder")}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              {tCommon("cancel")}
            </Button>
            <Button type="submit" size="sm" disabled={isSaving}>
              {isSaving ? t("saving") : t("save")}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
