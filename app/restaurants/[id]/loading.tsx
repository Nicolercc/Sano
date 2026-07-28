import AppNav from "@/components/AppNav";

function Pulse({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded-md bg-ink/8 motion-reduce:animate-none ${className}`}
    />
  );
}

export default function RestaurantLoading() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-oat">
      <AppNav />
      <div
        role="status"
        aria-live="polite"
        className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-4 py-6 sm:px-6 lg:px-8"
      >
        <span className="sr-only">Loading restaurant profile…</span>

        <header className="rounded-lg border border-ink/10 bg-white p-5 shadow-sm">
          <Pulse className="h-3 w-40" />
          <Pulse className="mt-3 h-9 w-2/3 max-w-md" />
          <Pulse className="mt-2 h-4 w-1/2 max-w-sm" />
          <div className="mt-5 grid min-w-0 gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-ink/10 bg-oat p-4">
              <Pulse className="h-3 w-36" />
              <div className="mt-3 flex items-end gap-6">
                <Pulse className="h-14 w-14 rounded-2xl" />
                <Pulse className="h-8 w-10" />
              </div>
            </div>
            <div className="rounded-lg border border-ink/10 bg-oat p-4">
              <Pulse className="h-3 w-36" />
              <Pulse className="mt-3 h-10 w-24" />
            </div>
          </div>
        </header>

        <section className="rounded-lg border border-ink/10 bg-white p-5 shadow-sm">
          <Pulse className="h-6 w-40" />
          <Pulse className="mt-3 h-4 w-2/3" />
          <div className="mt-4 space-y-3">
            <Pulse className="h-4 w-full" />
            <Pulse className="h-4 w-11/12" />
            <Pulse className="h-4 w-4/5" />
          </div>
        </section>

        <div className="grid min-w-0 gap-5 lg:grid-cols-[360px_minmax(0,1fr)]">
          <div className="flex min-w-0 flex-col gap-5">
            <div className="rounded-lg border border-ink/10 bg-white p-5 shadow-sm">
              <Pulse className="h-3 w-32" />
              <Pulse className="mt-2 h-12 w-20" />
              <Pulse className="mt-3 h-4 w-full" />
            </div>
            <div className="rounded-lg border border-ink/10 bg-white p-5 shadow-sm">
              <Pulse className="h-5 w-32" />
              <Pulse className="mt-3 h-4 w-full" />
            </div>
          </div>

          <div className="flex min-w-0 flex-col gap-5">
            <div className="rounded-lg border border-ink/10 bg-white p-5 shadow-sm">
              <Pulse className="h-5 w-40" />
              <Pulse className="mt-4 h-44 w-full rounded-lg" />
            </div>
            <div className="rounded-lg border border-ink/10 bg-white p-5 shadow-sm">
              <Pulse className="h-5 w-36" />
              <Pulse className="mt-4 h-16 w-full" />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
