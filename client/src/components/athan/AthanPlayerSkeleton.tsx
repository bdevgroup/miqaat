import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function AthanPlayerSkeleton() {
  return (
    <Card className="flex flex-col gap-4 p-5">
      <Skeleton className="h-3 w-20" />
      <div className="flex flex-col gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 rounded-md border bg-card p-3">
            <Skeleton className="h-4 w-4 rounded-full" />
            <div className="flex flex-col gap-1">
              <Skeleton className="h-3 w-14" />
              <Skeleton className="h-2.5 w-24" />
            </div>
          </div>
        ))}
      </div>
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-10 w-full" />
    </Card>
  );
}
