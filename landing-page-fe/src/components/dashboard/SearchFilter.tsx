'use client';

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
  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-6">
      <div className="flex-1">
        <Input
          placeholder="Tim kiem pages..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="h-10"
        />
      </div>

      <Select value={status} onValueChange={(v) => onStatusChange(v ?? "all")}>
        <SelectTrigger className="w-full sm:w-[160px] h-10">
          <SelectValue placeholder="Trang thai" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tat ca</SelectItem>
          <SelectItem value="published">Da xuat ban</SelectItem>
          <SelectItem value="draft">Nhap</SelectItem>
        </SelectContent>
      </Select>

      <Select value={sortBy} onValueChange={(v) => onSortChange(v ?? "newest")}>
        <SelectTrigger className="w-full sm:w-[160px] h-10">
          <SelectValue placeholder="Sap xep" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="newest">Moi nhat</SelectItem>
          <SelectItem value="oldest">Cu nhat</SelectItem>
          <SelectItem value="name">Ten A-Z</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
