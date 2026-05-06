"use client";

import { CUSTOM_ICONS, isCustomIcon } from "@/components/custom-icons";

export function ItemEmoji({
  value,
  size = 32,
  className,
}: {
  value: string;
  size?: number;
  className?: string;
}) {
  if (isCustomIcon(value)) {
    const Icon = CUSTOM_ICONS[value].component;
    return <Icon size={size} className={className} />;
  }
  return (
    <span
      className={className}
      style={{ fontSize: size, lineHeight: 1 }}
      aria-hidden
    >
      {value}
    </span>
  );
}
