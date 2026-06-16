"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

// We disable this linting error because the provider takes varying amount of props on next-themes versions
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function ThemeProvider({ children, ...props }: any) {
    return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
