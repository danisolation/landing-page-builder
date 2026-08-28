"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { usePages } from "@/hooks/usePages";
import { Button } from "@/components/ui/button";
import { SkeletonStats, SkeletonList } from "@/components/ui/loading";
import EmptyState from "@/components/ui/empty-state";
import { showConfirm } from "@/components/ui/confirm-dialog";
import StatsCards from "@/components/dashboard/StatsCards";
import SearchFilter from "@/components/dashboard/SearchFilter";
import PageCard from "@/components/dashboard/PageCard";
import { Link } from "@/i18n/navigation";

export default function DashboardPage() {
  const t = useTranslations("dashboard");
  const router = useRouter();
  const { pages, isLoading, deletePage } = usePages();

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  const filteredPages = useMemo(() => {
    if (!pages) return [];

    let result = [...pages];

    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(
        (page) =>
          page.title.toLowerCase().includes(searchLower) ||
          page.slug.toLowerCase().includes(searchLower)
      );
    }

    if (status === "published") {
      result = result.filter((page) => page.isPublished);
    } else if (status === "draft") {
      result = result.filter((page) => !page.isPublished);
    }

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
      t("deleteConfirmTitle"),
      t("deleteConfirmMsg", { title: pageTitle })
    );

    if (confirmed) {
      deletePage(pageId, {
        onSuccess: () => {
          toast.success(t("deleteSuccess"));
        },
        onError: (error: any) => {
          toast.error(error.message || t("deleteFailed"));
        },
      });
    }
  };

  if (isLoading) {
    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-foreground tracking-tight">{t("title")}</h1>
          <Button disabled size="sm">{t("createPage")}</Button>
        </div>
        <SkeletonStats />
        <SkeletonList count={3} />
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-foreground tracking-tight">{t("title")}</h1>
        <Link href="/pages/new">
          <Button size="sm">{t("createPage")}</Button>
        </Link>
      </div>

      {pages && pages.length > 0 && <StatsCards pages={pages} />}

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

      {!pages || pages.length === 0 ? (
        <EmptyState
          icon="📄"
          title={t("noPages")}
          description={t("noPagesDesc")}
          action={{
            label: t("createPage"),
            onClick: () => router.push("/pages/new"),
          }}
        />
      ) : filteredPages.length === 0 ? (
        <EmptyState
          icon="🔍"
          title={t("noResults")}
          description={t("noResultsDesc")}
        />
      ) : (
        <div className="grid gap-3">
          {filteredPages.map((page: any) => (
            <PageCard key={page.id} page={page} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
