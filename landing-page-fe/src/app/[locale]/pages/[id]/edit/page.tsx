'use client';

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { usePage, usePages } from "@/hooks/usePages";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SkeletonForm } from "@/components/ui/loading";
import FieldHint from "@/components/ui/field-hint";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ImageUploadField from "@/components/ui/image-upload-field";
import VisualEditor from "@/components/editor/VisualEditor";
import FullPagePreview from "@/components/sections/FullPagePreview";

export default function EditPagePage() {
  const t = useTranslations("editPage");
  const tCommon = useTranslations("common");
  const tValidation = useTranslations("validation");

  const params = useParams();
  const pageId = params.id as string;

  const { data: page, isLoading } = usePage(pageId);
  const { updatePage, isUpdating, publishPage, isPublishing } = usePages();

  const [showSettings, setShowSettings] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const RESERVED_SLUGS = ['login', 'dashboard', 'pages', 'api', 'admin', 'sitemap', 'robots'];

  const editPageSchema = z.object({
    title: z
      .string()
      .min(1, tValidation("required", { field: t("titleLabel") })),
    slug: z
      .string()
      .min(1, tValidation("required", { field: t("slugLabel") }))
      .regex(/^[a-z0-9-]+$/, tValidation("slugFormat"))
      .refine((slug) => !RESERVED_SLUGS.includes(slug), {
        message: tValidation("slugReserved"),
      }),
    description: z.string().optional(),
    metaTitle: z.string().max(255).optional(),
    metaDescription: z.string().max(500).optional(),
    ogImageUrl: z.string().max(2048).optional(),
    keywords: z.string().optional(),
    canonicalUrl: z.string().optional(),
    isPublished: z.boolean().optional(),
  });

  type EditPageFormData = z.infer<typeof editPageSchema>;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<EditPageFormData>({
    resolver: zodResolver(editPageSchema),
    defaultValues: {
      title: "",
      slug: "",
      description: "",
      metaTitle: "",
      metaDescription: "",
      ogImageUrl: "",
      keywords: "",
      canonicalUrl: "",
      isPublished: false,
    },
  });

  useEffect(() => {
    if (page) {
      reset({
        title: page.title,
        slug: page.slug,
        description: page.description || "",
        metaTitle: page.metaTitle || "",
        metaDescription: page.metaDescription || "",
        ogImageUrl: page.ogImageUrl || "",
        keywords: page.keywords || "",
        canonicalUrl: page.canonicalUrl || "",
        isPublished: page.isPublished,
      });
    }
  }, [page, reset]);

  const onSubmit = (data: EditPageFormData) => {
    updatePage(
      { id: pageId, data },
      {
        onSuccess: () => toast.success(t("saveSuccess")),
        onError: (error: Error) =>
          toast.error(error.message || t("saveFailed")),
      },
    );
  };

  const handlePublish = async (isPublished: boolean) => {
    return new Promise<void>((resolve, reject) => {
      publishPage(
        { id: pageId, isPublished },
        {
          onSuccess: () => {
            toast.success(isPublished ? t("published") : t("unpublished"));
            resolve();
          },
          onError: (error: Error) => {
            toast.error(error.message || t("publishFailed"));
            reject(error);
          },
        },
      );
    });
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="w-full max-w-2xl space-y-8">
          <SkeletonForm />
        </div>
      </div>
    );
  }

  if (!page) {
    return (
      <div className="h-screen flex items-center justify-center text-muted-foreground">
        Page not found
      </div>
    );
  }

  return (
    <>
      {/* Single chrome owner: the VisualEditor toolbar */}
      <VisualEditor
        page={page}
        onPublish={handlePublish}
        isPublishing={isPublishing}
        onOpenSettings={() => setShowSettings(true)}
        onOpenPreview={() => setShowPreview(true)}
      />

      {/* Page settings dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="sm:max-w-[42rem] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("pageSettings")}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center">
                  <Label className="text-sm font-medium" htmlFor="settings-title">
                    {t("titleLabel")}
                  </Label>
                  <FieldHint text={t("titleHint")} />
                </div>
                <Input id="settings-title" {...register("title")} />
                {errors.title && (
                  <p className="text-xs text-destructive">
                    {errors.title.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <div className="flex items-center">
                  <Label className="text-sm font-medium" htmlFor="settings-slug">
                    {t("slugLabel")}
                  </Label>
                  <FieldHint text={t("slugHint")} />
                </div>
                <Input id="settings-slug" {...register("slug")} />
                {errors.slug && (
                  <p className="text-xs text-destructive">
                    {errors.slug.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center">
                <Label className="text-sm font-medium" htmlFor="settings-description">{t("descLabel")}</Label>
                <FieldHint text={t("descHint")} />
              </div>
              <Textarea id="settings-description" {...register("description")} rows={2} />
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isPublished"
                  {...register("isPublished")}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="isPublished" className="text-sm font-medium">
                  {t("publishLabel")}
                </Label>
              </div>
              <FieldHint text={t("publishHint")} />
            </div>

            {/* SEO Section */}
            <div className="border-t pt-5">
              <h3 className="text-lg font-medium mb-4">{t("seoTitle")}</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Label className="text-sm font-medium" htmlFor="settings-metaTitle">
                      {t("metaTitleLabel")}
                    </Label>
                  </div>
                  <Input id="settings-metaTitle" {...register("metaTitle")} placeholder={page?.title} />
                  <p className="text-xs text-muted-foreground text-right">
                    {t("charCount", {
                      count: (watch("metaTitle") || "").length,
                      max: 255,
                    })}
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Label className="text-sm font-medium" htmlFor="settings-metaDescription">
                      {t("metaDescLabel")}
                    </Label>
                  </div>
                  <Textarea
                    id="settings-metaDescription"
                    {...register("metaDescription")}
                    rows={2}
                    placeholder={page?.description || ""}
                  />
                  <p className="text-xs text-muted-foreground text-right">
                    {t("charCount", {
                      count: (watch("metaDescription") || "").length,
                      max: 500,
                    })}
                  </p>
                </div>
                <ImageUploadField
                  id="settings-ogImageUrl"
                  label={t("ogImageUrlLabel")}
                  value={watch("ogImageUrl") || ""}
                  onChange={(url) => setValue("ogImageUrl", url)}
                  placeholder="https://example.com/og-image.jpg"
                />
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Label className="text-sm font-medium" htmlFor="settings-keywords">
                      {t("keywordsLabel")}
                    </Label>
                  </div>
                  <Input id="settings-keywords" {...register("keywords")} placeholder="keyword1, keyword2" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Label className="text-sm font-medium" htmlFor="settings-canonicalUrl">
                      {t("canonicalUrlLabel")}
                    </Label>
                  </div>
                  <Input
                    id="settings-canonicalUrl"
                    {...register("canonicalUrl")}
                    placeholder="https://example.com/page"
                  />
                </div>
              </div>
            </div>

            <Button type="submit" disabled={isUpdating} className="w-full">
              {isUpdating ? tCommon("saving") : tCommon("save")}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Full-page preview — renders local section data, so drafts work too */}
      <FullPagePreview
        page={{ title: page.title, slug: page.slug, sections: page.sections }}
        globalStyle={page.globalStyle}
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
      />
    </>
  );
}
