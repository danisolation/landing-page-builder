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
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-semibold">{page.title}</h3>
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  page.isPublished
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {page.isPublished ? 'Đã xuất bản' : 'Nháp'}
              </span>
            </div>

            <p className="text-gray-500 text-sm mb-3">/{page.slug}</p>

            {page.description && (
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                {page.description}
              </p>
            )}

            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                🧩 {sectionCount} sections
              </span>

              {uniqueTypes.length > 0 && (
                <span className="flex items-center gap-1">
                  📋 {uniqueTypes.join(', ')}
                </span>
              )}

              <span className="flex items-center gap-1">
                📅 {new Date(page.createdAt).toLocaleDateString('vi-VN')}
              </span>
            </div>
          </div>

          <div className="flex gap-2 ml-4">
            <Link href={`/pages/${page.id}/edit`}>
              <Button variant="outline" size="sm">
                Sửa
              </Button>
            </Link>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onDelete(page.id, page.title)}
            >
              Xóa
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
