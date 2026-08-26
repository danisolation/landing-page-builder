"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import { usePage, usePages } from "@/hooks/usePages";
import { useSections } from "@/hooks/useSections";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import SectionEditor from "@/components/sections/SectionEditor";
import SectionPreview from "@/components/sections/SectionPreview";

export default function EditPagePage() {
  const router = useRouter();
  const params = useParams();
  const pageId = params.id as string;

  const { data: page, isLoading } = usePage(pageId);
  const { updatePage, isUpdating } = usePages();
  const { createSection, updateSection, deleteSection } = useSections(pageId);

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");

  // Section form
  const [showSectionForm, setShowSectionForm] = useState(false);
  const [editingSection, setEditingSection] = useState<any>(null);

  // Set form values when page loads
  useEffect(() => {
    if (page) {
      setTitle(page.title);
      setSlug(page.slug);
      setDescription(page.description || "");
    }
  }, [page]);

  const handleSavePage = (e: React.FormEvent) => {
    e.preventDefault();
    updatePage(
      { id: pageId, data: { title, slug, description } },
      {
        onSuccess: () => toast.success("Đã lưu thành công!"),
        onError: (error: any) => toast.error(error.message || "Lưu thất bại"),
      }
    );
  };

  const handleSaveSection = (data: { type: string; content: any; order: number }) => {
    if (editingSection) {
      updateSection(
        {
          sectionId: editingSection.id,
          data,
        },
        {
          onSuccess: () => {
            setShowSectionForm(false);
            setEditingSection(null);
            toast.success("Đã cập nhật section!");
          },
          onError: (error: any) => toast.error(error.message || "Cập nhật thất bại"),
        }
      );
    } else {
      createSection(data, {
        onSuccess: () => {
          setShowSectionForm(false);
          toast.success("Đã thêm section!");
        },
        onError: (error: any) => toast.error(error.message || "Thêm section thất bại"),
      });
    }
  };

  const handleEditSection = (section: any) => {
    setEditingSection(section);
    setShowSectionForm(true);
  };

  if (isLoading) return <div className="p-8">Đang tải...</div>;

  return (
    <div>
      <Breadcrumbs />

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Sửa page</h1>
        <Button variant="outline" onClick={() => router.push("/dashboard")}>
          ← Quay lại
        </Button>
      </div>

      <div className="max-w-4xl space-y-8">
        {/* Page form */}
        <Card>
          <CardHeader>
            <CardTitle>Thông tin page</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSavePage} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tiêu đề</Label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Slug</Label>
                  <Input
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Mô tả</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                />
              </div>

              <Button type="submit" disabled={isUpdating}>
                {isUpdating ? "Đang lưu..." : "Lưu thay đổi"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Sections */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Sections</CardTitle>
              <Button
                onClick={() => {
                  setEditingSection(null);
                  setShowSectionForm(true);
                }}
              >
                + Thêm section
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {page?.sections?.length === 0 ? (
              <p className="text-gray-500">Chưa có section nào</p>
            ) : (
              <div className="space-y-4">
                {page?.sections?.map((section: any) => (
                  <div
                    key={section.id}
                    className="border rounded-lg overflow-hidden"
                  >
                    <div className="flex items-center justify-between p-4 bg-gray-50">
                      <div className="flex items-center gap-3">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium">
                          {section.type}
                        </span>
                        <span className="text-gray-500 text-sm">
                          #{section.order}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditSection(section)}
                        >
                          Sửa
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            deleteSection(section.id, {
                              onSuccess: () => toast.success("Đã xóa section!"),
                              onError: (error: any) => toast.error(error.message || "Xóa thất bại"),
                            });
                          }}
                        >
                          Xóa
                        </Button>
                      </div>
                    </div>
                    <div className="p-4">
                      <SectionPreview
                        type={section.type}
                        content={section.content}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Section Editor */}
            {showSectionForm && (
              <div className="mt-6 border-t pt-6">
                <SectionEditor
                  section={editingSection}
                  onSave={handleSaveSection}
                  onCancel={() => {
                    setShowSectionForm(false);
                    setEditingSection(null);
                  }}
                  isLoading={false}
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
