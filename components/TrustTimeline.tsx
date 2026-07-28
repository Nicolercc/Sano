import { formatDate, trajectoryLabel } from "@/lib/format";
import { deriveTrajectory } from "@/lib/scoring";
import type { Inspection } from "@/lib/types";

type TrustTimelineProps = {
  inspections: Inspection[];
};

const VIEW_WIDTH = 100;
const VIEW_HEIGHT = 56;
const PLOT_LEFT = 3;
const PLOT_RIGHT = 97;
const PLOT_BOTTOM = 48;
const PLOT_HEIGHT = 38;
const MIN_BAR_WIDTH = 3;
const MAX_BAR_WIDTH = 8;
/**
 * NYC DOHMH scores are practically unbounded, but Sano already treats 0-100
 * as its comparison ceiling everywhere else (the reliability score). Fixing
 * the chart to the same ceiling makes any two restaurants' bar heights
 * directly comparable, instead of each chart rescaling to its own tallest
 * bar and making a mild record and a severe one look identical in shape.
 */
const FIXED_AXIS_MAX_SCORE = 100;

function resolveBarCenters(count: number, times: number[], barWidth: number) {
  const plotWidth = PLOT_RIGHT - PLOT_LEFT;

  if (count <= 1) {
    return [PLOT_LEFT + plotWidth / 2];
  }

  const minTime = times[0];
  const maxTime = times[times.length - 1];
  const span = maxTime - minTime;

  const raw = times.map((time, index) =>
    span === 0
      ? PLOT_LEFT + (plotWidth * index) / (count - 1)
      : PLOT_LEFT + ((time - minTime) / span) * plotWidth
  );

  // Real inspection cycles can land days apart (e.g. a re-inspection shortly
  // after a failed one). Plotting purely by elapsed time would overlap those
  // bars, so later points are nudged right just enough to stay legible while
  // keeping their order and approximate relative spacing.
  const minGap = barWidth + 1.2;
  const centers = [...raw];
  for (let i = 1; i < centers.length; i++) {
    if (centers[i] - centers[i - 1] < minGap) {
      centers[i] = centers[i - 1] + minGap;
    }
  }

  // If that nudging pushed the sequence past the right edge, pull the whole
  // run back so the most recent cycle never clips off the chart.
  const overflow = centers[centers.length - 1] - PLOT_RIGHT;
  if (overflow > 0) {
    for (let i = 0; i < centers.length; i++) {
      centers[i] = Math.max(PLOT_LEFT, centers[i] - overflow);
    }
  }

  return centers;
}

function resolveColumnWidths(centers: number[]) {
  if (centers.length <= 1) {
    return [VIEW_WIDTH];
  }

  const boundaries = [0];
  for (let i = 0; i < centers.length - 1; i++) {
    boundaries.push((centers[i] + centers[i + 1]) / 2);
  }
  boundaries.push(VIEW_WIDTH);

  return centers.map((_, index) =>
    Math.max(boundaries[index + 1] - boundaries[index], 0.01)
  );
}

export default function TrustTimeline({ inspections }: TrustTimelineProps) {
  const ordered = [...inspections].sort((a, b) => a.date.localeCompare(b.date));
  const trajectory = deriveTrajectory(ordered);
  const count = ordered.length;
  const axisMaxScore = Math.max(
    FIXED_AXIS_MAX_SCORE,
    ...ordered.map((inspection) => inspection.score)
  );
  const times = ordered.map(
    (inspection) => new Date(`${inspection.date}T12:00:00`).getTime()
  );
  const barWidth = count
    ? Math.max(
        MIN_BAR_WIDTH,
        Math.min(MAX_BAR_WIDTH, (PLOT_RIGHT - PLOT_LEFT) / (count * 1.6))
      )
    : 0;
  const centers = count ? resolveBarCenters(count, times, barWidth) : [];

  const plotted = ordered.map((inspection, index) => {
    const cx = centers[index];
    const barHeight = Math.max(
      2.5,
      (inspection.score / axisMaxScore) * PLOT_HEIGHT
    );
    const y = PLOT_BOTTOM - barHeight;
    const x = cx - barWidth / 2;

    return { inspection, x, y, barHeight, cx, cy: y };
  });

  const trendPath = plotted
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.cx} ${point.cy}`)
    .join(" ");

  const columnStyle = {
    gridTemplateColumns: resolveColumnWidths(centers)
      .map((width) => `minmax(4.75rem, ${width}fr)`)
      .join(" ")
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
                  fill={hasCritical ? "#c22f2f" : "#2563c9"}
                  fillOpacity={hasCritical ? "0.82" : "0.88"}
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

            {plotted.map(({ inspection, y, cx, cy }, index) => {
              const hasCritical = inspection.criticalCount > 0;
              const markerY = Math.max(2.2, y - 7.2);
              const gradeY = Math.max(4.8, y - 3.2);
              const gradeTilt = [-2, 1.5, -1, 2][index % 4];
              const gradeLabel =
                inspection.grade.toLowerCase() === "pending"
                  ? "P"
                  : inspection.grade.slice(0, 1).toUpperCase();

              return (
                <g key={`${inspection.id}-markers`}>
                  <path
                    d={`M ${cx - 2.35} ${gradeY + 1.25} Q ${cx} ${gradeY + 2.2} ${cx + 2.35} ${gradeY + 1.25}`}
                    fill="none"
                    stroke="#c22"
                    strokeOpacity="0.74"
                    strokeWidth="0.35"
                    strokeLinecap="round"
                    transform={`rotate(${gradeTilt} ${cx} ${gradeY + 1.25})`}
                  />
                  <text
                    x={cx}
                    y={gradeY}
                    textAnchor="middle"
                    fill="#c22"
                    fontFamily="var(--font-marker), ui-rounded, system-ui, sans-serif"
                    fontSize={gradeLabel === "P" ? "3.35" : "3.65"}
                    fontWeight="400"
                    transform={`rotate(${gradeTilt} ${cx} ${gradeY})`}
                  >
                    {gradeLabel}
                  </text>

                  {hasCritical ? (
                    <circle cx={cx - 1.5} cy={markerY} r="1.05" fill="#c22f2f">
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
                      fill="#d4af3740"
                      stroke="#8a6418"
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
