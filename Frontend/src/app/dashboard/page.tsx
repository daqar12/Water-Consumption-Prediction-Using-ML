"use client";
import { Users, HeartHandshake, TrendingUp, TrendingDown } from "lucide-react";
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
import { authHeaders } from "@/lib/session";

const FASTAPI_BASE = API_URL;

export default function DashboardPage() {
  const [totalCustomers, setTotalCustomers] = useState<number | null>(null);
  const [totalUsers, setTotalUsers] = useState<number | null>(null);
  const [highestPrediction, setHighestPrediction] = useState<number | null>(null);
  const [lowestPrediction, setLowestPrediction] = useState<number | null>(null);
  const [customerOverview, setCustomerOverview] = useState<
    { name: string; total: number }[]
  >([]);

  useEffect(() => {
    const headers = authHeaders();
    let cancelled = false;

    const load = async () => {
      const [overviewRes, usersRes, customersRes, summaryRes] = await Promise.allSettled([
        fetch(`${FASTAPI_BASE}/customers/overview`, { headers }),
        fetch(`${FASTAPI_BASE}/users/all`, { headers }),
        fetch(`${FASTAPI_BASE}/customers/all`, { headers }),
        fetch(`${FASTAPI_BASE}/reports/summary`, { headers }),
      ]);

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

      if (usersRes.status === "fulfilled" && usersRes.value.ok) {
        try {
          const data = await usersRes.value.json();
          setTotalUsers(data.total ?? 0);
        } catch {
          setTotalUsers(0);
        }
      } else {
        setTotalUsers(0);
      }

      if (customersRes.status === "fulfilled" && customersRes.value.ok) {
        try {
          const data = await customersRes.value.json();
          setTotalCustomers(data.total ?? 0);
        } catch {
          setTotalCustomers(0);
        }
      } else {
        setTotalCustomers(0);
      }

      if (summaryRes.status === "fulfilled" && summaryRes.value.ok) {
        try {
          const data = await summaryRes.value.json();
          setHighestPrediction(data.highest_prediction ?? null);
          setLowestPrediction(data.lowest_prediction ?? null);
        } catch {
          setHighestPrediction(null);
          setLowestPrediction(null);
        }
      } else {
        setHighestPrediction(null);
        setLowestPrediction(null);
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
          Dashboard Overview
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Customers"
          value={
            totalCustomers === null ? "..." : totalCustomers.toLocaleString()
          }
          icon={<Users className="w-6 h-6" />}
          trend={{ value: "12%", isPositive: true }}
        />
        <StatCard
          title="Total Users"
          value={totalUsers === null ? "..." : totalUsers.toLocaleString()}
          icon={<HeartHandshake className="w-6 h-6" />}
          trend={{ value: "1%", isPositive: true }}
        />
        <StatCard
          title="Highest Prediction"
          value={highestPrediction !== null ? `${highestPrediction} m³` : "..."}
          icon={<TrendingUp className="w-6 h-6" />}
        />
        <StatCard
          title="Lowest Prediction"
          value={lowestPrediction !== null ? `${lowestPrediction} m³` : "..."}
          icon={<TrendingDown className="w-6 h-6" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Branch Overview</CardTitle>
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
