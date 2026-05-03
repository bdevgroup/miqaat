import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import { HijriCardSkeleton } from '@/components/date/HijriCardSkeleton';
import { NextPrayerBannerSkeleton } from '@/components/prayer/NextPrayerBannerSkeleton';
import { PrayerGridSkeleton } from '@/components/prayer/PrayerGridSkeleton';
import { AthanPlayerSkeleton } from '@/components/athan/AthanPlayerSkeleton';
import { RadioPlayerSkeleton } from '@/components/athan/RadioPlayerSkeleton';
import { QiblaCardSkeleton } from '@/components/qibla/QiblaCardSkeleton';

/**
 * Mounted before settings resolve so the window is never blank-white
 * between splash fade-out and first Shell render. Uses the Split layout
 * footprint (the most common default) — users on other layouts will see a
 * brief transition after settings arrive, but never an empty page.
 */
export function AppShellSkeleton() {
  return (
    <div className="flex h-full flex-col bg-background">
      {/* TopBar placeholder */}
      <header className="flex items-center justify-between gap-4 border-b px-6 py-3">
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-3 w-28" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-32 rounded-md" />
          <Skeleton className="h-8 w-8 rounded-md" />
          <Skeleton className="h-8 w-8 rounded-md" />
          <Skeleton className="h-8 w-8 rounded-md" />
          <Skeleton className="h-8 w-8 rounded-md" />
        </div>
      </header>

      {/* Split layout body */}
      <main className="flex flex-1 overflow-hidden">
        <aside className="hidden w-80 shrink-0 overflow-y-auto border-r bg-card/30 p-4 md:block">
          <div className="flex flex-col gap-3">
            <HijriCardSkeleton />
            <Card className="flex flex-col gap-2 p-4">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-28" />
            </Card>
            <RadioPlayerSkeleton />
          </div>
        </aside>

        <section className="flex-1 overflow-auto p-5">
          <div className="mx-auto flex max-w-5xl flex-col gap-4">
            <NextPrayerBannerSkeleton />
            <PrayerGridSkeleton />
          </div>
        </section>

        <aside className="hidden w-90 shrink-0 overflow-y-auto border-l bg-card/30 p-4 lg:block">
          <div className="flex flex-col gap-3">
            <AthanPlayerSkeleton />
            <QiblaCardSkeleton />
          </div>
        </aside>
      </main>

      {/* BottomBar placeholder */}
      <footer className="flex items-center justify-between gap-4 border-t bg-card/40 px-6 py-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-7 w-20 rounded-md" />
          <Skeleton className="h-7 w-24 rounded-md" />
          <Skeleton className="h-7 w-24 rounded-md" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-48 rounded-md" />
          <Skeleton className="h-7 w-24 rounded-md" />
        </div>
      </footer>
    </div>
  );
}
