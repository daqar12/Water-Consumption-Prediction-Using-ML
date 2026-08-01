"use client";

import { ClientOnly } from "@/components/ClientOnly";

/** Shared chart shell with fixed height so Recharts can measure correctly. */
export function ChartFrame({
  children,
  className = "h-[300px] w-full min-h-[280px] min-w-0",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <ClientOnly
      fallback={
        <div
          className={`${className} animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800/60`}
          aria-hidden
        />
      }
    >
      <div className={className}>{children}</div>
    </ClientOnly>
  );
}
