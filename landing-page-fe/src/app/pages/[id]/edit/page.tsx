"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  getPage,
  updatePage,
  createSection,
  updateSection,
  deleteSection,
} from "@/lib/api";

export default function EditPagePage() {
  const router = useRouter();
  const params = useParams();
  const pageId = params.id as string;

  const [page, setPage] = useState<any>(null);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Section form
  const [showSectionForm, setShowSectionForm] = useState(false);
  const [sectionType, setSectionType] = useState("hero");
  const [sectionContent, setSectionContent] = useState("{}");
  const [sectionOrder, setSectionOrder] = useState(0);
  const [editingSection, setEditingSection] = useState<any>(null);

  useEffect(() => {
    loadPage();
  }, [pageId]);

  const loadPage = async () => {
    try {
      const data = await getPage(pageId);
      setPage(data);
      setTitle(data.title);
      setSlug(data.slug);
      setDescription(data.description || "");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSavePage = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      await updatePage(pageId, { title, slug, description });
      alert("Đã lưu!");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSection = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const content = JSON.parse(sectionContent);

      if (editingSection) {
        await updateSection(pageId, editingSection.id, {
          type: sectionType,
          content,
          order: sectionOrder,
        });
      } else {
        await createSection(pageId, {
          type: sectionType,
          content,
          order: sectionOrder,
        });
      }

      setShowSectionForm(false);
      setEditingSection(null);
      loadPage();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleEditSection = (section: any) => {
    setEditingSection(section);
    setSectionType(section.type);
    setSectionContent(JSON.stringify(section.content, null, 2));
    setSectionOrder(section.order);
    setShowSectionForm(true);
  };

  const handleDeleteSection = async (sectionId: string) => {
    if (!confirm("Bạn có chắc muốn xóa section này?")) return;
    try {
      await deleteSection(pageId, sectionId);
      loadPage();
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading) return <div className="p-8">Đang tải...</div>;

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Sửa page</h1>
          <button
            onClick={() => router.push("/dashboard")}
            className="text-gray-600 hover:text-gray-800"
          >
            ← Quay lại
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Page form */}
        <form
          onSubmit={handleSavePage}
          className="bg-white p-6 rounded-lg shadow mb-8"
        >
          <h2 className="text-lg font-semibold mb-4">Thông tin page</h2>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 mb-2">Tiêu đề</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-2">Slug</label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Mô tả</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
              rows={2}
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            {saving ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        </form>

        {/* Sections */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Sections</h2>
            <button
              onClick={() => {
                setEditingSection(null);
                setSectionType("hero");
                setSectionContent("{}");
                setSectionOrder(page?.sections?.length || 0);
                setShowSectionForm(true);
              }}
              className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
            >
              + Thêm section
            </button>
          </div>

          {/* Section list */}
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
                    <span className="text-gray-500 ml-2">#{section.order}</span>
                    <pre className="mt-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                      {JSON.stringify(section.content, null, 2)}
                    </pre>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditSection(section)}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDeleteSection(section.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Xóa
                    </button>
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
              <form onSubmit={handleSaveSection}>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-gray-700 mb-2">
                      Loại section
                    </label>
                    <select
                      value={sectionType}
                      onChange={(e) => setSectionType(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg"
                    >
                      <option value="hero">Hero</option>
                      <option value="features">Features</option>
                      <option value="cta">CTA</option>
                      <option value="testimonials">Testimonials</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2">Thứ tự</label>
                    <input
                      type="number"
                      value={sectionOrder}
                      onChange={(e) => setSectionOrder(Number(e.target.value))}
                      className="w-full px-3 py-2 border rounded-lg"
                      min={0}
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">
                    Content (JSON)
                  </label>
                  <textarea
                    value={sectionContent}
                    onChange={(e) => setSectionContent(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg font-mono text-sm"
                    rows={6}
                  />
                </div>

                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
                  >
                    {editingSection ? "Cập nhật" : "Thêm"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowSectionForm(false);
                      setEditingSection(null);
                    }}
                    className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400"
                  >
                    Hủy
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
