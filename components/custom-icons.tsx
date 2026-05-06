// SVG illustré custom pour la saucisse française (l'emoji 🌭 ressemble trop
// à un hot dog américain). Stocké via le slug `:saucisse:` dans le champ emoji.

type IconProps = { size?: number; className?: string };

export function SaucisseIcon({ size = 32, className }: IconProps) {
  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      className={className}
      aria-label="Saucisse"
    >
      <defs>
        <linearGradient id="saucisse-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#D6916F" />
          <stop offset="1" stopColor="#8E4A30" />
        </linearGradient>
      </defs>
      <path
        d="M14 34 C 14 20, 28 12, 38 16 C 50 20, 56 32, 50 42 C 44 52, 28 54, 18 46 C 12 41, 14 38, 14 34 Z"
        fill="url(#saucisse-grad)"
        stroke="#3F1A0B"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <ellipse cx="14" cy="40" rx="3" ry="3.2" fill="#3F1A0B" />
      <path d="M22 22 Q 26 26, 22 30" stroke="#3F1A0B" strokeWidth="1.2" fill="none" opacity="0.5" />
      <path d="M30 18 Q 34 22, 30 26" stroke="#3F1A0B" strokeWidth="1.2" fill="none" opacity="0.5" />
      <path d="M40 22 Q 44 26, 40 30" stroke="#3F1A0B" strokeWidth="1.2" fill="none" opacity="0.5" />
      <path d="M44 36 Q 40 40, 44 44" stroke="#3F1A0B" strokeWidth="1.2" fill="none" opacity="0.5" />
    </svg>
  );
}

export const CUSTOM_ICONS: Record<
  string,
  { component: (props: IconProps) => React.ReactElement; label: string }
> = {
  ":saucisse:": { component: SaucisseIcon, label: "Saucisse" },
};

export function isCustomIcon(value: string): boolean {
  return value.startsWith(":") && value in CUSTOM_ICONS;
}
