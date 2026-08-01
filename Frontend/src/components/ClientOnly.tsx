"use client";

import { useEffect, useState, type ReactNode } from "react";

/**
 * Renders children only after mount. Prevents Recharts ResponsiveContainer
 * from measuring -1x-1 during SSR/prerender.
 */
export function ClientOnly({
  children,
  fallback = null,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <>{fallback}</>;
  return <>{children}</>;
}
