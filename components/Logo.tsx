import { cn } from "@/lib/utils";

export function LogoMark({
  size = 40,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      className={className}
      aria-label="Brasero"
    >
      {/* Flamme externe — silhouette géométrique */}
      <path
        d="M24 4 C 30 12, 38 16, 38 26 C 38 35, 32 42, 24 42 C 16 42, 10 35, 10 26 C 10 19, 14 17, 16 13 C 17 16, 19 17, 21 14 C 22 10, 23 7, 24 4 Z"
        fill="currentColor"
      />
      {/* Flamme interne — vide négatif */}
      <path
        d="M24 17 C 27 21, 30 24, 30 29 C 30 33, 27 35, 24 35 C 21 35, 18 33, 18 29 C 18 26, 20 24, 21 22 C 22 24, 23 24, 24 22 Z"
        fill="var(--background)"
      />
    </svg>
  );
}

export function Wordmark({
  size = "lg",
  className,
}: {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}) {
  const sizeClasses = {
    sm: "text-xl",
    md: "text-3xl",
    lg: "text-5xl",
    xl: "text-7xl",
  };
  return (
    <span
      className={cn(
        "font-display font-medium tracking-[-0.04em] leading-none",
        sizeClasses[size],
        className,
      )}
    >
      brasero
    </span>
  );
}

export function Logo({
  size = "lg",
  className,
  withMark = true,
}: {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  withMark?: boolean;
}) {
  const markSize = { sm: 22, md: 32, lg: 44, xl: 64 }[size];
  return (
    <span
      className={cn("inline-flex items-center gap-2.5 text-foreground", className)}
    >
      {withMark ? <LogoMark size={markSize} className="shrink-0" /> : null}
      <Wordmark size={size} />
    </span>
  );
}
