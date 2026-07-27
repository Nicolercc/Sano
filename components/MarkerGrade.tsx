type MarkerGradeSize = "xs" | "sm" | "md" | "lg" | "xl";

type MarkerGradeProps = {
  grade: string | null | undefined;
  size?: MarkerGradeSize;
  className?: string;
  compactPending?: boolean;
  rotation?: number;
};

const sizeClasses: Record<MarkerGradeSize, string> = {
  xs: "h-6 min-w-6 px-1.5 text-[0.7rem]",
  sm: "h-8 min-w-8 px-2 text-base",
  md: "h-11 min-w-11 px-2.5 text-2xl",
  lg: "h-14 min-w-14 px-3 text-3xl",
  xl: "h-16 min-w-16 px-3 text-4xl"
};

const pendingSizeClasses: Record<MarkerGradeSize, string> = {
  xs: "h-6 min-w-12 px-2 text-[0.58rem]",
  sm: "h-8 min-w-16 px-2.5 text-[0.7rem]",
  md: "h-11 min-w-20 px-3 text-sm",
  lg: "h-14 min-w-24 px-3 text-base",
  xl: "h-16 min-w-28 px-4 text-lg"
};

function normalizedGrade(grade: string | null | undefined) {
  const value = grade?.trim();
  return value || "Pending";
}

function defaultRotation(grade: string) {
  if (grade.toLowerCase() === "pending") {
    return -1;
  }

  const first = grade.charCodeAt(0) || 0;
  return [-2, 1, -1, 2][first % 4];
}

export default function MarkerGrade({
  grade,
  size = "md",
  className = "",
  compactPending = false,
  rotation
}: MarkerGradeProps) {
  const value = normalizedGrade(grade);
  const isPending = value.toLowerCase() === "pending";
  const display =
    isPending && !compactPending ? "Pending" : value.slice(0, 1).toUpperCase();
  const tilt = rotation ?? defaultRotation(value);

  return (
    <span
      className={`relative inline-grid shrink-0 place-items-center bg-white/95 font-black leading-none text-[#c22] shadow-sm ${
        isPending ? pendingSizeClasses[size] : sizeClasses[size]
      } ${className}`}
      style={{
        transform: `rotate(${tilt}deg)`,
        fontFamily: "var(--font-marker), ui-rounded, system-ui, sans-serif"
      }}
      aria-label={`Official inspection grade ${value}`}
      title={`Official inspection grade ${value}`}
    >
      <span
        className="pointer-events-none absolute inset-0 rounded-[42%_58%_49%_51%/53%_44%_56%_47%] border-[3px] border-[#c22]"
        aria-hidden="true"
      />
      <span
        className="pointer-events-none absolute inset-[3px] rounded-[56%_44%_52%_48%/45%_55%_43%_57%] border border-[#c22]/70"
        aria-hidden="true"
      />
      <span className="relative -mt-0.5 tracking-[-0.04em]">{display}</span>
    </span>
  );
}
