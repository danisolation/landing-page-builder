"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { usePages } from "@/hooks/usePages";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Breadcrumbs from "@/components/layout/Breadcrumbs";

export default function NewPagePage() {
  const t = useTranslations("newPage");
  const tValidation = useTranslations("validation");
  const router = useRouter();
  const { createPage, isCreating } = usePages();

  const newPageSchema = z.object({
    title: z.string().min(1, tValidation("required", { field: t("titleLabel") })),
    slug: z
      .string()
      .min(1, tValidation("required", { field: t("slugLabel") }))
      .regex(/^[a-z0-9-]+$/, tValidation("slugFormat")),
    description: z.string().optional(),
  });

  type NewPageFormData = z.infer<typeof newPageSchema>;

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<NewPageFormData>({
    resolver: zodResolver(newPageSchema),
    defaultValues: {
      title: "",
      slug: "",
      description: "",
    },
  });

  const slugValue = watch("slug");

  const onSubmit = (data: NewPageFormData) => {
    createPage(data, {
      onSuccess: () => {
        toast.success(t("success"));
        router.push("/pages");
      },
      onError: (error: any) => {
        toast.error(error.message || t("failed"));
      },
    });
  };

  return (
    <div>
      <Breadcrumbs />

      <h1 className="text-2xl font-bold text-foreground tracking-tight mb-6">{t("title")}</h1>

      <div>
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">{t("pageInfo")}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-medium">{t("titleLabel")}</Label>
                <Input
                  id="title"
                  {...register("title")}
                />
                {errors.title && (
                  <p className="text-xs text-destructive">{errors.title.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug" className="text-sm font-medium">{t("slugLabel")}</Label>
                <Input
                  id="slug"
                  {...register("slug")}
                  placeholder="san-pham-moi"
                />
                {errors.slug && (
                  <p className="text-xs text-destructive">{errors.slug.message}</p>
                )}
                <p className="text-xs text-muted-foreground font-mono">URL: /{slugValue || "..."}</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium">{t("descLabel")}</Label>
                <Textarea
                  id="description"
                  {...register("description")}
                  rows={3}
                />
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
