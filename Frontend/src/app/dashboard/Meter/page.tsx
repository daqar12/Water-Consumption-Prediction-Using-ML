"use client";

import { useState, useEffect } from "react";
import {
    Search, Download, Gauge, TrendingUp,
    TrendingDown, AlertTriangle, CheckCircle2,
    Clock, Droplets, Activity, Zap, RefreshCcw, Loader2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, AreaChart, Area,
    BarChart, Bar, PieChart, Pie, Cell, Legend
} from "recharts";

const FASTAPI_BASE = "http://127.0.0.1:8000";

interface MeterReading {
    id: number;
    customer_id: number | null;
    customer_name: string;
    branch: string;
    zone: string;
    meter_number: string;
    previous: number;
    current: number;
    consumption: number;
    ml_predicted: number;
    variance: number;
    status: "normal" | "high" | "anomaly";
    read_date: string;
    reader: string;
    notes: string | null;
    created_at: string;
}

const statusConfig = {
    normal:  { label: "Normal",  icon: <CheckCircle2   className="w-3.5 h-3.5" />, class: "bg-green-50 text-green-600 dark:bg-green-900/20"  },
    high:    { label: "High",    icon: <TrendingUp     className="w-3.5 h-3.5" />, class: "bg-amber-50  text-amber-600  dark:bg-amber-900/20"  },
    anomaly: { label: "Anomaly", icon: <AlertTriangle  className="w-3.5 h-3.5" />, class: "bg-red-50    text-red-600    dark:bg-red-900/20"    },
};

