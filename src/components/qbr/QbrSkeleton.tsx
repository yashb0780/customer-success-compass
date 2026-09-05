import { Skeleton } from "@/components/ui/skeleton";

/**
 * Placeholder shown while the account data is being fetched.
 *
 * It deliberately mirrors the real page's structure — same max width, same
 * section padding, same card grids — so nothing jumps when the content
 * arrives. A QBR is presented live to a customer, and a blank screen reads as
 * broken in a way a skeleton does not.
 */

/** One "eyebrow + heading" pair, matching each section's header block. */
function SectionHeading() {
  return (
    <div className="mb-10 space-y-2">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="h-7 w-56" />
    </div>
  );
}

/** A row of cards inside the bordered grid the real sections use. */
function CardGrid({ count, columns }: { count: number; columns: string }) {
  return (
    <div className={`grid gap-px overflow-hidden rounded-lg border bg-border ${columns}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-start gap-3 bg-card p-5">
          <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function QbrSkeleton() {
  return (
    <div className="min-h-screen bg-background" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading this quarterly business review…</span>

      {/* Sticky nav */}
      <nav className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center gap-2 overflow-hidden px-4 py-2">
          {[14, 16, 12, 24, 20, 22, 20].map((w, i) => (
            <Skeleton key={i} className="h-6 shrink-0 rounded-md" style={{ width: `${w * 4}px` }} />
          ))}
        </div>
      </nav>

      {/* Cover */}
      <section className="flex min-h-[80vh] flex-col items-center justify-center px-6 py-20">
        <div className="flex flex-col items-center space-y-8">
          <Skeleton className="h-16 w-16 rounded-xl" />
          <div className="flex flex-col items-center space-y-3">
            <Skeleton className="h-12 w-[min(28rem,80vw)]" />
            <Skeleton className="h-4 w-56" />
          </div>
          <Skeleton className="h-10 w-32 rounded-lg" />
        </div>
      </section>

      {/* Agenda */}
      <section className="section-alt px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <SectionHeading />
          <CardGrid count={5} columns="sm:grid-cols-2 lg:grid-cols-3" />
        </div>
      </section>

      {/* Team */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <SectionHeading />
          <CardGrid count={3} columns="sm:grid-cols-2 lg:grid-cols-3" />
        </div>
      </section>

      {/* Current state: two stat cards, then a breakdown panel */}
      <section className="section-alt px-6 py-16">
        <div className="mx-auto max-w-5xl space-y-12">
          <SectionHeading />
          <div className="space-y-6">
            <Skeleton className="h-6 w-40" />
            <div className="grid gap-4 sm:grid-cols-2">
              {[0, 1].map((i) => (
                <div key={i} className="flex items-center gap-4 rounded-lg border bg-card p-5">
                  <Skeleton className="h-10 w-10 shrink-0 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-3 w-28" />
                    <Skeleton className="h-7 w-16" />
                  </div>
                </div>
              ))}
            </div>
            <div className="rounded-lg border bg-card">
              <div className="border-b px-5 py-3">
                <Skeleton className="h-4 w-48" />
              </div>
              <div className="grid grid-cols-2 divide-x divide-y sm:grid-cols-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="space-y-2 px-4 py-3">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-14" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
