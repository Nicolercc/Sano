import AppNav from "@/components/AppNav";
import MethodologyPanel from "@/components/MethodologyPanel";

export default function MethodologyPage() {
  return (
    <main className="min-h-screen bg-oat">
      <AppNav active="methodology" />
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <MethodologyPanel />
      </div>
    </main>
  );
}
