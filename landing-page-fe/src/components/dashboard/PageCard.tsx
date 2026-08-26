'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface PageCardProps {
  page: any;
  onDelete: (id: string, title: string) => void;
}

export default function PageCard({ page, onDelete }: PageCardProps) {
  const sectionCount = page.sections?.length || 0;
  const sectionTypes = page.sections?.map((s: any) => s.type) || [];
  const uniqueTypes = [...new Set(sectionTypes)];

  return (
    <Card className="hover:shadow-md transition-all duration-200">
      <CardContent className="p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <h3 className="text-base font-semibold text-gray-900 truncate">{page.title}</h3>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                  page.isPublished
                    ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20'
                    : 'bg-gray-100 text-gray-600 ring-1 ring-gray-500/20'
                }`}
              >
                {page.isPublished ? 'Da xuat ban' : 'Nhap'}
              </span>
            </div>

            <p className="text-sm text-gray-400 font-mono mb-2">/{page.slug}</p>

            {page.description && (
              <p className="text-sm text-gray-500 mb-3 line-clamp-2 leading-relaxed">
                {page.description}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
              <span className="inline-flex items-center gap-1">
                🧩 {sectionCount} sections
              </span>

              {uniqueTypes.length > 0 && (
                <span className="inline-flex items-center gap-1">
                  📋 {uniqueTypes.join(', ')}
                </span>
              )}

              <span className="inline-flex items-center gap-1">
                📅 {new Date(page.createdAt).toLocaleDateString('vi-VN')}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:ml-4 sm:flex-shrink-0">
            <Link href={`/pages/${page.id}/edit`}>
              <Button variant="outline" size="sm">
                Sua
              </Button>
            </Link>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onDelete(page.id, page.title)}
            >
              Xoa
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
