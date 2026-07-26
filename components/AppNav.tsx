import Link from "next/link";

type AppNavProps = {
  active?: "home" | "methodology";
};

export default function AppNav({ active = "home" }: AppNavProps) {
  const linkBase =
    "rounded-full px-3 py-2 text-sm font-bold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-moss";

  return (
    <nav
      aria-label="Primary navigation"
      className="sticky top-3 z-30 mx-auto flex w-[calc(100%-2rem)] max-w-7xl items-center justify-between gap-3 rounded-full border border-white/60 bg-[#fffaf1]/85 px-3 py-2 shadow-soft backdrop-blur-xl sm:px-4"
    >
      <Link
        href="/"
        className="flex min-w-0 items-center gap-2 rounded-full pr-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-moss"
      >
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-ink font-serif text-lg font-black text-oat shadow-sm">
          S
        </span>
        <span className="font-serif text-2xl font-black tracking-tight text-ink">
          Sano
        </span>
      </Link>

      <div className="flex items-center gap-1 overflow-x-auto">
        <Link
          href="/#search"
          className={`${linkBase} hidden text-ink/65 hover:bg-white hover:text-ink sm:inline-flex ${
            active === "home" ? "bg-white text-ink shadow-sm" : ""
          }`}
        >
          Search
        </Link>
        <Link
          href="/#demo"
          className={`${linkBase} hidden text-ink/65 hover:bg-white hover:text-ink md:inline-flex`}
        >
          Demo paths
        </Link>
        <Link
          href="/methodology"
          className={`${linkBase} text-ink/65 hover:bg-white hover:text-ink ${
            active === "methodology" ? "bg-white text-ink shadow-sm" : ""
          }`}
        >
          Methodology
        </Link>
        <Link
          href="/#search"
          className="inline-flex min-h-10 shrink-0 items-center rounded-full bg-ink px-4 text-sm font-black text-white shadow-sm transition hover:bg-moss focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-moss"
        >
          Try Sano
        </Link>
      </div>
    </nav>
  );
}
