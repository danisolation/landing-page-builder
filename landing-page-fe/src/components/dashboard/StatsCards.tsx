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
      label: 'Tong pages',
      value: totalPages,
      icon: '📄',
      color: 'bg-blue-50 text-blue-600',
    },
    {
      label: 'Da xuat ban',
      value: publishedPages,
      icon: '✅',
      color: 'bg-emerald-50 text-emerald-600',
    },
    {
      label: 'Nhap',
      value: draftPages,
      icon: '📝',
      color: 'bg-amber-50 text-amber-600',
    },
    {
      label: 'Tong sections',
      value: totalSections,
      icon: '🧩',
      color: 'bg-purple-50 text-purple-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat) => (
        <Card key={stat.label}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`flex-shrink-0 w-11 h-11 flex items-center justify-center rounded-lg ${stat.color}`}>
                <span className="text-xl">{stat.icon}</span>
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 tabular-nums">{stat.value}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
