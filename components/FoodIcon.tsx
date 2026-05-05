"use client";

import { Icon } from "@iconify/react";
import { iconForItem } from "@/lib/food-icons";

export function FoodIcon({
  name,
  emoji,
  size = 24,
  className,
}: {
  name: string;
  emoji?: string;
  size?: number;
  className?: string;
}) {
  const icon = iconForItem(name, emoji);
  return (
    <Icon
      icon={icon}
      width={size}
      height={size}
      className={className}
      aria-label={name}
    />
  );
}
