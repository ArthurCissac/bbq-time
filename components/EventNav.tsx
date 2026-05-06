"use client";

import Link from "next/link";
import { useSelectedLayoutSegment } from "next/navigation";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

const TABS: Array<{ segment: string; label: string; shortLabel?: string }> = [
  { segment: "items", label: "Items" },
  { segment: "qr", label: "QR" },
  { segment: "dashboard", label: "Dashboard", shortLabel: "Live" },
  { segment: "guests", label: "Invités" },
  { segment: "me", label: "Moi" },
];

export function EventNav({ eventId }: { eventId: string }) {
  const active = useSelectedLayoutSegment();

  return (
    <nav className="flex md:inline-flex items-center bg-secondary rounded-full p-1 gap-0.5 relative w-full md:w-auto">
      {TABS.map((tab) => {
        const isActive = active === tab.segment;
        return (
          <Link
            key={tab.segment}
            href={`/event/${eventId}/${tab.segment}`}
            className="relative flex-1 md:flex-none min-w-0 px-2.5 md:px-4 py-1.5 text-[13px] md:text-sm font-medium whitespace-nowrap text-center"
          >
            {isActive ? (
              <motion.span
                layoutId="event-nav-indicator"
                className="absolute inset-0 bg-coal rounded-full shadow-sm"
                transition={{
                  type: "spring",
                  stiffness: 380,
                  damping: 32,
                  mass: 0.8,
                }}
                aria-hidden
              />
            ) : null}
            <span
              className={cn(
                "relative z-10 transition-colors",
                isActive ? "text-ivory" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {tab.shortLabel ? (
                <>
                  <span className="md:hidden">{tab.shortLabel}</span>
                  <span className="hidden md:inline">{tab.label}</span>
                </>
              ) : (
                tab.label
              )}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
