"use client";
import { Users, HeartHandshake, BrainCircuit, TrendingUp, TrendingDown, Droplets, MapPin, Gauge } from "lucide-react";
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

const FASTAPI_BASE = "http://127.0.0.1:8000";

interface PredictionDetails {
  id: number;
  meter_number: string;
  customer_name: string;
  branch: string;
  zone: string;
  september_consumption: number;
  october_consumption: number;
  final_prediction: number;
  status: string;
  created_at: string;
}

export default function DashboardPage() {
  const [totalCustomers, setTotalCustomers] = useState<number | null>(null);
  const [totalUsers, setTotalUsers] = useState<number | null>(null);
  const [highestPrediction, setHighestPrediction] = useState<number | null>(null);
  const [highestPredictionDetails, setHighestPredictionDetails] = useState<PredictionDetails | null>(null);
  const [lowestPrediction, setLowestPrediction] = useState<number | null>(null);
  const [lowestPredictionDetails, setLowestPredictionDetails] = useState<PredictionDetails | null>(null);
  const [totalPredictions, setTotalPredictions] = useState<number | null>(null);
  const [customerOverview, setCustomerOverview] = useState<
    { name: string; total: number }[]
  >([]);

  useEffect(() => {
    fetch(`${FASTAPI_BASE}/customers/overview`)
      .then((res) => res.json())
      .then((data: { name: string; total: number }[]) => {
        const filtered = data.filter(
          (item) =>
            item.name &&
            item.name.toLowerCase() !== "nan" &&
            item.name.toLowerCase() !== "null"
        );
        setCustomerOverview(filtered);
      })
      .catch(() => setCustomerOverview([]));
  }, []);

  useEffect(() => {
    fetch(`${FASTAPI_BASE}/users/all`)
      .then((res) => res.json())
      .then((data) => setTotalUsers(data.total))
      .catch(() => setTotalUsers(0));
  }, []);

  useEffect(() => {
    fetch(`${FASTAPI_BASE}/customers/all`)
      .then((res) => res.json())
      .then((data) => setTotalCustomers(data.total))
      .catch(() => setTotalCustomers(0));
  }, []);

  useEffect(() => {
    fetch(`${FASTAPI_BASE}/reports/summary`)
      .then((res) => res.json())
      .then((data) => {
        setTotalPredictions(data.predictions_made);
        setHighestPrediction(data.highest_prediction ?? null);
        setHighestPredictionDetails(data.highest_prediction_details ?? null);
        setLowestPrediction(data.lowest_prediction ?? null);
        setLowestPredictionDetails(data.lowest_prediction_details ?? null);
      })
      .catch(() => {
        setTotalPredictions(0);
        setHighestPrediction(null);
        setHighestPredictionDetails(null);
        setLowestPrediction(null);
        setLowestPredictionDetails(null);
      });
  }, []);

  const statusColor = (status: string) => {
    switch (status) {
      case "high": return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
      case "anomaly": return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      default: return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold font-heading text-slate-800 dark:text-slate-100">
          Dashboard Overview
        </h2>
      </div>

      {/* Stats Grid */}
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

      

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Branch Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
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
                    formatter={(value: any, name?: string | number) => [
                      String(value).toLocaleString(),
                      String(name ?? "Customers"),
                    ]}
                  />
                  <Bar dataKey="total" fill="#1104ffff" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
