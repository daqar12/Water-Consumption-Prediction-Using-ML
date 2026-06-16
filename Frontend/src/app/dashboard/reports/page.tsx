"use client";

import { useState } from "react";
import {
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
    BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line
} from "recharts";
import { Download, FileText, Filter, Droplets, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

// Mock data - Water Bill ML System
const zoneDistribution = [
    { name: "Dayniile", value: 3200 },
    { name: "Hodan", value: 2800 },
    { name: "Wadajir", value: 1900 },
    { name: "Hawlwadaag", value: 1400 },
];

const predictionAccuracy = [
    { name: "Sep", actual: 420, predicted: 410 },
    { name: "Oct", actual: 380, predicted: 390 },
    { name: "Nov", actual: 450, predicted: 440 },
    { name: "Dec", actual: 500, predicted: 490 },
    { name: "Jan", actual: 470, predicted: 465 },
    { name: "Feb", actual: 510, predicted: 520 },
];

const consumptionByZone = [
    { name: "Dayniile", september: 420, october: 380, november: 450 },
    { name: "Hodan", september: 310, october: 290, november: 330 },
    { name: "Wadajir", september: 280, october: 260, november: 300 },
    { name: "Hawlwadaag", september: 190, october: 175, november: 210 },
];

const COLORS = ["#0F766E", "#F59E0B", "#3B82F6", "#EC4899"];

const reports = [
    { name: "ML Model Accuracy Report - Q4 2024", date: "Dec 2024" },
    { name: "Water Consumption Prediction Summary", date: "Nov 2024" },
    { name: "Zone-wise Billing Forecast", date: "Nov 2024" },
    { name: "Anomaly Detection Report", date: "Oct 2024" },
    { name: "Customer Consumption Patterns", date: "Oct 2024" },
];

const statsCards = [
    { label: "Model Accuracy", value: "74.3%", icon: <TrendingUp className="w-5 h-5" />, color: "text-green-600", bg: "bg-green-50 dark:bg-green-900/20" },
    { label: "Predictions Made", value: "11,048", icon: <Droplets className="w-5 h-5" />, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-900/20" },
    { label: "Anomalies Detected", value: "127", icon: <AlertTriangle className="w-5 h-5" />, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-900/20" },
    { label: "Validated Predictions", value: "10,921", icon: <CheckCircle className="w-5 h-5" />, color: "text-teal-600", bg: "bg-teal-50 dark:bg-teal-900/20" },
];

export default function ReportsPage() {
    const [activeMonth, setActiveMonth] = useState("All");
    const months = ["All", "September", "October", "November"];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold font-heading text-slate-800 dark:text-slate-100">
                        Water Bill Prediction Reports
                    </h2>
                    <p className="text-slate-500 text-sm mt-1">
                        ML-based water consumption analytics and billing forecasts.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                        {months.map((m) => (
                            <button
                                key={m}
                                onClick={() => setActiveMonth(m)}
                                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${activeMonth === m
                                        ? "bg-white dark:bg-slate-700 text-primary shadow-sm"
                                        : "text-slate-500 hover:text-slate-700"
                                    }`}
                            >
                                {m}
                            </button>
                        ))}
                    </div>
                    <Button className="gap-2 shadow-lg shadow-primary/20">
                        <Download className="w-4 h-4" />
                        Export
                    </Button>
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {statsCards.map((stat, idx) => (
                    <Card key={idx}>
                        <CardContent className="p-4 flex items-center gap-4">
                            <div className={`p-2.5 rounded-lg ${stat.bg} ${stat.color}`}>
                                {stat.icon}
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">{stat.label}</p>
                                <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Prediction vs Actual */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-lg">Predicted vs Actual Consumption (m³)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[260px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={predictionAccuracy}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                    <Legend />
                                    <Line type="monotone" dataKey="actual" stroke="#0F766E" strokeWidth={2.5} dot={{ r: 4 }} name="Actual" />
                                    <Line type="monotone" dataKey="predicted" stroke="#F59E0B" strokeWidth={2.5} strokeDasharray="5 5" dot={{ r: 4 }} name="Predicted" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Zone Distribution Pie */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Customers by Zone</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[260px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={zoneDistribution}
                                        cx="50%"
                                        cy="45%"
                                        innerRadius={65}
                                        outerRadius={95}
                                        paddingAngle={4}
                                        dataKey="value"
                                    >
                                        {zoneDistribution.map((_, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        // Accept name as string|number and coerce to string for label
                                        formatter={(value: any, name?: string | number) => [String(value).toLocaleString(), String(name ?? "Customers")]}
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Legend verticalAlign="bottom" height={36} iconSize={10} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Consumption by Zone Bar */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-lg">Monthly Consumption by Zone (m³)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[260px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={consumptionByZone}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                    <Legend />
                                    <Bar dataKey="september" fill="#0F766E" radius={[4, 4, 0, 0]} name="September" />
                                    <Bar dataKey="october" fill="#F59E0B" radius={[4, 4, 0, 0]} name="October" />
                                    <Bar dataKey="november" fill="#3B82F6" radius={[4, 4, 0, 0]} name="November" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Generated Reports */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Generated Reports</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {reports.map((report, idx) => (
                            <div
                                key={idx}
                                className="flex items-center justify-between p-2.5 border border-slate-100 dark:border-slate-800 rounded-lg group hover:border-primary/50 transition-colors"
                            >
                                <div className="flex items-center gap-2.5">
                                    <FileText className="w-4 h-4 text-slate-400 group-hover:text-primary transition-colors shrink-0" />
                                    <div>
                                        <p className="text-xs font-medium text-slate-700 dark:text-slate-300 group-hover:text-primary leading-tight">
                                            {report.name}
                                        </p>
                                        <p className="text-xs text-slate-400">{report.date}</p>
                                    </div>
                                </div>
                                <Button variant="ghost" size="icon" className="text-slate-400 group-hover:text-primary h-7 w-7 shrink-0">
                                    <Download className="w-3.5 h-3.5" />
                                </Button>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}