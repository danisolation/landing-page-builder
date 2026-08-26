"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { usePages } from "@/hooks/usePages";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Breadcrumbs from "@/components/layout/Breadcrumbs";

export default function NewPagePage() {
  const router = useRouter();
  const { createPage, isCreating } = usePages();
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createPage(
      { title, slug, description },
      {
        onSuccess: () => {
          toast.success("Tạo page thành công!");
          router.push("/dashboard");
        },
        onError: (error: any) => {
          toast.error(error.message || "Tạo page thất bại");
        },
      },
    );
  };

  return (
    <div>
      <Breadcrumbs />

      <h1 className="text-2xl font-bold mb-6">Tạo page mới</h1>

      <div className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Thông tin page</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Tiêu đề *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">Slug *</Label>
                <Input
                  id="slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="san-pham-moi"
                  required
                />
                <p className="text-sm text-gray-500">URL: /{slug || "..."}</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Mô tả</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="flex gap-4">
                <Button type="submit" disabled={isCreating}>
                  {isCreating ? "Đang tạo..." : "Tạo page"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/dashboard")}
                >
                  Hủy
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
