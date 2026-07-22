"use client";

import Link from "next/link";
import { confidenceLabel, formatNumber, trajectoryLabel } from "@/lib/format";
import { confidenceTone, scoreTone } from "@/lib/scoring";
import type { Inspection, Restaurant } from "@/lib/types";

type RestaurantCardProps = {
  restaurant: Restaurant;
  selected?: boolean;
  onSelect?: (restaurant: Restaurant) => void;
};

const timelineWidth = 140;
const timelineHeight = 64;
const plotBottom = 54;
const plotHeight = 42;

function scoreMeterClass(score: number) {
  if (score >= 78) {
    return "bg-moss";
  }

  if (score >= 62) {
    return "bg-amber";
  }

  return "bg-coral";
}

function trajectorySymbol(trajectory: Restaurant["trajectory"]) {
  const symbols: Record<Restaurant["trajectory"], string> = {
    improving: "Up",
    stable: "Flat",
    declining: "Down",
    volatile: "Swing"
  };

  return symbols[trajectory];
}

function timelineBars(inspections: Inspection[]) {
  const ordered = [...inspections].sort((a, b) => a.date.localeCompare(b.date));
  const maxScore = Math.max(...ordered.map((inspection) => inspection.score), 1);
  const count = ordered.length;
  const gap = count > 1 ? Math.min(6, 20 / count) : 0;
  const barWidth =
    count === 0
      ? 0
      : (timelineWidth - gap * Math.max(count - 1, 0)) / Math.max(count, 1);

  return ordered.map((inspection, index) => {
    const x = index * (barWidth + gap);
    const height = Math.max(3, (inspection.score / maxScore) * plotHeight);
    const y = plotBottom - height;
    const color =
      inspection.criticalCount > 0
        ? "#c8664c"
        : inspection.repeatPattern
          ? "#d69d3f"
          : "#486b55";

    return {
      inspection,
      x,
      y,
      width: barWidth,
      height,
      color,
      labelY: Math.max(8, y - 4),
      cx: x + barWidth / 2
    };
  });
}

export default function RestaurantCard({
  restaurant,
  selected = false,
  onSelect
}: RestaurantCardProps) {
  const bars = timelineBars(restaurant.inspections);
  const meterWidth = `${Math.max(4, restaurant.inspectionReliabilityScore)}%`;

  return (
    <article
      className={`rounded-xl border p-4 shadow-sm transition sm:p-5 ${
        selected
          ? "border-moss bg-[#fbf8f1] shadow-soft"
          : "border-ink/10 bg-white hover:border-moss/35"
      }`}
    >
      <div className="grid gap-4 lg:grid-cols-[9.5rem_minmax(0,1fr)_4.75rem_11rem_auto] lg:items-center lg:gap-5">
        <button
          type="button"
          onClick={() => onSelect?.(restaurant)}
          className="order-2 rounded-md text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-moss lg:order-1"
          aria-label={`Select ${restaurant.name}`}
          aria-pressed={selected}
        >
          <svg
            viewBox={`0 0 ${timelineWidth} ${timelineHeight}`}
            className="h-16 w-full max-w-[11rem] lg:max-w-none"
            role="img"
            aria-label={`Mini inspection timeline for ${restaurant.name}`}
          >
            <line
              x1="0"
              y1={plotBottom}
              x2={timelineWidth}
              y2={plotBottom}
              stroke="#17201b"
              strokeOpacity="0.1"
              strokeWidth="1"
            />
            {bars.map(({ inspection, x, y, width, height, color, labelY, cx }) => (
              <g key={inspection.id}>
                <rect
                  x={x}
                  y={y}
                  width={width}
                  height={height}
                  rx="1.5"
                  fill={color}
                  fillOpacity="0.86"
                >
                  <title>{`${inspection.date}: score ${inspection.score}, grade ${inspection.grade}`}</title>
                </rect>
                <text
                  x={cx}
                  y={labelY}
                  textAnchor="middle"
                  fontSize="7"
                  fontWeight="700"
                  fill="#17201b"
                >
                  {inspection.grade}
                </text>
              </g>
            ))}
          </svg>
        </button>

        <button
          type="button"
          onClick={() => onSelect?.(restaurant)}
          className="order-1 min-w-0 rounded-md text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-moss lg:order-2"
          aria-label={`Select ${restaurant.name}`}
          aria-pressed={selected}
        >
          <h2 className="font-serif text-xl font-bold leading-tight text-ink">
            {restaurant.name}
          </h2>
          <p className="mt-1 text-sm text-ink/60">
            {restaurant.cuisine} · {restaurant.neighborhood} · {restaurant.priceLevel}
          </p>
        </button>

        <div className="order-3 flex items-end justify-between gap-3 lg:block lg:text-right">
          <p className="text-[10px] font-bold uppercase tracking-wide text-ink/45">
            Grade
          </p>
          <p className="font-serif text-2xl font-bold leading-none text-ink">
            {restaurant.grade}
          </p>
        </div>

        <div className="order-4 min-w-0">
          <div className="flex items-baseline justify-between gap-3">
            <p className="text-[10px] font-bold uppercase tracking-wide text-ink/45">
              Reliability
            </p>
            <p
              className={`text-base font-black ${scoreTone(
                restaurant.inspectionReliabilityScore
              )}`}
            >
              {restaurant.inspectionReliabilityScore}
            </p>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-ink/10">
            <div
              className={`h-full rounded-full ${scoreMeterClass(
                restaurant.inspectionReliabilityScore
              )}`}
              style={{ width: meterWidth }}
            />
          </div>
        </div>

        <Link
          href={`/restaurants/${restaurant.id}`}
          className="order-5 inline-flex min-h-10 items-center justify-center rounded-md bg-ink px-4 text-sm font-semibold text-white transition hover:bg-moss focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-moss"
        >
          Open profile
        </Link>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 lg:pl-[11rem]">
        <span className="inline-flex items-center rounded-full border border-ink/15 px-3 py-1 text-xs font-bold text-ink">
          {trajectorySymbol(restaurant.trajectory)} · {restaurant.sanoLabel}
        </span>
        <span
          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${confidenceTone(
            restaurant.confidence
          )}`}
        >
          {confidenceLabel(restaurant.confidence)}
        </span>
        <span className="inline-flex items-center rounded-full bg-oat px-3 py-1 text-xs font-bold text-ink/65">
          {trajectoryLabel(restaurant.trajectory)}
        </span>
        <span className="text-sm font-semibold text-ink/60">
          {restaurant.rating.toFixed(1)} · {formatNumber(restaurant.reviewCount)} reviews
        </span>
      </div>

      <p className="mt-3 max-w-4xl text-sm leading-6 text-ink/70 lg:pl-[11rem]">
        {restaurant.explanation}
      </p>
    </article>
  );
}
