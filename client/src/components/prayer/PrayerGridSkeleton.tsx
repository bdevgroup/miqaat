import { Skeleton } from '@/components/ui/skeleton';

/**
 * Matches PrayerGrid's 6-column grid footprint so content swap-in
 * doesn't shift the layout.
 */
export function PrayerGridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="flex flex-col items-center gap-2 rounded-lg border bg-card p-5"
        >
          <Skeleton className="h-6 w-6 rounded-full" />
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-7 w-16" />
        </div>
      ))}
    </div>
  );
}
