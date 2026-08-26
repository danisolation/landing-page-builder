'use client';

import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface SearchFilterProps {
  search: string;
  onSearchChange: (value: string) => void;
  status: string;
  onStatusChange: (value: string) => void;
  sortBy: string;
  onSortChange: (value: string) => void;
}

export default function SearchFilter({
  search,
  onSearchChange,
  status,
  onStatusChange,
  sortBy,
  onSortChange,
}: SearchFilterProps) {
  const t = useTranslations('searchFilter');

  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-6">
      <div className="flex-1">
        <Input
          placeholder={t('searchPlaceholder')}
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="h-10"
        />
      </div>

      <Select value={status} onValueChange={(v) => onStatusChange(v ?? "all")}>
        <SelectTrigger className="w-full sm:w-[160px] h-10">
          <SelectValue placeholder={t('status')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t('all')}</SelectItem>
          <SelectItem value="published">{t('published')}</SelectItem>
          <SelectItem value="draft">{t('draft')}</SelectItem>
        </SelectContent>
      </Select>

      <Select value={sortBy} onValueChange={(v) => onSortChange(v ?? "newest")}>
        <SelectTrigger className="w-full sm:w-[160px] h-10">
          <SelectValue placeholder={t('sort')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="newest">{t('newest')}</SelectItem>
          <SelectItem value="oldest">{t('oldest')}</SelectItem>
          <SelectItem value="name">{t('nameAZ')}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
