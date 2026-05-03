import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function QiblaCardSkeleton() {
  return (
    <Card className="flex flex-col items-center gap-3 p-5">
      <Skeleton className="h-3 w-16" />
      <Skeleton className="h-40 w-40 rounded-full" />
      <Skeleton className="h-6 w-20" />
      <Skeleton className="h-3 w-28" />
    </Card>
  );
}
