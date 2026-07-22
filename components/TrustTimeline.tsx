import { formatDate, trajectoryLabel } from "@/lib/format";
import { deriveTrajectory } from "@/lib/scoring";
import type { Inspection } from "@/lib/types";

type TrustTimelineProps = {
  inspections: Inspection[];
};

const VIEW_WIDTH = 100;
const VIEW_HEIGHT = 56;
const PLOT_BOTTOM = 48;
const PLOT_HEIGHT = 38;

export default function TrustTimeline({ inspections }: TrustTimelineProps) {
  const ordered = [...inspections].sort((a, b) => a.date.localeCompare(b.date));
  const trajectory = deriveTrajectory(ordered);
  const maxScore = Math.max(...ordered.map((inspection) => inspection.score), 1);
  const count = ordered.length;

  const gap = count > 1 ? Math.min(3.5, 18 / count) : 0;
  const barWidth =
    count === 0 ? 0 : (VIEW_WIDTH - gap * Math.max(count - 1, 0)) / Math.max(count, 1);

  const plotted = ordered.map((inspection, index) => {
    const x = index * (barWidth + gap);
    const barHeight = Math.max(
      2.5,
      (inspection.score / maxScore) * PLOT_HEIGHT
    );
    const y = PLOT_BOTTOM - barHeight;
    const cx = x + barWidth / 2;

    return { inspection, x, y, barHeight, cx, cy: y };
  });

  const trendPath = plotted
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.cx} ${point.cy}`)
    .join(" ");

  const columnStyle = {
    gridTemplateColumns: `repeat(${Math.max(count, 1)}, minmax(4.75rem, 1fr))`
  };

  if (!count) {
    return (
      <section className="rounded-lg border border-ink/10 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold text-ink">Inspection timeline</h2>
        <p className="mt-2 text-sm text-ink/60">
          No inspection cycles are available for this restaurant yet.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-lg border border-ink/10 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-ink">Inspection timeline</h2>
          <p className="mt-1 text-sm text-ink/60">
            Lower scores generally indicate fewer recorded inspection points.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full bg-oat px-3 py-1 text-xs font-bold text-ink/70">
            {count} {count === 1 ? "cycle" : "cycles"}
          </span>
          <span className="rounded-full bg-mint px-3 py-1 text-xs font-bold text-moss">
            Trend: {trajectoryLabel(trajectory)}
          </span>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-3 text-xs text-ink/60">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-coral" aria-hidden />
          Critical flag
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span
            className="h-2.5 w-2.5 rounded-sm border-2 border-amber bg-amber/20"
            aria-hidden
          />
          Repeat pattern
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-0.5 w-4 rounded bg-ink/40" aria-hidden />
          Score trend
        </span>
      </div>

      <div className="-mx-1 mt-5 overflow-x-auto pb-1">
        <div className="min-w-[30rem] px-1 sm:min-w-0">
          <svg
            viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
            className="h-44 w-full"
            role="img"
            aria-label="Inspection score trend across recorded cycles"
          >
            <line
              x1="0"
              y1={PLOT_BOTTOM}
              x2={VIEW_WIDTH}
              y2={PLOT_BOTTOM}
              stroke="#17201b"
              strokeOpacity="0.1"
              strokeWidth="0.35"
            />

            {plotted.map(({ inspection, x, y, barHeight }) => {
              const hasCritical = inspection.criticalCount > 0;

              return (
                <rect
                  key={`${inspection.id}-bar`}
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  rx="0.8"
                  fill={hasCritical ? "#c8664c" : "#486b55"}
                  fillOpacity="0.8"
                >
                  <title>
                    {`${formatDate(inspection.date)}: score ${inspection.score}, grade ${inspection.grade}`}
                  </title>
                </rect>
              );
            })}

            {plotted.length > 1 ? (
              <path
                d={trendPath}
                fill="none"
                stroke="#17201b"
                strokeOpacity="0.4"
                strokeWidth="0.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ) : null}

            {plotted.map(({ inspection, y, cx, cy }) => {
              const hasCritical = inspection.criticalCount > 0;
              const markerY = Math.max(2.2, y - 7.2);

              return (
                <g key={`${inspection.id}-markers`}>
                  <text
                    x={cx}
                    y={Math.max(4.5, y - 3.2)}
                    textAnchor="middle"
                    fill="#17201b"
                    fontSize="3.2"
                    fontWeight="700"
                  >
                    {inspection.grade}
                  </text>

                  {hasCritical ? (
                    <circle cx={cx - 1.5} cy={markerY} r="1.05" fill="#c8664c">
                      <title>{`${inspection.criticalCount} critical`}</title>
                    </circle>
                  ) : null}

                  {inspection.repeatPattern ? (
                    <rect
                      x={cx + 0.55}
                      y={markerY - 1}
                      width="2"
                      height="2"
                      rx="0.25"
                      fill="#d69d3f40"
                      stroke="#d69d3f"
                      strokeWidth="0.35"
                    >
                      <title>Repeat pattern</title>
                    </rect>
                  ) : null}

                  <circle
                    cx={cx}
                    cy={cy}
                    r="1.15"
                    fill="#ffffff"
                    stroke="#17201b"
                    strokeOpacity="0.5"
                    strokeWidth="0.4"
                  />
                </g>
              );
            })}
          </svg>

          <ol className="mt-3 grid gap-3" style={columnStyle}>
            {ordered.map((inspection) => (
              <li key={inspection.id} className="min-w-0 text-center">
                <p className="text-sm font-black text-ink">{inspection.score}</p>
                <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-wide text-ink/45">
                  Raw score
                </p>
                <p className="mt-2 text-xs font-semibold text-ink/70">
                  {formatDate(inspection.date)}
                </p>
                <div className="mt-2 flex flex-wrap justify-center gap-1">
                  <span className="rounded-full bg-oat px-2 py-0.5 text-[11px] font-bold text-ink/70">
                    Grade {inspection.grade}
                  </span>
                  {inspection.criticalCount > 0 ? (
                    <span className="rounded-full bg-coral/10 px-2 py-0.5 text-[11px] font-bold text-coral">
                      {inspection.criticalCount} critical
                    </span>
                  ) : null}
                  {inspection.repeatPattern ? (
                    <span className="rounded-full bg-amber/15 px-2 py-0.5 text-[11px] font-bold text-amber">
                      Repeat
                    </span>
                  ) : null}
                </div>
                <p className="mt-2 hidden text-left text-xs leading-5 text-ink/60 lg:block">
                  {inspection.note}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </div>

      <ul className="mt-4 space-y-2 lg:hidden">
        {ordered.map((inspection) => (
          <li
            key={`${inspection.id}-note`}
            className="rounded-md bg-oat px-3 py-2 text-xs leading-5 text-ink/70"
          >
            <span className="font-semibold text-ink">
              {formatDate(inspection.date)}
            </span>
            {" — "}
            {inspection.note}
          </li>
        ))}
      </ul>
    </section>
  );
}
