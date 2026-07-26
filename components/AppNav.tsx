import Link from "next/link";

type AppNavProps = {
  active?: "home" | "methodology";
};

export default function AppNav({ active = "home" }: AppNavProps) {
  const linkBase =
    "rounded-full px-3 py-2 text-sm font-bold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6fa3e0]";

  return (
    <nav
      aria-label="Primary navigation"
      className="sticky top-3 z-30 mx-auto flex w-[calc(100%-2rem)] max-w-7xl items-center justify-between gap-3 rounded-full border border-white/10 bg-[#1e2a38]/80 px-3 py-2 shadow-[0_24px_70px_rgba(7,13,22,0.26)] backdrop-blur-xl sm:px-4"
    >
      <Link
        href="/"
        className="flex min-w-0 items-center gap-2 rounded-full pr-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6fa3e0]"
      >
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-2xl bg-[#2563c9] font-serif text-lg font-black text-white shadow-sm">
          <span className="text-[#6fa3e0]" aria-hidden="true">
            S
          </span>
        </span>
        <span className="font-serif text-2xl font-black tracking-tight text-white">
          Sano
        </span>
      </Link>

      <div className="flex items-center gap-1 overflow-x-auto">
        <Link
          href="/#how-it-works"
          className={`${linkBase} hidden text-white/66 hover:bg-white/10 hover:text-white sm:inline-flex`}
        >
          How it works
        </Link>
        <Link
          href="/#search"
          className={`${linkBase} hidden text-white/66 hover:bg-white/10 hover:text-white sm:inline-flex ${
            active === "home" ? "bg-white/10 text-white" : ""
          }`}
        >
          Search
        </Link>
        <Link
          href="/#demo"
          className={`${linkBase} hidden text-white/66 hover:bg-white/10 hover:text-white md:inline-flex`}
        >
          Demo
        </Link>
        <Link
          href="/methodology"
          className={`${linkBase} text-white/66 hover:bg-white/10 hover:text-white ${
            active === "methodology" ? "bg-white/10 text-white" : ""
          }`}
        >
          Methodology
        </Link>
        <Link
          href="/#search"
          className="inline-flex min-h-10 shrink-0 items-center rounded-full bg-[#2563c9] px-4 text-sm font-black text-white shadow-sm transition hover:bg-[#1e56ad] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6fa3e0]"
        >
          Try Sano
        </Link>
      </div>
    </nav>
  );
}
