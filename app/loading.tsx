import AppNav from "@/components/AppNav";

function Pulse({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded-md motion-reduce:animate-none ${className}`}
    />
  );
}

export default function HomeLoading() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-oat text-ink">
      <AppNav active="home" />
      <div
        role="status"
        aria-live="polite"
        className="relative isolate overflow-hidden bg-[#1e2a38] text-white"
        style={{
          backgroundImage:
            "radial-gradient(circle at 18% 16%, rgba(37,99,201,0.22), transparent 28%), radial-gradient(circle at 82% 12%, rgba(111,163,224,0.15), transparent 25%), linear-gradient(135deg, #1e2a38 0%, #2c3e50 100%)"
        }}
      >
        <span className="sr-only">Loading Sano…</span>
        <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 pb-14 pt-10 sm:px-6 lg:grid-cols-[minmax(0,1.02fr)_minmax(24rem,0.98fr)] lg:px-8 lg:pb-20 lg:pt-16">
          <div className="min-w-0">
            <Pulse className="h-7 w-72 max-w-full bg-white/10" />
            <Pulse className="mt-7 h-11 w-full max-w-2xl bg-white/10" />
            <Pulse className="mt-3 h-11 w-4/5 max-w-xl bg-white/10" />
            <Pulse className="mt-6 h-6 w-full max-w-2xl bg-white/10" />
            <Pulse className="mt-2 h-6 w-3/4 max-w-xl bg-white/10" />
            <Pulse className="mx-auto mt-9 h-16 w-full max-w-3xl rounded-[1.45rem] bg-white/10" />
            <div className="mx-auto mt-4 flex max-w-3xl flex-wrap gap-2">
              {[0, 1, 2, 3].map((index) => (
                <Pulse key={index} className="h-7 w-20 rounded-full bg-white/10" />
              ))}
            </div>
            <div className="mx-auto mt-9 grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4">
              {[0, 1, 2, 3].map((index) => (
                <Pulse key={index} className="h-20 rounded-2xl bg-white/10" />
              ))}
            </div>
          </div>

          <div className="relative min-w-0 rounded-[2rem] border border-white/10 bg-white/10 p-4 sm:p-5">
            <div className="overflow-hidden rounded-[1.55rem] border border-white/10 bg-white/10 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <Pulse className="h-3 w-28 bg-white/15" />
                  <Pulse className="mt-2 h-6 w-40 bg-white/15" />
                  <Pulse className="mt-2 h-4 w-32 bg-white/15" />
                </div>
                <Pulse className="h-16 w-16 shrink-0 rounded-2xl bg-white/15" />
              </div>
              <Pulse className="mt-6 h-44 rounded-2xl bg-white/10" />
              <Pulse className="mt-5 h-16 rounded-2xl bg-white/10" />
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {[0, 1, 2].map((index) => (
                <Pulse key={index} className="h-12 rounded-2xl bg-white/10" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
