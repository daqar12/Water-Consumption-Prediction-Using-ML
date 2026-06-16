"use client";
import { Users, HeartHandshake, HandCoins, Briefcase, BrainCircuit, TriangleAlert } from "lucide-react";
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
  LineChart,
  Line,
} from "recharts";
import { useEffect, useState } from "react";

const donationData = [
  { name: "Jan", total: 4000 },
  { name: "Feb", total: 3000 },
  { name: "Mar", total: 2000 },
  { name: "Apr", total: 2780 },
  { name: "May", total: 1890 },
  { name: "Jun", total: 2390 },
  { name: "Jul", total: 3490 },
];

const reliefData = [
  { name: "Week 1", beneficiaries: 120 },
  { name: "Week 2", beneficiaries: 250 },
  { name: "Week 3", beneficiaries: 180 },
  { name: "Week 4", beneficiaries: 300 },
];

const recentActivities = [
  {
    id: 1,
    action: "New Orphan Registered",
    subject: "Aisha Mohamed",
    time: "2 hours ago",
    status: "completed",
  },
  {
    id: 2,
    action: "Donation Received",
    subject: "$500 from John Doe",
    time: "5 hours ago",
    status: "completed",
  },
  {
    id: 3,
    action: "Relief Distributed",
    subject: "Food packages in Region A",
    time: "1 day ago",
    status: "pending",
  },
  {
    id: 4,
    action: "New Sponsor Joined",
    subject: "Sarah Smith",
    time: "2 days ago",
    status: "completed",
  },
];

export default function DashboardPage() {
  const [totalCustomers, setTotalCustomers] = useState<number | null>(null);
  const [totalUsers, setTotalUsers] = useState<number | null>(null);
  const [customerOverview, setCustomerOverview] = useState<
    { name: string; total: number }[]
  >([]);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/customers/overview")
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
    fetch("http://127.0.0.1:8000/users/all")
      .then((res) => res.json())
      .then((data) => setTotalUsers(data.total))
      .catch(() => setTotalUsers(0));
  }, []);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/customers/all")
      .then((res) => res.json())
      .then((data) => setTotalCustomers(data.total))
      .catch(() => setTotalCustomers(0));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold font-heading text--800 dark:text-slate-100">
          Dashboard Overview
        </h2>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
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
        {/* <StatCard
          title="Prediction Accuracy"
          value=""
          icon={<BrainCircuit className="w-6 h-6" />}
          trend={{ value: "3.2%", isPositive: true }}
        />
        <StatCard
          title="High Consumption Alerts"
          value="27"
          icon={<TriangleAlert className="w-6 h-6" />}
          trend={{ value: "8%", isPositive: false }}
        /> */}
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
                    // Recharts formatter signature: (value, name, props) => [formattedValue, label]
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
