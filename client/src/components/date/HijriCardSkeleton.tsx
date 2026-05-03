import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function HijriCardSkeleton() {
  return (
    <Card className="flex flex-col gap-4 p-5">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-10 w-28" />
        <Skeleton className="h-3 w-40" />
      </div>
      <div className="flex flex-col gap-2 border-t pt-3">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-3 w-28" />
      </div>
    </Card>
  );
}
