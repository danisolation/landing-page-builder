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
          toast.success("Tao page thanh cong!");
          router.push("/dashboard");
        },
        onError: (error: any) => {
          toast.error(error.message || "Tao page that bai");
        },
      },
    );
  };

  return (
    <div>
      <Breadcrumbs />

      <h1 className="text-2xl font-bold text-gray-900 tracking-tight mb-6">Tao page moi</h1>

      <div className="max-w-2xl">
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Thong tin page</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-medium">Tieu de *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug" className="text-sm font-medium">Slug *</Label>
                <Input
                  id="slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="san-pham-moi"
                  required
                />
                <p className="text-xs text-gray-400 font-mono">URL: /{slug || "..."}</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium">Mo ta</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="submit" disabled={isCreating} size="sm">
                  {isCreating ? "Dang tao..." : "Tao page"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => router.push("/dashboard")}
                >
                  Huy
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
