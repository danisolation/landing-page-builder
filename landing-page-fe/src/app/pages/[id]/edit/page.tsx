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
import { SkeletonForm, SkeletonList } from "@/components/ui/loading";
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

  const [showSectionForm, setShowSectionForm] = useState(false);
  const [editingSection, setEditingSection] = useState<any>(null);

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
        onSuccess: () => toast.success("Da luu thanh cong!"),
        onError: (error: any) => toast.error(error.message || "Luu that bai"),
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
            toast.success("Da cap nhat section!");
          },
          onError: (error: any) => toast.error(error.message || "Cap nhat that bai"),
        }
      );
    } else {
      createSection(data, {
        onSuccess: () => {
          setShowSectionForm(false);
          toast.success("Da them section!");
        },
        onError: (error: any) => toast.error(error.message || "Them section that bai"),
      });
    }
  };

  const handleEditSection = (section: any) => {
    setEditingSection(section);
    setShowSectionForm(true);
  };

  if (isLoading) {
    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Sua page</h1>
          <Button variant="outline" disabled size="sm">Quay lai</Button>
        </div>
        <div className="max-w-4xl space-y-8">
          <SkeletonForm />
          <SkeletonList count={2} />
        </div>
      </div>
    );
  }

  return (
    <div>
      <Breadcrumbs />

      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Sua page</h1>
        <Button variant="outline" size="sm" onClick={() => router.push("/dashboard")}>
          Quay lai
        </Button>
      </div>

      <div className="max-w-4xl space-y-6">
        {/* Page form */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Thong tin page</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSavePage} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Tieu de</Label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Slug</Label>
                  <Input
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Mo ta</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                />
              </div>

              <Button type="submit" disabled={isUpdating} size="sm">
                {isUpdating ? "Dang luu..." : "Luu thay doi"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Sections */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
              <CardTitle className="text-lg">Sections</CardTitle>
              <Button
                size="sm"
                onClick={() => {
                  setEditingSection(null);
                  setShowSectionForm(true);
                }}
              >
                + Them section
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {page?.sections?.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">Chua co section nao</p>
            ) : (
              <div className="space-y-3">
                {page?.sections?.map((section: any) => (
                  <div
                    key={section.id}
                    className="border border-gray-200 rounded-lg overflow-hidden bg-white"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-gray-50 border-b border-gray-200">
                      <div className="flex items-center gap-3">
                        <span className="inline-flex items-center bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md text-xs font-medium ring-1 ring-blue-600/20">
                          {section.type}
                        </span>
                        <span className="text-xs text-gray-400 font-mono">
                          #{section.order}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditSection(section)}
                        >
                          Sua
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            deleteSection(section.id, {
                              onSuccess: () => toast.success("Da xoa section!"),
                              onError: (error: any) => toast.error(error.message || "Xoa that bai"),
                            });
                          }}
                        >
                          Xoa
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

            {showSectionForm && (
              <div className="mt-6 pt-6 border-t border-gray-200">
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
