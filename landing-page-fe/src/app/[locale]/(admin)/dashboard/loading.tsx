import { SkeletonStats, SkeletonList } from '@/components/ui/loading';

export default function DashboardLoading() {
  return (
    <div>
      <SkeletonStats />
      <SkeletonList count={3} />
    </div>
  );
}
