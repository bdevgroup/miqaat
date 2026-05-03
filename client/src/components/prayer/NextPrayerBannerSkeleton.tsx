import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

/** Matches NextPrayerBanner's padding and font-size so swap is invisible. */
export function NextPrayerBannerSkeleton() {
  return (
    <Card className="relative overflow-hidden p-8">
      <div className="flex flex-col gap-3">
        <div className="flex items-baseline gap-3">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-4 w-14 rounded-full" />
        </div>
        <div className="flex items-end gap-6">
          <Skeleton className="h-16 w-48 md:h-20 md:w-56" />
          <Skeleton className="h-5 w-20" />
        </div>
      </div>
    </Card>
  );
}
