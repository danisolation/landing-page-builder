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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  const [sectionType, setSectionType] = useState("hero");
  const [sectionContent, setSectionContent] = useState("{}");
  const [sectionOrder, setSectionOrder] = useState(0);
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

  const handleSaveSection = (e: React.FormEvent) => {
    e.preventDefault();
    const content = JSON.parse(sectionContent);

    if (editingSection) {
      updateSection(
        {
          sectionId: editingSection.id,
          data: { type: sectionType, content, order: sectionOrder },
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
      createSection(
        { type: sectionType, content, order: sectionOrder },
        {
          onSuccess: () => {
            setShowSectionForm(false);
            toast.success("Đã thêm section!");
          },
          onError: (error: any) => toast.error(error.message || "Thêm section thất bại"),
        }
      );
    }
  };

  const handleEditSection = (section: any) => {
    setEditingSection(section);
    setSectionType(section.type);
    setSectionContent(JSON.stringify(section.content, null, 2));
    setSectionOrder(section.order);
    setShowSectionForm(true);
  };

  if (isLoading) return <div className="p-8">Đang tải...</div>;

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Sửa page</h1>
          <Button variant="outline" onClick={() => router.push("/dashboard")}>
            ← Quay lại
          </Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
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
                  setSectionType("hero");
                  setSectionContent("{}");
                  setSectionOrder(page?.sections?.length || 0);
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
                    className="border rounded-lg p-4 flex justify-between items-start"
                  >
                    <div>
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                        {section.type}
                      </span>
                      <span className="text-gray-500 ml-2">
                        #{section.order}
                      </span>
                      <pre className="mt-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                        {JSON.stringify(section.content, null, 2)}
                      </pre>
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
                ))}
              </div>
            )}

            {/* Section form */}
            {showSectionForm && (
              <div className="mt-6 border-t pt-6">
                <h3 className="font-semibold mb-4">
                  {editingSection ? "Sửa section" : "Thêm section mới"}
                </h3>
                <form onSubmit={handleSaveSection} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Loại section</Label>
                      <Select
                        value={sectionType}
                        onValueChange={setSectionType}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hero">Hero</SelectItem>
                          <SelectItem value="features">Features</SelectItem>
                          <SelectItem value="cta">CTA</SelectItem>
                          <SelectItem value="testimonials">
                            Testimonials
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Thứ tự</Label>
                      <Input
                        type="number"
                        value={sectionOrder}
                        onChange={(e) =>
                          setSectionOrder(Number(e.target.value))
                        }
                        min={0}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Content (JSON)</Label>
                    <Textarea
                      value={sectionContent}
                      onChange={(e) => setSectionContent(e.target.value)}
                      rows={6}
                      className="font-mono text-sm"
                    />
                  </div>

                  <div className="flex gap-4">
                    <Button type="submit">
                      {editingSection ? "Cập nhật" : "Thêm"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowSectionForm(false);
                        setEditingSection(null);
                      }}
                    >
                      Hủy
                    </Button>
                  </div>
                </form>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
