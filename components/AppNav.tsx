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
  active,
  onCommandSearch
}: AppNavProps) {
  const [isPastLanding, setIsPastLanding] = useState(active !== "home");
  const [activeSection, setActiveSection] = useState<HomeSection | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (active !== "home") {
      return;
    }

    let ticking = false;

    const updateNavigationState = () => {
      const landing = document.getElementById("landing");
      const landingBottom = landing?.getBoundingClientRect().bottom ?? 0;

      setIsPastLanding(!landing || landingBottom <= 96);
      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateNavigationState);
        ticking = true;
      }
    };

    updateNavigationState();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
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

  const isHome = active === "home";
  const isHeroPill = isHome && !isPastLanding;
  const showCommandSearch = Boolean(onCommandSearch && isHome && !isHeroPill);
  const isSectionActive = (section: HomeSection) =>
    activeSection === section || (!activeSection && section === "search");
  const focusClass = isHeroPill
    ? "focus-visible:outline-[#6fa3e0]"
    : "focus-visible:outline-moss";
  const linkBase = `rounded-full px-3 py-2 text-sm font-bold transition duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${focusClass} motion-reduce:transition-none`;

  // Hero inactive links need near-white text: white/66 fails readability on #1e2a38.
  const heroInactiveLink =
    "text-[#e8eef5] hover:bg-white/15 hover:text-white";
  const heroActiveLink =
    "bg-white/18 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.28)]";
  const lightInactiveLink = "text-ink/80 hover:bg-oat hover:text-ink";
  const lightActiveLink =
    "bg-mint text-moss shadow-[inset_0_0_0_1px_rgba(37,99,201,0.12)]";

  const homeLinkClass = (section: HomeSection) =>
    `${linkBase} hidden sm:inline-flex ${
      isHome && isSectionActive(section)
        ? isHeroPill
          ? heroActiveLink
          : lightActiveLink
        : isHeroPill
          ? heroInactiveLink
          : lightInactiveLink
    }`;

  return (
    <>
    <nav
      aria-label="Primary navigation"
      className={`fixed left-0 right-0 z-[100] mx-auto flex items-center justify-between gap-3 overflow-hidden border px-3 py-2 backdrop-blur-xl transition-all duration-500 motion-reduce:transition-none sm:px-4 ${
        isHeroPill
          ? "top-3 w-[calc(100%-2rem)] max-w-7xl rounded-full border-white/10 bg-[#1e2a38]/80 shadow-[0_24px_70px_rgba(7,13,22,0.26)]"
          : "top-0 w-full max-w-none rounded-none border-ink/10 bg-[#fffaf1]/95 shadow-[0_14px_44px_rgba(23,32,27,0.08)] supports-[backdrop-filter]:bg-[#fffaf1]/85 lg:px-8"
      }`}
    >
      <Link
        href="/"
        aria-label="Sano home"
        className={`flex min-w-0 shrink-0 items-center gap-2 rounded-full pr-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${focusClass}`}
      >
        <span
          aria-hidden="true"
          className={`grid shrink-0 place-items-center rounded-2xl bg-[#2563c9] font-serif font-black text-white shadow-sm transition-all duration-500 motion-reduce:transition-none ${
            isHeroPill ? "h-9 w-9 text-lg" : "h-8 w-8 text-base"
          }`}
        >
          <span className="text-[#6fa3e0]" aria-hidden="true">
            S
          </span>
        </span>
        <span
          className={`font-serif font-black tracking-tight transition-all duration-500 motion-reduce:transition-none ${
            isHeroPill ? "text-2xl text-white" : "text-xl text-ink"
          }`}
        >
          Sano
        </span>
      </Link>

      {showCommandSearch ? (
        <form
          onSubmit={submitCommandSearch}
          className={`mx-auto hidden min-w-0 flex-1 items-center gap-2 rounded-full border border-ink/10 bg-white p-1 pl-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.72)] transition-all duration-500 motion-reduce:transition-none lg:flex ${
            showCommandSearch
              ? "max-w-xl translate-y-0 opacity-100"
              : "max-w-0 translate-y-1 opacity-0"
          }`}
          aria-hidden={!showCommandSearch}
        >
          <label className="sr-only" htmlFor="nav-command-search">
            Search NYC restaurants
          </label>
          <input
            id="nav-command-search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search NYC restaurants, ZIP, cuisine…"
            tabIndex={showCommandSearch ? 0 : -1}
            className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-ink outline-none placeholder:text-ink/42"
          />
          <button
            type="submit"
            tabIndex={showCommandSearch ? 0 : -1}
            className="inline-flex min-h-9 shrink-0 items-center rounded-full bg-moss px-4 text-sm font-black text-white transition hover:bg-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-moss"
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
          className={`${linkBase} ${
            active === "methodology"
              ? isHeroPill
                ? heroActiveLink
                : lightActiveLink
              : isHeroPill
                ? heroInactiveLink
                : lightInactiveLink
          }`}
          aria-current={active === "methodology" ? "page" : undefined}
        >
          Methodology
        </Link>
        <Link
          href="/#search"
          aria-label="Try Sano search"
          className={`inline-flex min-h-10 shrink-0 items-center rounded-full px-4 text-sm font-black shadow-sm transition duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${focusClass} motion-reduce:transition-none ${
            isHeroPill
              ? "bg-[#2563c9] text-white hover:bg-[#1e56ad]"
              : "bg-ink text-white hover:bg-moss"
          } ${showCommandSearch ? "lg:px-3" : ""}`}
        >
          {showCommandSearch ? "Try" : "Try Sano"}
        </Link>
      </div>
    </nav>
    <div
      className={isHome ? "h-[5.25rem] bg-[#1e2a38]" : "h-14"}
      aria-hidden="true"
    />
    </>
  );
}