export default function MeterReadingsPage() {
    const [readings, setReadings] = useState<MeterReading[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState<"all" | "normal" | "high" | "anomaly">("all");
    const [selectedRow, setSelectedRow] = useState<number | null>(null);

    // Fetch all predictions from the FastAPI backend
    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);
            // Fetch a large limit to gather all prediction records for the statistics and graphs
            const res = await fetch(`${FASTAPI_BASE}/predictions?limit=1000&sort_order=desc`);
            if (!res.ok) {
                throw new Error("Failed to load meter predictions data");
            }
            const result = await res.json();
            setReadings(result.data || []);
        } catch (err: any) {
            setError(err.message || "Something went wrong while connecting to the database.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Filter logic
    const filtered = readings.filter((r) => {
        const matchSearch =
            r.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.meter_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.branch.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.zone.toLowerCase().includes(searchTerm.toLowerCase());
        const matchStatus = filterStatus === "all" || r.status === filterStatus;
        return matchSearch && matchStatus;
    });

    // Dynamic Statistics Calculation
    const totalPredictions = readings.length;
    const avgPrediction = totalPredictions > 0
        ? (readings.reduce((sum, r) => sum + r.ml_predicted, 0) / totalPredictions).toFixed(2)
        : "0.00";
    const highestPrediction = totalPredictions > 0
        ? Math.max(...readings.map(r => r.ml_predicted)).toFixed(2)
        : "0.00";
    const lowestPrediction = totalPredictions > 0
        ? Math.min(...readings.map(r => r.ml_predicted)).toFixed(2)
        : "0.00";

    // Today's Predictions
    const todayStr = new Date().toISOString().split('T')[0];
    const todaysPredictions = readings.filter(r => {
        const d = new Date(r.created_at).toISOString().split('T')[0];
        return d === todayStr;
    }).length;

    // This Month's Predictions
    const thisMonthStr = new Date().toISOString().substring(0, 7);
    const thisMonthPredictions = readings.filter(r => {
        return r.created_at.substring(0, 7) === thisMonthStr;
    }).length;

    // Unique Branches and Zones
    const totalBranches = new Set(readings.map(r => r.branch)).size;
    const totalZones = new Set(readings.map(r => r.zone)).size;

    // ── CHARTS DATA PREPARATION ──

    // 1. Prediction Trend (Line Chart)
    const predictionTrendData = [...readings]
        .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
        .map(r => ({
            date: new Date(r.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
            prediction: Math.round(r.ml_predicted * 100) / 100
        }));

    // 2. September vs October vs Predicted November (Line Chart)
    const tripleComparisonData = [...readings]
        .slice(0, 8)
        .reverse()
        .map(r => ({
            name: `PRD-${r.id}`,
            september: r.previous, // september_consumption mapped to previous
            october: r.current,     // october_consumption mapped to current
            predicted: r.ml_predicted
        }));

    // 3. Branch Comparison (Bar Chart)
    const branchPredictions: Record<string, { total: number; count: number }> = {};
    readings.forEach(r => {
        if (!branchPredictions[r.branch]) {
            branchPredictions[r.branch] = { total: 0, count: 0 };
        }
        branchPredictions[r.branch].total += r.ml_predicted;
        branchPredictions[r.branch].count += 1;
    });
    const branchComparisonData = Object.entries(branchPredictions).map(([name, val]) => ({
        name,
        average: Math.round((val.total / val.count) * 100) / 100
    }));

    // 4. Zone Comparison (Bar Chart)
    const zonePredictions: Record<string, { total: number; count: number }> = {};
    readings.forEach(r => {
        if (!zonePredictions[r.zone]) {
            zonePredictions[r.zone] = { total: 0, count: 0 };
        }
        zonePredictions[r.zone].total += r.ml_predicted;
        zonePredictions[r.zone].count += 1;
    });
    const zoneComparisonData = Object.entries(zonePredictions).map(([name, val]) => ({
        name,
        average: Math.round((val.total / val.count) * 100) / 100
    })).slice(0, 10); // Limit to top 10 zones for layout cleanliness

    // 5. Prediction Status Distribution (Pie Chart)
    const statusCounts = { Safe: 0, Warning: 0, Critical: 0 };
    readings.forEach(r => {
        if (r.status === "high") {
            statusCounts.Warning += 1;
        } else if (r.status === "anomaly") {
            statusCounts.Critical += 1;
        } else {
            statusCounts.Safe += 1;
        }
    });
    const statusDistributionData = [
        { name: "Safe", value: statusCounts.Safe, color: "#10B981" },
        { name: "Warning", value: statusCounts.Warning, color: "#F59E0B" },
        { name: "Critical", value: statusCounts.Critical, color: "#EF4444" }
    ].filter(item => item.value > 0);

    // 6. Monthly Prediction Trend
    const monthlyTotals: Record<string, number> = {};
    readings.forEach(r => {
        const monthName = new Date(r.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" });
        monthlyTotals[monthName] = (monthlyTotals[monthName] || 0) + 1;
    });
    const monthlyPredictionTrendData = Object.entries(monthlyTotals).map(([month, count]) => ({
        month,
        count
    })).reverse();

    return (
        <div className="space-y-6">

            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold font-heading text-slate-800 dark:text-slate-100">
                        Meter Readings & Analytics
                    </h2>
                    <p className="text-slate-500 text-sm mt-1">
                        Live dashboard analytics built from prediction history in PostgreSQL.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button onClick={fetchData} variant="outline" className="gap-2 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                        <RefreshCcw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                        Refresh Data
                    </Button>
                    <Button onClick={() => window.open(`${FASTAPI_BASE}/reports/export/csv`, "_blank")} className="gap-2 bg-primary text-white shadow-lg shadow-primary/20">
                        <Download className="w-4 h-4" />
                        Export CSV
                    </Button>
                </div>
            </div>

            {/* Error state */}
            {error && (
                <div className="flex items-start gap-2 p-4 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                    <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                    <div>
                        <h4 className="font-bold text-red-800 dark:text-red-400">Database Connection Error</h4>
                        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                    </div>
                </div>
            )}

            {/* Stats Cards (Calculated dynamically) */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: "Total Predictions", value: totalPredictions, sub: "All time records", color: "text-primary", bg: "bg-primary/10", icon: <Gauge className="w-5 h-5" /> },
                    { label: "Average Prediction", value: `${avgPrediction} m³`, sub: "November water", color: "text-teal-600", bg: "bg-teal-50 dark:bg-teal-900/20", icon: <Droplets className="w-5 h-5" /> },
                    { label: "Highest Prediction", value: `${highestPrediction} m³`, sub: "Max usage forecast", color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-900/20", icon: <TrendingUp className="w-5 h-5" /> },
                    { label: "Lowest Prediction", value: `${lowestPrediction} m³`, sub: "Min usage forecast", color: "text-orange-600", bg: "bg-orange-50 dark:bg-orange-900/20", icon: <TrendingDown className="w-5 h-5" /> },
                    { label: "Today's Predictions", value: todaysPredictions, sub: "Generated today", color: "text-purple-600", bg: "bg-purple-50 dark:bg-purple-900/20", icon: <Clock className="w-5 h-5" /> },
                    { label: "This Month's Predictions", value: thisMonthPredictions, sub: "Generated this month", color: "text-indigo-600", bg: "bg-indigo-50 dark:bg-indigo-900/20", icon: <Activity className="w-5 h-5" /> },
                    { label: "Total Branches", value: totalBranches, sub: "Covered regions", color: "text-green-600", bg: "bg-green-50 dark:bg-green-900/20", icon: <CheckCircle2 className="w-5 h-5" /> },
                    { label: "Total Zones", value: totalZones, sub: "Distinct sectors", color: "text-pink-600", bg: "bg-pink-50 dark:bg-pink-900/20", icon: <Zap className="w-5 h-5" /> },
                ].map((s, i) => (
                    <Card key={i}>
                        <CardContent className="p-4 flex items-center gap-3">
                            <div className={`p-2.5 rounded-lg ${s.bg} ${s.color}`}>{s.icon}</div>
                            <div>
                                <p className="text-xs text-slate-500">{s.label}</p>
                                <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                                <p className="text-[10px] text-slate-400">{s.sub}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* 1. Prediction Trend (Line Chart) */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Prediction Trend (November Forecasts)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[220px]">
                            {loading ? (
                                <div className="flex items-center justify-center h-full"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
                            ) : predictionTrendData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={predictionTrendData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                                        <Tooltip contentStyle={{ borderRadius: '8px', border: 'none' }} />
                                        <Line type="monotone" dataKey="prediction" stroke="#0F766E" strokeWidth={2.5} dot={{ r: 3 }} name="Prediction" />
                                    </LineChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex items-center justify-center h-full text-slate-400 text-xs">No prediction history database records found.</div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* 2. September vs October vs Predicted November */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">September vs October vs Predicted November (m³)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[220px]">
                            {loading ? (
                                <div className="flex items-center justify-center h-full"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
                            ) : tripleComparisonData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={tripleComparisonData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                                        <Tooltip contentStyle={{ borderRadius: '8px', border: 'none' }} />
                                        <Legend />
                                        <Line type="monotone" dataKey="september" stroke="#3B82F6" strokeWidth={2} name="September" />
                                        <Line type="monotone" dataKey="october" stroke="#F59E0B" strokeWidth={2} name="October" />
                                        <Line type="monotone" dataKey="predicted" stroke="#10B981" strokeWidth={2.5} strokeDasharray="4 3" name="Predicted November" />
                                    </LineChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex items-center justify-center h-full text-slate-400 text-xs">No prediction history database records found.</div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* 3. Branch Comparison (Bar Chart) */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Branch Comparison (Avg November Prediction)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[220px]">
                            {loading ? (
                                <div className="flex items-center justify-center h-full"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
                            ) : branchComparisonData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={branchComparisonData} barSize={25}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                                        <Tooltip contentStyle={{ borderRadius: '8px', border: 'none' }} />
                                        <Bar dataKey="average" fill="#0F766E" radius={[4, 4, 0, 0]} name="Average Forecast" />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex items-center justify-center h-full text-slate-400 text-xs">No prediction history database records found.</div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* 4. Zone Comparison (Bar Chart) */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Zone Comparison (Avg Prediction - Top 10)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[220px]">
                            {loading ? (
                                <div className="flex items-center justify-center h-full"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
                            ) : zoneComparisonData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={zoneComparisonData} barSize={20}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 8 }} angle={-25} textAnchor="end" height={45} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                                        <Tooltip contentStyle={{ borderRadius: '8px', border: 'none' }} />
                                        <Bar dataKey="average" fill="#3B82F6" radius={[4, 4, 0, 0]} name="Average Forecast" />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex items-center justify-center h-full text-slate-400 text-xs">No prediction history database records found.</div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* 5. Prediction Status Distribution */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Prediction Status Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[220px] flex items-center justify-center">
                            {loading ? (
                                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                            ) : statusDistributionData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={statusDistributionData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={85}
                                            paddingAngle={4}
                                            dataKey="value"
                                        >
                                            {statusDistributionData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip contentStyle={{ borderRadius: '8px', border: 'none' }} />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="text-slate-400 text-xs">No prediction history database records found.</div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* 6. Monthly Prediction Trend */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Monthly Prediction Totals</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[220px]">
                            {loading ? (
                                <div className="flex items-center justify-center h-full"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
                            ) : monthlyPredictionTrendData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={monthlyPredictionTrendData} barSize={25}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                                        <Tooltip contentStyle={{ borderRadius: '8px', border: 'none' }} />
                                        <Bar dataKey="count" fill="#8B5CF6" radius={[4, 4, 0, 0]} name="Prediction Count" />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex items-center justify-center h-full text-slate-400 text-xs">No prediction history database records found.</div>
                            )}
                        </div>
                    </CardContent>
                </Card>

            </div>

            {/* Table */}
            <Card>
                <CardContent className="p-0">

                    {/* Toolbar */}
                    <div className="p-4 border-b dark:border-slate-800 flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
                        <div className="relative max-w-sm w-full">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search by name, meter, branch..."
                                className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                            />
                        </div>
                        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                            {(["all", "normal", "high", "anomaly"] as const).map((s) => (
                                <button
                                    key={s}
                                    onClick={() => setFilterStatus(s)}
                                    className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-all ${
                                        filterStatus === s
                                            ? "bg-white dark:bg-slate-700 text-primary shadow-sm"
                                            : "text-slate-500 hover:text-slate-700"
                                    }`}
                                >
                                    {s === "all" ? "All" : s}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-800/50 border-b dark:border-slate-800">
                                <tr>
                                    {/* <th className="px-4 py-4">ID</th> */}
                                    <th className="px-4 py-4">Mtr No</th>
                                    <th className="px-4 py-4">Branch</th>
                                    <th className="px-4 py-4 ">Zone</th>
                                    <th className="px-4 py-4 text-right">September (m³)</th>
                                    <th className="px-4 py-4 text-right">October (m³)</th>
                                    <th className="px-4 py-4 text-right">Predicted November (m³)</th>
                                    <th className="px-4 py-4 text-right">Final Prediction</th>
                                    {/* <th className="px-4 py-4 text-center">Variance</th> */}
                                    <th className="px-4 py-4 text-center">Status</th>
                                   
                                    <th className="px-4 py-4">Read Date</th>
                                    {/* <th className="px-4 py-4">Reader</th> */}
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={13} className="px-6 py-10 text-center text-slate-400">
                                            <div className="flex items-center justify-center gap-2">
                                                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                                                Loading meter readings from database...
                                            </div>
                                        </td>
                                    </tr>
                                ) : filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan={13} className="px-6 py-10 text-center text-slate-400">
                                            No readings found. Use the ML Predictions tab to generate records.
                                        </td>
                                    </tr>
                                ) : (
                                    filtered.map((r, index) => {
                                        const status = statusConfig[r.status] || { label: r.status, class: "bg-slate-100 text-slate-700", icon: null };
                                        const isSelected = selectedRow === r.id;
                                        return (
                                            <tr
                                                key={r.id}
                                                onClick={() => setSelectedRow(isSelected ? null : r.id)}
                                                className={`border-b last:border-0 dark:border-slate-800 cursor-pointer transition-colors ${
                                                    isSelected
                                                        ? "bg-primary/5 dark:bg-primary/10"
                                                        : "hover:bg-slate-50/50 dark:hover:bg-slate-800/20"
                                                }`}
                                            >
                                            
                                                {/* <td className="px-4 py-4 text-slate-400 text-xs">{index + 1}</td> */}
                                                <td className="px-4 py-4 font-small text-blue-600 dark:text-blue-400">{r.meter_number}</td>
                                                <td className="px-4 py-4 font-medium text-slate-800 dark:text-slate-100">{r.branch}</td>
                                                <td className="px-4 py-4 font-medium text-slate-800 dark:text-slate-100">{r.zone}</td>
                                                {/* <td className="px-4 py-4">
                                                    <div className="text-xs">
                                                        <p className="font-medium text-slate-700 dark:text-slate-300">{r.branch}</p>
                                                        <p className="text-slate-400">{r.zone}</p>
                                                    </div>
                                                </td> */}
                                                <td className="px-4 py-4 text-right text-slate-700 dark:text-slate-200 font-mono text-xs font-semibold">{r.previous}</td>
                                                <td className="px-4 py-4 text-right text-slate-700 dark:text-slate-200 font-mono text-xs font-semibold">{r.current}</td>
                                                <td className="px-4 py-4 text-right font-bold text-teal-600">{r.ml_predicted.toFixed(2)}</td>
                                                <td className="px-4 py-4 text-right font-semibold text-blue-500">{r.ml_predicted.toFixed(2)}</td>
                                                {/* <td className="px-4 py-4 text-center">
                                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                                                        r.variance === 0
                                                            ? "text-slate-500"
                                                            : r.variance > 0
                                                                ? "text-amber-600 bg-amber-50 dark:bg-amber-900/20"
                                                                : "text-blue-600 bg-blue-50 dark:bg-blue-900/20"
                                                    }`}>
                                                        {r.variance > 0 ? <TrendingUp className="w-3 h-3" /> : r.variance < 0 ? <TrendingDown className="w-3 h-3" /> : null}
                                                        {r.variance > 0 ? `+${r.variance.toFixed(2)}` : r.variance === 0 ? "±0" : r.variance.toFixed(2)}
                                                    </span>
                                                </td> */}
                                                <td className="px-4 py-4 text-center">
                                                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${status.class}`}>
                                                        {status.icon}
                                                        {status.label}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4 text-slate-500 text-xs whitespace-nowrap">{r.read_date}</td>
                                                {/* <td className="px-4 py-4 text-slate-500 text-xs whitespace-nowrap">{r.reader}</td> */}
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-3 border-t dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
                        <span>Showing {filtered.length} of {readings.length} readings</span>
                        <span className="flex items-center gap-1 text-teal-600 font-medium">
                            <Droplets className="w-3.5 h-3.5" />
                            Total: {totalPredictions} records
                        </span>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}