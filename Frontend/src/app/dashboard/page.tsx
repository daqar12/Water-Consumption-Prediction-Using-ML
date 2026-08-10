"use client";
import { Users, HeartHandshake, TrendingUp, TrendingDown, Clock, UserMinus } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useEffect, useState } from "react";
import { API_URL } from "@/lib/config";
import { ChartFrame } from "@/components/charts/ChartFrame";
import { authHeaders, getSession, isAdminRole } from "@/lib/session";

const FASTAPI_BASE = API_URL;

export default function DashboardPage() {
  const [customerOverview, setCustomerOverview] = useState<
    { name: string; total: number }[]
  >([]);
  const [adminStats, setAdminStats] = useState<{
    total_customers: number;
    total_users: number;
    pending_predictions: number;
    unassigned_staff: number;
  } | null>(null);
  const [staffStats, setStaffStats] = useState<{
    branch_customers: number;
    branch_zones: number;
    highest_prediction: number | null;
    pending_predictions: number;
    assigned_branch: string | null;
  } | null>(null);

  const session = getSession();
  const user = session?.user as any;
  const isAdmin = isAdminRole(user?.role);
  const userBranch = user?.assigned_branch || "";

  useEffect(() => {
    const headers = authHeaders();
    let cancelled = false;

    const load = async () => {
      const promises = [
        fetch(`${FASTAPI_BASE}/customers/overview`, { headers }),
      ];

      if (isAdmin) {
        promises.push(fetch(`${FASTAPI_BASE}/dashboard/admin-stats`, { headers }));
      } else {
        promises.push(fetch(`${FASTAPI_BASE}/dashboard/staff-stats`, { headers }));
      }

      const results = await Promise.allSettled(promises);
      const [overviewRes, statsRes] = results;

      if (cancelled) return;

      if (overviewRes.status === "fulfilled" && overviewRes.value.ok) {
        try {
          const data: { name: string; total: number }[] = await overviewRes.value.json();
          setCustomerOverview(
            data.filter(
              (item) =>
                item.name &&
                item.name.toLowerCase() !== "nan" &&
                item.name.toLowerCase() !== "null"
            )
          );
        } catch {
          setCustomerOverview([]);
        }
      } else {
        setCustomerOverview([]);
      }

      if (statsRes?.status === "fulfilled" && statsRes.value.ok) {
        try {
          const data = await statsRes.value.json();
          if (isAdmin) {
            setAdminStats(data);
          } else {
            setStaffStats(data);
          }
        } catch {
          if (isAdmin) setAdminStats(null);
          else setStaffStats(null);
        }
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold font-heading text-slate-800 dark:text-slate-100">
          {isAdmin ? "Dashboard Overview" : `${userBranch} Dashboard`}
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {isAdmin ? (
          <>
            <StatCard
              title="Total Customers"
              value={adminStats ? adminStats.total_customers.toLocaleString() : "..."}
              icon={<Users className="w-6 h-6" />}
              subtitle="Across all branches"
            />
            <StatCard
              title="Total Users"
              value={adminStats ? adminStats.total_users.toLocaleString() : "..."}
              icon={<HeartHandshake className="w-6 h-6" />}
              subtitle="Registered system users"
            />
            <StatCard
              title="Pending Predictions"
              value={adminStats ? adminStats.pending_predictions.toLocaleString() : "..."}
              icon={<Clock className="w-6 h-6" />}
              subtitle="New customers awaiting November prediction"
            />
            <StatCard
              title="Unassigned Staff"
              value={adminStats ? adminStats.unassigned_staff.toLocaleString() : "..."}
              icon={<UserMinus className="w-6 h-6" />}
              subtitle={adminStats && adminStats.unassigned_staff === 0 ? "All staff assigned" : "Staff waiting for branch assignment"}
            />
          </>
        ) : (
          <>
            <StatCard
              title="Branch Customers"
              value={!staffStats ? "..." : staffStats.branch_customers.toLocaleString()}
              icon={<Users className="w-6 h-6" />}
              subtitle={staffStats?.assigned_branch ? `Customers in ${staffStats.assigned_branch}` : (staffStats ? "No branch assigned. Contact an administrator." : "")}
            />
            <StatCard
              title="Branch Zones"
              value={!staffStats ? "..." : staffStats.branch_zones.toLocaleString()}
              icon={<HeartHandshake className="w-6 h-6" />}
              subtitle={staffStats?.assigned_branch ? `Zones in ${staffStats.assigned_branch}` : (staffStats ? "No branch assigned. Contact an administrator." : "")}
            />
            <StatCard
              title="Highest Prediction"
              value={!staffStats ? "..." : (staffStats.highest_prediction !== null ? `${staffStats.highest_prediction} m³` : "—")}
              icon={<TrendingUp className="w-6 h-6" />}
              subtitle={staffStats?.assigned_branch ? (staffStats.highest_prediction !== null ? "Highest prediction in your branch" : "No predictions yet") : (staffStats ? "No branch assigned. Contact an administrator." : "")}
            />
            <StatCard
              title="Pending Predictions"
              value={!staffStats ? "..." : staffStats.pending_predictions.toLocaleString()}
              icon={<Clock className="w-6 h-6" />}
              subtitle={staffStats?.assigned_branch ? "Awaiting November prediction" : (staffStats ? "No branch assigned. Contact an administrator." : "")}
            />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{isAdmin ? "Branch Overview" : "Customers by Zone"}</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartFrame>
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={280}>
                <BarChart data={customerOverview}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#64748b" }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#64748b" }}
                    tickFormatter={(value) => value.toLocaleString()}
                  />
                  <Tooltip
                    cursor={{ fill: "#f1f5f9" }}
                    contentStyle={{
                      borderRadius: "8px",
                      border: "none",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                    formatter={(value: any, name?: any) => [
                      String(value ?? "").toLocaleString(),
                      String(name ?? "Customers"),
                    ]}
                  />
                  <Bar dataKey="total" fill="#1104ffff" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartFrame>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
