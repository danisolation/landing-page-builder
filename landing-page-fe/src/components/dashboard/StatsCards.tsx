'use client';

import { Card, CardContent } from '@/components/ui/card';

interface StatsCardsProps {
  pages: any[];
}

export default function StatsCards({ pages }: StatsCardsProps) {
  const totalPages = pages.length;
  const publishedPages = pages.filter((p) => p.isPublished).length;
  const draftPages = totalPages - publishedPages;
  const totalSections = pages.reduce((acc, p) => acc + (p.sections?.length || 0), 0);

  const stats = [
    {
      label: 'Tổng pages',
      value: totalPages,
      icon: '📄',
      color: 'bg-blue-50 text-blue-700',
    },
    {
      label: 'Đã xuất bản',
      value: publishedPages,
      icon: '✅',
      color: 'bg-green-50 text-green-700',
    },
    {
      label: 'Nháp',
      value: draftPages,
      icon: '📝',
      color: 'bg-yellow-50 text-yellow-700',
    },
    {
      label: 'Tổng sections',
      value: totalSections,
      icon: '🧩',
      color: 'bg-purple-50 text-purple-700',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat) => (
        <Card key={stat.label}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <span className="text-2xl">{stat.icon}</span>
              </div>
              <div>
                <p className="text-sm text-gray-600">{stat.label}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
