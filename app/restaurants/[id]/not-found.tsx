import Link from "next/link";

export default function RestaurantNotFound() {
  return (
    <main className="min-h-screen bg-oat text-ink">
      <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <nav className="flex items-center justify-between">
          <Link href="/" className="font-serif text-4xl font-black text-ink">
            Sano
          </Link>
          <Link
            href="/methodology"
            className="rounded-md border border-ink/15 bg-white/70 px-4 py-2 text-sm font-semibold text-ink shadow-sm transition hover:border-moss/40"
          >
            Methodology
          </Link>
        </nav>

        <section className="my-auto rounded-xl border border-ink/10 bg-white p-8 text-center shadow-sm">
          <p className="text-sm font-bold uppercase tracking-wide text-moss">
            Restaurant unavailable
          </p>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-ink sm:text-4xl">
            We could not find that restaurant profile.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-ink/65">
            The restaurant ID may be outside the current demo extract, or the
            link may be outdated. Search the available restaurants and try again.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex min-h-11 items-center rounded-md bg-ink px-5 text-sm font-bold text-white transition hover:bg-moss focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-moss"
          >
            Back to restaurant search
          </Link>
        </section>
      </div>
    </main>
  );
}
