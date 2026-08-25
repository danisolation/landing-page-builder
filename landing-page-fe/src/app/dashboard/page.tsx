"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { usePages } from "@/hooks/usePages";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function DashboardPage() {
  const router = useRouter();
  const { getToken, logout } = useAuth();
  const { pages, isLoading, deletePage } = usePages();

  useEffect(() => {
    if (!getToken()) {
      router.push("/login");
    }
  }, []);

  if (isLoading) {
    return <div className="p-8">Đang tải...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <div className="flex gap-4">
            <Link href="/pages/new">
              <Button>+ Tạo page mới</Button>
            </Link>
            <Button variant="outline" onClick={logout}>
              Đăng xuất
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {!pages || pages.length === 0 ? (
          <div className="text-center text-gray-500 py-12">
            Chưa có page nào. Tạo page mới để bắt đầu!
          </div>
        ) : (
          <div className="grid gap-4">
            {pages.map((page: any) => (
              <Card key={page.id}>
                <CardContent className="p-4 flex justify-between items-center">
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
                    <Link href={`/pages/${page.id}/edit`}>
                      <Button variant="outline" size="sm">
                        Sửa
                      </Button>
                    </Link>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        if (confirm("Bạn có chắc muốn xóa?")) {
                          deletePage(page.id);
                        }
                      }}
                    >
                      Xóa
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
