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

export interface SearchFilterProps {
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

  const statusOptions = [
    { value: 'all', label: t('all') },
    { value: 'published', label: t('published') },
    { value: 'draft', label: t('draft') },
  ];

  const sortOptions = [
    { value: 'newest', label: t('newest') },
    { value: 'oldest', label: t('oldest') },
    { value: 'name', label: t('nameAZ') },
  ];

  const selectedStatusLabel = statusOptions.find(opt => opt.value === status)?.label || t('all');
  const selectedSortLabel = sortOptions.find(opt => opt.value === sortBy)?.label || t('newest');

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
        <SelectTrigger className="w-[160px] h-10">
          <SelectValue>{selectedStatusLabel}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {statusOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={sortBy} onValueChange={(v) => onSortChange(v ?? "newest")}>
        <SelectTrigger className="w-[160px] h-10">
          <SelectValue>{selectedSortLabel}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {sortOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
