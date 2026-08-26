"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { usePages } from "@/hooks/usePages";
import { Button } from "@/components/ui/button";
import { LoadingPage } from "@/components/ui/loading";
import EmptyState from "@/components/ui/empty-state";
import { showConfirm } from "@/components/ui/confirm-dialog";
import StatsCards from "@/components/dashboard/StatsCards";
import SearchFilter from "@/components/dashboard/SearchFilter";
import PageCard from "@/components/dashboard/PageCard";

export default function DashboardPage() {
  const router = useRouter();
  const { pages, isLoading, deletePage } = usePages();

  // Search & Filter state
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  // Filtered & sorted pages
  const filteredPages = useMemo(() => {
    if (!pages) return [];

    let result = [...pages];

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(
        (page) =>
          page.title.toLowerCase().includes(searchLower) ||
          page.slug.toLowerCase().includes(searchLower)
      );
    }

    // Status filter
    if (status === "published") {
      result = result.filter((page) => page.isPublished);
    } else if (status === "draft") {
      result = result.filter((page) => !page.isPublished);
    }

    // Sort
    switch (sortBy) {
      case "newest":
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case "oldest":
        result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case "name":
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
    }

    return result;
  }, [pages, search, status, sortBy]);

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

      {/* Stats Cards */}
      {pages && pages.length > 0 && <StatsCards pages={pages} />}

      {/* Search & Filter */}
      {pages && pages.length > 0 && (
        <SearchFilter
          search={search}
          onSearchChange={setSearch}
          status={status}
          onStatusChange={setStatus}
          sortBy={sortBy}
          onSortChange={setSortBy}
        />
      )}

      {/* Page List */}
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
      ) : filteredPages.length === 0 ? (
        <EmptyState
          icon="🔍"
          title="Không tìm thấy page"
          description="Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc."
        />
      ) : (
        <div className="grid gap-4">
          {filteredPages.map((page: any) => (
            <PageCard key={page.id} page={page} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
