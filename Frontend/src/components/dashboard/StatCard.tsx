import { Card, CardContent } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    trend?: {
        value: string;
        isPositive: boolean;
    };
}

export function StatCard({ title, value, icon, trend }: StatCardProps) {
    return (
        <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                            {title}
                        </p>
                        <h3 className="text-3xl font-bold font-heading mt-2 text-slate-800 dark:text-slate-100">
                            {value}
                        </h3>
                        {trend && (
                            <p className="mb-0 mt-2 text-sm">
                                <span
                                    className={cn(
                                        "font-medium",
                                        trend.isPositive ? "text-success" : "text-danger"
                                    )}
                                >
                                    {trend.isPositive ? "+" : "-"}
                                    {trend.value}
                                </span>{" "}
                                <span className="text-slate-500">vs last month</span>
                            </p>
                        )}
                    </div>
                    <div className="p-4 bg-primary/10 rounded-2xl text-primary">
                        {icon}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
