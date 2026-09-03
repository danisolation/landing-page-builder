"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { usePages } from "@/hooks/usePages";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import FieldHint from "@/components/ui/field-hint";
import TemplateGallery from "@/components/templates/TemplateGallery";
import { ChevronDown } from "lucide-react";
import type { TemplateSectionDef } from "@/types";

interface SelectedTemplate {
  id: string;
  sections: TemplateSectionDef[];
}

export default function NewPagePage() {
  const t = useTranslations("newPage");
  const tValidation = useTranslations("validation");
  const router = useRouter();
  const { createPage, isCreating } = usePages();
  const [template, setTemplate] = useState<SelectedTemplate>({
    id: "blank",
    sections: [],
  });
  const [seoOpen, setSeoOpen] = useState(false);

  const tSeo = useTranslations("editPage");

  const newPageSchema = z.object({
    title: z
      .string()
      .min(1, tValidation("required", { field: t("titleLabel") })),
    slug: z
      .string()
      .min(1, tValidation("required", { field: t("slugLabel") }))
      .regex(/^[a-z0-9-]+$/, tValidation("slugFormat")),
    description: z.string().optional(),
    metaTitle: z.string().max(255).optional(),
    metaDescription: z.string().max(500).optional(),
    ogImageUrl: z.string().max(2048).optional(),
    isPublished: z.boolean().optional(),
  });

  type NewPageFormData = z.infer<typeof newPageSchema>;

  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors },
  } = useForm<NewPageFormData>({
    resolver: zodResolver(newPageSchema),
    defaultValues: {
      title: "",
      slug: "",
      description: "",
      metaTitle: "",
      metaDescription: "",
      ogImageUrl: "",
      isPublished: false,
    },
  });

  const slugValue = watch("slug");

  const onSubmit = (data: NewPageFormData) => {
    const hasSections = template.sections.length > 0;
    createPage(
      { ...data, ...(hasSections ? { sections: template.sections } : {}) },
      {
        onSuccess: (page) => {
          toast.success(t("success"));
          // Có sections từ template → vào thẳng editor để tùy chỉnh
          router.push(hasSections ? `/pages/${page.id}/edit` : "/pages");
        },
        onError: (error: Error) => {
          toast.error(error.message || t("failed"));
        },
      },
    );
  };

  return (
    <div>
      <Breadcrumbs />

      <h1 className="text-2xl font-bold text-foreground tracking-tight mb-6">
        {t("title")}
      </h1>

      <TemplateGallery
        selectedId={template.id}
        onSelect={(id, sections) => setTemplate({ id, sections })}
      />

      <div>
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">{t("pageInfo")}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="space-y-2">
                <div className="flex items-center">
                  <Label htmlFor="title" className="text-sm font-medium">
                    {t("titleLabel")}
                  </Label>
                  <FieldHint text={t("titleHint")} />
                </div>
                <Input id="title" {...register("title")} />
                {errors.title && (
                  <p className="text-xs text-destructive">
                    {errors.title.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center">
                  <Label htmlFor="slug" className="text-sm font-medium">
                    {t("slugLabel")}
                  </Label>
                  <FieldHint text={t("slugHint")} />
                </div>
                <Input
                  id="slug"
                  {...register("slug")}
                  placeholder="san-pham-moi"
                />
                {errors.slug && (
                  <p className="text-xs text-destructive">
                    {errors.slug.message}
                  </p>
                )}
                <p className="text-xs text-muted-foreground font-mono">
                  URL: /{slugValue || "..."}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center">
                  <Label htmlFor="description" className="text-sm font-medium">
                    {t("descLabel")}
                  </Label>
                  <FieldHint text={t("descHint")} />
                </div>
                <Textarea
                  id="description"
                  {...register("description")}
                  rows={3}
                />
              </div>

              <div className="flex items-center gap-3">
                <Controller
                  control={control}
                  name="isPublished"
                  render={({ field }) => (
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">
                    {t("publishLabel")}
                  </Label>
                  <FieldHint text={t("publishHint")} />
                </div>
              </div>

              {/* SEO — collapsible */}
              <div className="border border-border rounded-lg">
                <button
                  type="button"
                  className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium text-foreground"
                  onClick={() => setSeoOpen(!seoOpen)}
                >
                  <span>{tSeo("seoTitle")}</span>
                  <ChevronDown
                    size={16}
                    className={`text-muted-foreground transition-transform ${seoOpen ? "rotate-180" : ""}`}
                  />
                </button>
                {seoOpen && (
                  <div className="px-4 pb-4 space-y-4">
                    <p className="text-xs text-muted-foreground">
                      {tSeo("seoHint")}
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <Label className="text-sm font-medium">
                          {tSeo("metaTitleLabel")}
                        </Label>
                        <FieldHint text={tSeo("metaTitleHint")} />
                      </div>
                      <Input
                        {...register("metaTitle")}
                        placeholder={watch("title") || ""}
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <Label className="text-sm font-medium">
                          {tSeo("metaDescLabel")}
                        </Label>
                        <FieldHint text={tSeo("metaDescHint")} />
                      </div>
                      <Textarea
                        {...register("metaDescription")}
                        rows={2}
                        placeholder={watch("description") || ""}
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <Label className="text-sm font-medium">
                          {tSeo("ogImageUrlLabel")}
                        </Label>
                        <FieldHint text={tSeo("ogImageUrlHint")} />
                      </div>
                      <Input
                        {...register("ogImageUrl")}
                        placeholder="https://example.com/og-image.jpg"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="submit" disabled={isCreating} size="sm">
                  {isCreating ? t("creating") : t("create")}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => router.push("/pages")}
                >
                  {t("cancel")}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
