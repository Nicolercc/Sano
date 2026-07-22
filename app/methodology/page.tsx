import Link from "next/link";
import MethodologyPanel from "@/components/MethodologyPanel";

export default function MethodologyPage() {
  return (
    <main className="min-h-screen bg-oat">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <nav className="flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold tracking-normal text-ink">
            Sano
          </Link>
          <Link
            href="/"
            className="rounded-md border border-ink/10 bg-white px-4 py-2 text-sm font-semibold text-ink shadow-sm transition hover:border-moss/40"
          >
            Back to search
          </Link>
        </nav>
        <MethodologyPanel />
      </div>
    </main>
  );
}
