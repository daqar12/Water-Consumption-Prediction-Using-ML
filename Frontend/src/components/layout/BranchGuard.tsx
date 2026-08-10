"use client";

import React, { useEffect, useState } from "react";
import { getSession } from "@/lib/session";
import { isAdminRole } from "@/lib/session";
import { AlertTriangle } from "lucide-react";

export function BranchGuard({ children }: { children: React.ReactNode }) {
    const [isAllowed, setIsAllowed] = useState<boolean | null>(null);

    useEffect(() => {
        const session = getSession();
        if (session && session.user) {
            const user = session.user as any;
            if (isAdminRole(user.role)) {
                setIsAllowed(true);
            } else {
                if (user.assigned_branch) {
                    setIsAllowed(true);
                } else {
                    setIsAllowed(false);
                }
            }
        } else {
            setIsAllowed(true); // Let other auth logic handle unauthenticated
        }
    }, []);

    if (isAllowed === null) return null; // Loading

    if (!isAllowed) {
        return (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center p-8 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 m-4 md:m-8">
                <div className="p-4 bg-amber-100 dark:bg-amber-900/30 rounded-full mb-4">
                    <AlertTriangle className="w-12 h-12 text-amber-600 dark:text-amber-500" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">
                    No Branch Assigned
                </h2>
                <p className="text-slate-500 dark:text-slate-400 max-w-md">
                    Your staff account is currently unassigned. Please contact an administrator to assign a branch to your account so you can access branch-specific features.
                </p>
            </div>
        );
    }

    return <>{children}</>;
}
