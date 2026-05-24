type Size = "sm" | "md";

export default function StatusPill({ size = "md" }: { size?: Size }) {
  const padding = size === "sm" ? "px-2.5 py-1" : "px-3 py-1.5";
  const dotSize = size === "sm" ? "h-1.5 w-1.5" : "h-2 w-2";
  const textSize = size === "sm" ? "text-[11px]" : "text-xs";
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border border-hairline-strong bg-surface-1/60 backdrop-blur-sm ${padding} ${textSize} font-mono uppercase tracking-wider text-accent`}
    >
      <span className={`pulse-dot inline-block rounded-full bg-status-green ${dotSize}`} />
      Available for projects
    </span>
  );
}
