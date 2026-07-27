"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";

type AppNavProps = {
  active?: "home" | "methodology";
  onCommandSearch?: (query: string) => void;
};

type HomeSection = "how-it-works" | "demo" | "search";

const homeSections: HomeSection[] = ["how-it-works", "demo", "search"];

export default function AppNav({
  active = "home",
  onCommandSearch
}: AppNavProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState<HomeSection | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (active !== "home") {
      return;
    }

    let ticking = false;

    const updateScrolled = () => {
      setIsScrolled(window.scrollY > 180);
      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateScrolled);
        ticking = true;
      }
    };

    updateScrolled();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [active]);

  useEffect(() => {
    if (active !== "home" || typeof IntersectionObserver === "undefined") {
      return;
    }

    const sections = homeSections
      .map((section) => document.getElementById(section))
      .filter((section): section is HTMLElement => Boolean(section));

    if (!sections.length) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visible?.target.id && homeSections.includes(visible.target.id as HomeSection)) {
          setActiveSection(visible.target.id as HomeSection);
        }
      },
      {
        rootMargin: "-24% 0px -58% 0px",
        threshold: [0.08, 0.18, 0.32]
      }
    );

    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, [active]);

  const submitCommandSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextQuery = query.trim();

    if (!nextQuery) {
      return;
    }

    onCommandSearch?.(nextQuery);
  };

  const linkBase =
    "rounded-full px-3 py-2 text-sm font-bold transition duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6fa3e0] motion-reduce:transition-none";
  const isHome = active === "home";
  const showCommandSearch = Boolean(onCommandSearch && isHome);
  const isSectionActive = (section: HomeSection) =>
    activeSection === section || (!activeSection && section === "search");

  const homeLinkClass = (section: HomeSection) =>
    `${linkBase} hidden text-white/66 hover:bg-white/10 hover:text-white sm:inline-flex ${
      isHome && isSectionActive(section)
        ? "bg-white/12 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]"
        : ""
    }`;

  return (
    <nav
      aria-label="Primary navigation"
      className={`sticky top-3 z-30 mx-auto flex w-[calc(100%-2rem)] max-w-7xl items-center justify-between gap-3 overflow-hidden rounded-full border px-3 py-2 backdrop-blur-xl transition-all duration-500 motion-reduce:transition-none sm:px-4 ${
        isScrolled
          ? "border-white/16 bg-[#1e2a38]/88 shadow-[0_20px_80px_rgba(7,13,22,0.34)]"
          : "border-white/10 bg-[#1e2a38]/80 shadow-[0_24px_70px_rgba(7,13,22,0.26)]"
      }`}
    >
      <Link
        href="/"
        className="flex min-w-0 shrink-0 items-center gap-2 rounded-full pr-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6fa3e0]"
      >
        <span
          className={`grid shrink-0 place-items-center rounded-2xl bg-[#2563c9] font-serif font-black text-white shadow-sm transition-all duration-500 motion-reduce:transition-none ${
            isScrolled ? "h-8 w-8 text-base" : "h-9 w-9 text-lg"
          }`}
        >
          <span className="text-[#6fa3e0]" aria-hidden="true">
            S
          </span>
        </span>
        <span
          className={`font-serif font-black tracking-tight text-white transition-all duration-500 motion-reduce:transition-none ${
            isScrolled ? "text-xl" : "text-2xl"
          }`}
        >
          Sano
        </span>
      </Link>

      {showCommandSearch ? (
        <form
          onSubmit={submitCommandSearch}
          className={`mx-auto hidden min-w-0 flex-1 items-center gap-2 rounded-full border border-white/10 bg-white/8 p-1 pl-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] transition-all duration-500 motion-reduce:transition-none lg:flex ${
            isScrolled
              ? "max-w-xl translate-y-0 opacity-100"
              : "max-w-0 translate-y-1 opacity-0"
          }`}
          aria-hidden={!isScrolled}
        >
          <label className="sr-only" htmlFor="nav-command-search">
            Search NYC restaurants
          </label>
          <input
            id="nav-command-search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search NYC restaurants, ZIP, cuisine…"
            tabIndex={isScrolled ? 0 : -1}
            className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-white outline-none placeholder:text-white/42"
          />
          <button
            type="submit"
            tabIndex={isScrolled ? 0 : -1}
            className="inline-flex min-h-9 shrink-0 items-center rounded-full bg-[#2563c9] px-4 text-sm font-black text-white transition hover:bg-[#1e56ad] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6fa3e0]"
          >
            Search
          </button>
        </form>
      ) : null}

      <div className="flex min-w-0 shrink-0 items-center gap-1 overflow-x-auto">
        <Link
          href="/#how-it-works"
          className={homeLinkClass("how-it-works")}
          aria-current={isHome && isSectionActive("how-it-works") ? "location" : undefined}
        >
          How it works
        </Link>
        <Link
          href="/#search"
          className={homeLinkClass("search")}
          aria-current={isHome && isSectionActive("search") ? "location" : undefined}
        >
          Search
        </Link>
        <Link
          href="/#demo"
          className={`${homeLinkClass("demo")} md:inline-flex`}
          aria-current={isHome && isSectionActive("demo") ? "location" : undefined}
        >
          Demo
        </Link>
        <Link
          href="/methodology"
          className={`${linkBase} text-white/66 hover:bg-white/10 hover:text-white ${
            active === "methodology" ? "bg-white/10 text-white" : ""
          }`}
          aria-current={active === "methodology" ? "page" : undefined}
        >
          Methodology
        </Link>
        <Link
          href="/#search"
          className={`inline-flex min-h-10 shrink-0 items-center rounded-full bg-[#2563c9] px-4 text-sm font-black text-white shadow-sm transition duration-300 hover:bg-[#1e56ad] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6fa3e0] motion-reduce:transition-none ${
            isScrolled && showCommandSearch ? "lg:px-3" : ""
          }`}
        >
          {isScrolled && showCommandSearch ? "Try" : "Try Sano"}
        </Link>
      </div>
    </nav>
  );
}
