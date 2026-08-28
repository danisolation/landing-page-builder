import { LoadingSpinner } from '@/components/ui/loading';

export default function LoginLoading() {
  return (
    <div className="flex items-center justify-center py-20">
      <LoadingSpinner size="lg" />
    </div>
  );
}
