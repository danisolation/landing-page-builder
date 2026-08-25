"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getPages, deletePage, getProfile } from "@/lib/api";

export default function DashboardPage() {
  const router = useRouter();
  const [pages, setPages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    loadData();
  }, []);

  const loadData = async () => {
    try {
      const data = await getPages();
      setPages(data);
    } catch (err) {
      localStorage.removeItem("token");
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc muốn xóa?")) return;

    try {
      await deletePage(id);
      setPages(pages.filter((p) => p.id !== id));
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  if (loading) return <div className="p-8">Đang tải...</div>;

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <div>
            <Link
              href="/pages/new"
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 mr-4"
            >
              + Tạo page mới
            </Link>
            <button
              onClick={handleLogout}
              className="text-gray-600 hover:text-gray-800"
            >
              Đăng xuất
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {pages.length === 0 ? (
          <div className="text-center text-gray-500">
            Chưa có page nào. Tạo page mới để bắt đầu!
          </div>
        ) : (
          <div className="grid gap-4">
            {pages.map((page) => (
              <div
                key={page.id}
                className="bg-white p-4 rounded-lg shadow flex justify-between items-center"
              >
                <div>
                  <h2 className="text-lg font-semibold">{page.title}</h2>
                  <p className="text-gray-500">/{page.slug}</p>
                  <span
                    className={`text-sm ${
                      page.isPublished ? "text-green-600" : "text-gray-400"
                    }`}
                  >
                    {page.isPublished ? "Đã xuất bản" : "Nháp"}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/pages/${page.id}/edit`}
                    className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                  >
                    Sửa
                  </Link>
                  <button
                    onClick={() => handleDelete(page.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                  >
                    Xóa
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
