'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { usePages } from '@/hooks/usePages';
import { Button } from '@/components/ui/button';
import { SkeletonList } from '@/components/ui/loading';
import EmptyState from '@/components/ui/empty-state';
import { showConfirm } from '@/components/ui/confirm-dialog';
import SearchFilter from '@/components/dashboard/SearchFilter';
import PageCard from '@/components/dashboard/PageCard';
import PageTable from '@/components/dashboard/PageTable';
import { Link } from '@/i18n/navigation';

type ViewMode = 'card' | 'table';

export default function PagesListPage() {
  const t = useTranslations('pages');
  const router = useRouter();
  const { pages, isLoading, deletePage } = usePages();

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState<ViewMode>('table');

  // Load view preference from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('pages-view-mode') as ViewMode | null;
    if (saved === 'card' || saved === 'table') {
      setViewMode(saved);
    }
  }, []);

  const handleViewChange = (mode: ViewMode) => {
    setViewMode(mode);
    localStorage.setItem('pages-view-mode', mode);
  };

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

    if (status === 'published') {
      result = result.filter((page) => page.isPublished);
    } else if (status === 'draft') {
      result = result.filter((page) => !page.isPublished);
    }

    switch (sortBy) {
      case 'newest':
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'oldest':
        result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case 'name':
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
    }

    return result;
  }, [pages, search, status, sortBy]);

  const handleDelete = async (pageId: string, pageTitle: string) => {
    const confirmed = await showConfirm(
      t('deleteConfirmTitle'),
      t('deleteConfirmMsg', { title: pageTitle })
    );

    if (confirmed) {
      deletePage(pageId, {
        onSuccess: () => {
          toast.success(t('deleteSuccess'));
        },
        onError: (error: any) => {
          toast.error(error.message || t('deleteFailed'));
        },
      });
    }
  };

  if (isLoading) {
    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-foreground tracking-tight">{t('title')}</h1>
          <Button disabled size="sm">{t('createPage')}</Button>
        </div>
        <SkeletonList count={3} />
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-foreground tracking-tight">{t('title')}</h1>
        <Link href="/pages/new">
          <Button size="sm">{t('createPage')}</Button>
        </Link>
      </div>

      {pages && pages.length > 0 && (
        <div className="flex items-center gap-3 mb-4">
          <SearchFilter
            search={search}
            onSearchChange={setSearch}
            status={status}
            onStatusChange={setStatus}
            sortBy={sortBy}
            onSortChange={setSortBy}
          />
          <div className="flex border border-border rounded-lg overflow-hidden ml-auto">
            <button
              onClick={() => handleViewChange('card')}
              className={`p-2 transition-colors ${
                viewMode === 'card'
                  ? 'bg-muted text-foreground'
                  : 'text-muted-foreground hover:bg-muted/50'
              }`}
              aria-label="Card view"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
              </svg>
            </button>
            <button
              onClick={() => handleViewChange('table')}
              className={`p-2 transition-colors ${
                viewMode === 'table'
                  ? 'bg-muted text-foreground'
                  : 'text-muted-foreground hover:bg-muted/50'
              }`}
              aria-label="Table view"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="8" y1="6" x2="21" y2="6" />
                <line x1="8" y1="12" x2="21" y2="12" />
                <line x1="8" y1="18" x2="21" y2="18" />
                <line x1="3" y1="6" x2="3.01" y2="6" />
                <line x1="3" y1="12" x2="3.01" y2="12" />
                <line x1="3" y1="18" x2="3.01" y2="18" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {!pages || pages.length === 0 ? (
        <EmptyState
          icon="📄"
          title={t('noPages')}
          description={t('noPagesDesc')}
          action={{
            label: t('createPage'),
            onClick: () => router.push('/pages/new'),
          }}
        />
      ) : filteredPages.length === 0 ? (
        <EmptyState
          icon="🔍"
          title={t('noResults')}
          description={t('noResultsDesc')}
        />
      ) : viewMode === 'card' ? (
        <div className="grid gap-3">
          {filteredPages.map((page: any) => (
            <PageCard key={page.id} page={page} onDelete={handleDelete} />
          ))}
        </div>
      ) : (
        <PageTable pages={filteredPages} onDelete={handleDelete} />
      )}
    </div>
  );
}
