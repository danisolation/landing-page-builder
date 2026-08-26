"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { usePages } from "@/hooks/usePages";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LoadingPage } from "@/components/ui/loading";
import EmptyState from "@/components/ui/empty-state";
import { showConfirm } from "@/components/ui/confirm-dialog";

export default function DashboardPage() {
  const router = useRouter();
  const { pages, isLoading, deletePage } = usePages();

  const handleDelete = async (pageId: string, pageTitle: string) => {
    const confirmed = await showConfirm(
      "Xóa page?",
      `Bạn có chắc muốn xóa "${pageTitle}"? Hành động này không thể hoàn tác.`
    );

    if (confirmed) {
      deletePage(pageId, {
        onSuccess: () => {
          toast.success("Đã xóa page thành công!");
        },
        onError: (error: any) => {
          toast.error(error.message || "Xóa page thất bại");
        },
      });
    }
  };

  if (isLoading) {
    return <LoadingPage />;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Link href="/pages/new">
          <Button>+ Tạo page mới</Button>
        </Link>
      </div>

      {!pages || pages.length === 0 ? (
        <EmptyState
          icon="📄"
          title="Chưa có page nào"
          description="Tạo page đầu tiên để bắt đầu xây dựng landing page của bạn."
          action={{
            label: "+ Tạo page mới",
            onClick: () => router.push("/pages/new"),
          }}
        />
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
                    onClick={() => handleDelete(page.id, page.title)}
                  >
                    Xóa
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
