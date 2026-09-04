"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
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
import { Eye, Settings, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import VisualEditor from "@/components/editor/VisualEditor";
import type { Page } from "@/types";

export default function EditPagePage() {
  const t = useTranslations("editPage");
  const tCommon = useTranslations("common");
  const tValidation = useTranslations("validation");

  const router = useRouter();
  const params = useParams();
  const pageId = params.id as string;

  const { data: page, isLoading } = usePage(pageId);
  const { updatePage, isUpdating, publishPage } = usePages();

  const [showSettings, setShowSettings] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const editPageSchema = z.object({
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

  const handleSave = async (data: Partial<Page>) => {
    return new Promise<void>((resolve, reject) => {
      updatePage(
        { id: pageId, data },
        {
          onSuccess: () => resolve(),
          onError: (error: Error) => reject(error),
        },
      );
    });
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
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            {t("title")}
          </h1>
          <Button variant="outline" disabled size="sm">
            {tCommon("back")}
          </Button>
        </div>
        <div className="space-y-8">
          <SkeletonForm />
        </div>
      </div>
    );
  }

  if (!page) {
    return <div>Page not found</div>;
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Top toolbar */}
      <div className="h-14 border-b bg-background flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/pages")}
          >
            {tCommon("back")}
          </Button>
          <div className="h-4 w-px bg-border" />
          <h1 className="font-medium truncate max-w-[200px]">{page.title}</h1>
          <span
            className={`text-xs px-2 py-0.5 rounded-full ${
              page.isPublished
                ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
            }`}
          >
            {page.isPublished ? tCommon("published") : tCommon("draft")}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Dialog open={showSettings} onOpenChange={setShowSettings}>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowSettings(true)}
            >
              <Settings size={16} className="mr-2" />
              {t("pageSettings")}
            </Button>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{t("pageSettings")}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <Label className="text-sm font-medium">
                        {t("titleLabel")}
                      </Label>
                      <FieldHint text={t("titleHint")} />
                    </div>
                    <Input {...register("title")} />
                    {errors.title && (
                      <p className="text-xs text-destructive">
                        {errors.title.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <Label className="text-sm font-medium">
                        {t("slugLabel")}
                      </Label>
                      <FieldHint text={t("slugHint")} />
                    </div>
                    <Input {...register("slug")} />
                    {errors.slug && (
                      <p className="text-xs text-destructive">
                        {errors.slug.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center">
                    <Label className="text-sm font-medium">{t("descLabel")}</Label>
                    <FieldHint text={t("descHint")} />
                  </div>
                  <Textarea {...register("description")} rows={2} />
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
                      <Label className="text-sm font-medium">
                        {t("metaTitleLabel")}
                      </Label>
                      <Input {...register("metaTitle")} placeholder={page?.title} />
                      <p className="text-xs text-muted-foreground text-right">
                        {t("charCount", {
                          count: (watch("metaTitle") || "").length,
                          max: 255,
                        })}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">
                        {t("metaDescLabel")}
                      </Label>
                      <Textarea
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
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">
                        {t("ogImageUrlLabel")}
                      </Label>
                      <Input
                        {...register("ogImageUrl")}
                        placeholder="https://example.com/og-image.jpg"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Keywords</Label>
                      <Input {...register("keywords")} placeholder="keyword1, keyword2" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Canonical URL</Label>
                      <Input
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

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPreview(true)}
          >
            <Eye size={16} className="mr-2" />
            {t("previewPage")}
          </Button>
        </div>
      </div>

      {/* Visual Editor */}
      <div className="flex-1">
        <VisualEditor
          page={page}
          onPublish={handlePublish}
        />
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center">
          <div className="bg-background w-full h-full max-w-6xl max-h-[90vh] rounded-lg overflow-hidden flex flex-col">
            <div className="h-12 border-b flex items-center justify-between px-4">
              <span className="font-medium">{t("previewPage")}</span>
              <Button variant="ghost" size="icon" onClick={() => setShowPreview(false)}>
                <X size={18} />
              </Button>
            </div>
            <iframe
              src={`/${page.slug}`}
              className="flex-1 w-full"
              title="Preview"
            />
          </div>
        </div>
      )}
    </div>
  );
}
