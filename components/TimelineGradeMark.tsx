type TimelineGradeMarkProps = {
  grade: string | null | undefined;
  className?: string;
  rotation?: number;
};

function displayGrade(grade: string | null | undefined) {
  const value = grade?.trim() || "Pending";
  return value.toLowerCase() === "pending" ? "P" : value.slice(0, 1).toUpperCase();
}

function fullGrade(grade: string | null | undefined) {
  return grade?.trim() || "Pending";
}

export default function TimelineGradeMark({
  grade,
  className = "",
  rotation = -2
}: TimelineGradeMarkProps) {
  const label = fullGrade(grade);

  return (
    <span
      className={`pointer-events-none inline-grid place-items-center text-[#c22] ${className}`}
      aria-label={`Official inspection grade ${label}`}
      title={`Official inspection grade ${label}`}
      style={{
        transform: `rotate(${rotation}deg)`,
        fontFamily: "var(--font-marker), ui-rounded, system-ui, sans-serif"
      }}
    >
      <span className="relative text-[0.95rem] leading-none tracking-[-0.05em]">
        {displayGrade(grade)}
        <span
          className="absolute -bottom-1 left-1/2 h-1.5 w-7 -translate-x-1/2 rounded-[50%] border-b-2 border-[#c22]/75"
          aria-hidden="true"
        />
      </span>
    </span>
  );
}
