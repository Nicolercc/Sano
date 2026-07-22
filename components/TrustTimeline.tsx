import { formatDate } from "@/lib/format";
import type { Inspection } from "@/lib/types";

type TrustTimelineProps = {
  inspections: Inspection[];
};

export default function TrustTimeline({ inspections }: TrustTimelineProps) {
  const ordered = [...inspections].sort((a, b) => a.date.localeCompare(b.date));
  const maxScore = Math.max(...ordered.map((inspection) => inspection.score), 30);

  return (
    <section className="rounded-lg border border-ink/10 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-ink">Inspection timeline</h2>
          <p className="text-sm text-ink/60">
            Lower scores generally indicate fewer recorded inspection points.
          </p>
        </div>
        <span className="rounded-full bg-oat px-3 py-1 text-xs font-bold text-ink/60">
          {ordered.length} cycles
        </span>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-5">
        {ordered.map((inspection) => {
          const height = Math.max(18, (inspection.score / maxScore) * 130);

          return (
            <article key={inspection.id} className="flex flex-col gap-3">
              <div className="flex h-40 items-end rounded-md bg-oat px-3 pb-3">
                <div
                  className={`w-full rounded-t-md ${
                    inspection.criticalCount > 0 ? "bg-coral" : "bg-moss"
                  }`}
                  style={{ height }}
                  aria-label={`Inspection score ${inspection.score}`}
                  title={`Inspection score ${inspection.score}`}
                />
              </div>
              <div>
                <p className="text-sm font-black text-ink">
                  {inspection.score} pts · Grade {inspection.grade}
                </p>
                <p className="mt-1 text-xs font-semibold text-ink/55">
                  {formatDate(inspection.date)}
                </p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {inspection.criticalCount > 0 ? (
                    <span className="rounded-full bg-coral/10 px-2 py-1 text-[11px] font-bold text-coral">
                      {inspection.criticalCount} critical
                    </span>
                  ) : null}
                  {inspection.repeatPattern ? (
                    <span className="rounded-full bg-amber/15 px-2 py-1 text-[11px] font-bold text-amber">
                      Repeat pattern
                    </span>
                  ) : null}
                </div>
                <p className="mt-2 text-xs leading-5 text-ink/65">{inspection.note}</p>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
