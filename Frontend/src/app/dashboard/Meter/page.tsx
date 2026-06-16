"use client";

import { useState } from "react";
import {
    Search, Plus, Download, Gauge, TrendingUp,
    TrendingDown, AlertTriangle, CheckCircle2,
    Clock, Droplets, Activity, Zap
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, AreaChart, Area
} from "recharts";

interface MeterReading {
    id: string;
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
}

const readings: MeterReading[] = [
    { id: "MR-001", customer_name: "Mohamed Ahmed",  branch: "Dayniile",   zone: "Gubta 1", meter_number: "MTR-1042", previous: 1240, current: 1260, consumption: 20, ml_predicted: 19, variance: +1,  status: "normal",  read_date: "2024-11-30", reader: "Omar Ali"    },
    { id: "MR-002", customer_name: "Amina Hassan",   branch: "Hodan",      zone: "Gubta 2", meter_number: "MTR-2031", previous: 980,  current: 991,  consumption: 11, ml_predicted: 13, variance: -2,  status: "normal",  read_date: "2024-11-30", reader: "Hassan Muse" },
    { id: "MR-003", customer_name: "Ali Yusuf",      branch: "Wadajir",    zone: "Gubta 3", meter_number: "MTR-3087", previous: 450,  current: 452,  consumption: 2,  ml_predicted: 8,  variance: -6,  status: "anomaly", read_date: "2024-11-30", reader: "Omar Ali"    },
    { id: "MR-004", customer_name: "Faadumo Omar",   branch: "Hawlwadaag", zone: "Gubta 1", meter_number: "MTR-4015", previous: 720,  current: 726,  consumption: 6,  ml_predicted: 6,  variance: 0,   status: "normal",  read_date: "2024-11-29", reader: "Farah Aden"  },
    { id: "MR-005", customer_name: "Abdullahi Muse", branch: "Dayniile",   zone: "Gubta 4", meter_number: "MTR-1093", previous: 330,  current: 333,  consumption: 3,  ml_predicted: 3,  variance: 0,   status: "normal",  read_date: "2024-11-29", reader: "Hassan Muse" },
    { id: "MR-006", customer_name: "Hodan Ibrahim",  branch: "Hodan",      zone: "Gubta 2", meter_number: "MTR-2076", previous: 890,  current: 898,  consumption: 8,  ml_predicted: 5,  variance: +3,  status: "high",    read_date: "2024-11-29", reader: "Farah Aden"  },
    { id: "MR-007", customer_name: "Ismail Farah",   branch: "Wadajir",    zone: "Gubta 1", meter_number: "MTR-3044", previous: 1100, current: 1114, consumption: 14, ml_predicted: 13, variance: +1,  status: "normal",  read_date: "2024-11-28", reader: "Omar Ali"    },
    { id: "MR-008", customer_name: "Sahra Warsame",  branch: "Hawlwadaag", zone: "Gubta 3", meter_number: "MTR-4062", previous: 560,  current: 567,  consumption: 7,  ml_predicted: 9,  variance: -2,  status: "normal",  read_date: "2024-11-28", reader: "Farah Aden"  },
];

// ML prediction trend per customer (history)
const predictionHistory = [
    { month: "Jun", actual: 18, predicted: 17 },
    { month: "Jul", actual: 22, predicted: 20 },
    { month: "Aug", actual: 25, predicted: 24 },
    { month: "Sep", actual: 20, predicted: 19 },
    { month: "Oct", actual: 15, predicted: 16 },
    { month: "Nov", actual: 13, predicted: 14 },
];

const zoneConsumption = [
    { zone: "Dayniile",   actual: 23, predicted: 22 },
    { zone: "Hodan",      actual: 19, predicted: 18 },
    { zone: "Wadajir",    actual: 16, predicted: 21 },
    { zone: "Hawlwadaag", actual: 13, predicted: 15 },
];

const statusConfig = {
    normal:  { label: "Normal",  icon: <CheckCircle2   className="w-3.5 h-3.5" />, class: "bg-green-50 text-green-600 dark:bg-green-900/20"  },
    high:    { label: "High",    icon: <TrendingUp     className="w-3.5 h-3.5" />, class: "bg-amber-50  text-amber-600  dark:bg-amber-900/20"  },
    anomaly: { label: "Anomaly", icon: <AlertTriangle  className="w-3.5 h-3.5" />, class: "bg-red-50    text-red-600    dark:bg-red-900/20"    },
};

export default function MeterReadingsPage() {
    const [searchTerm,   setSearchTerm]   = useState("");
    const [filterStatus, setFilterStatus] = useState<"all" | "normal" | "high" | "anomaly">("all");
    const [selectedRow,  setSelectedRow]  = useState<string | null>(null);

    const filtered = readings.filter((r) => {
        const matchSearch =
            r.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.meter_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.branch.toLowerCase().includes(searchTerm.toLowerCase());
        const matchStatus = filterStatus === "all" || r.status === filterStatus;
        return matchSearch && matchStatus;
    });

    const totalConsumption = readings.reduce((s, r) => s + r.consumption, 0);
    const totalPredicted   = readings.reduce((s, r) => s + r.ml_predicted, 0);
    const anomalies        = readings.filter((r) => r.status === "anomaly").length;
    const accuracy         = (
        (readings.filter((r) => Math.abs(r.variance) <= 2).length / readings.length) * 100
    ).toFixed(1);

    return (
        <div className="space-y-6">

            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold font-heading text-slate-800 dark:text-slate-100">
                        Meter Readings
                    </h2>
                    <p className="text-slate-500 text-sm mt-1">
                        Live readings with ML prediction comparison and anomaly detection.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="gap-2 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                        <Download className="w-4 h-4" />
                        Export CSV
                    </Button>
                    {/* <Button className="gap-2 shadow-lg shadow-primary/20">
                        <Plus className="w-4 h-4" />
                        Add Reading
                    </Button> */}
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: "Total Consumption", value: `${totalConsumption} m³`, sub: "This month",    color: "text-teal-600",   bg: "bg-teal-50  dark:bg-teal-900/20",   icon: <Droplets      className="w-5 h-5 text-teal-500"   /> },
                    { label: "ML Predicted",       value: `${totalPredicted} m³`,  sub: "This month",    color: "text-blue-600",   bg: "bg-blue-50  dark:bg-blue-900/20",   icon: <Zap           className="w-5 h-5 text-blue-500"   /> },
                    { label: "Model Accuracy",     value: `${accuracy}%`,          sub: "±2m³ tolerance", color: "text-green-600",  bg: "bg-green-50 dark:bg-green-900/20",  icon: <Activity      className="w-5 h-5 text-green-500"  /> },
                    { label: "Anomalies",          value: `${anomalies} meters`,   sub: "Need review",   color: "text-red-600",    bg: "bg-red-50   dark:bg-red-900/20",    icon: <AlertTriangle className="w-5 h-5 text-red-500"    /> },
                ].map((s, i) => (
                    <Card key={i}>
                        <CardContent className="p-4 flex items-center gap-3">
                            <div className={`p-2.5 rounded-lg ${s.bg}`}>{s.icon}</div>
                            <div>
                                <p className="text-xs text-slate-500">{s.label}</p>
                                <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
                                <p className="text-xs text-slate-400">{s.sub}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* ML Prediction History */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-base">Actual vs ML Predicted (m³)</CardTitle>
                            <div className="flex items-center gap-4 text-xs text-slate-500">
                                <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-teal-500 inline-block rounded" /> Actual</span>
                                <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-amber-400 border-dashed inline-block rounded" /> Predicted</span>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[220px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={predictionHistory}>
                                    <defs>
                                        <linearGradient id="actualGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%"  stopColor="#0F766E" stopOpacity={0.15} />
                                            <stop offset="95%" stopColor="#0F766E" stopOpacity={0}    />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
                                        formatter={(v: any, name?: string | number) => [String(v) + ' m³', String(name === 'actual' ? 'Actual' : name === 'predicted' ? 'ML Predicted' : name ?? '')]}
                                    />
                                    <Area  type="monotone" dataKey="actual"    stroke="#0F766E" strokeWidth={2.5} fill="url(#actualGrad)" dot={{ r: 4, fill: '#0F766E' }} />
                                    <Line  type="monotone" dataKey="predicted" stroke="#F59E0B" strokeWidth={2}   strokeDasharray="5 4"   dot={{ r: 3, fill: '#F59E0B' }} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Zone Comparison */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-base">Zone Consumption vs Prediction</CardTitle>
                            <span className="text-xs text-slate-400">November 2024</span>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[220px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={zoneConsumption}>
                                    <defs>
                                        <linearGradient id="zoneGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%"  stopColor="#3B82F6" stopOpacity={0.15} />
                                            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}    />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="zone" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
                                        formatter={(v: any, name?: string | number) => [String(v) + ' m³', String(name === 'actual' ? 'Actual' : name === 'predicted' ? 'ML Predicted' : name ?? '')]}
                                    />
                                    <Area type="monotone" dataKey="actual"    stroke="#3B82F6" strokeWidth={2.5} fill="url(#zoneGrad)" dot={{ r: 4, fill: '#3B82F6' }} />
                                    <Line type="monotone" dataKey="predicted" stroke="#EC4899" strokeWidth={2}   strokeDasharray="5 4"  dot={{ r: 3, fill: '#EC4899' }} />
                                </AreaChart>
                            </ResponsiveContainer>
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
                                    <th className="px-4 py-4">#</th>
                                    <th className="px-4 py-4">Meter No.</th>
                                    <th className="px-4 py-4">Customer</th>
                                    <th className="px-4 py-4">Branch / Zone</th>
                                    <th className="px-4 py-4 text-right">Prev (m³)</th>
                                    <th className="px-4 py-4 text-right">Current (m³)</th>
                                    <th className="px-4 py-4 text-right">Used (m³)</th>
                                    <th className="px-4 py-4 text-right">ML Pred.</th>
                                    <th className="px-4 py-4 text-center">Variance</th>
                                    <th className="px-4 py-4 text-center">Status</th>
                                    <th className="px-4 py-4">Read Date</th>
                                    <th className="px-4 py-4">Reader</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan={12} className="px-6 py-10 text-center text-slate-400">
                                            No readings found.
                                        </td>
                                    </tr>
                                ) : (
                                    filtered.map((r, index) => {
                                        const status = statusConfig[r.status];
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
                                                <td className="px-4 py-4 text-slate-400 text-xs">{index + 1}</td>
                                                <td className="px-4 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <Gauge className="w-4 h-4 text-primary/60" />
                                                        <span className="font-mono text-xs font-semibold text-primary">{r.meter_number}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4 font-medium text-slate-900 dark:text-slate-100 whitespace-nowrap">
                                                    {r.customer_name}
                                                </td>
                                                <td className="px-4 py-4">
                                                    <div className="text-xs">
                                                        <p className="font-medium text-slate-700 dark:text-slate-300">{r.branch}</p>
                                                        <p className="text-slate-400">{r.zone}</p>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4 text-right text-slate-500 font-mono text-xs">{r.previous}</td>
                                                <td className="px-4 py-4 text-right text-slate-700 dark:text-slate-200 font-mono text-xs font-semibold">{r.current}</td>
                                                <td className="px-4 py-4 text-right font-bold text-teal-600">{r.consumption}</td>
                                                <td className="px-4 py-4 text-right font-semibold text-blue-500">{r.ml_predicted}</td>
                                                <td className="px-4 py-4 text-center">
                                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                                                        r.variance === 0
                                                            ? "text-slate-500"
                                                            : r.variance > 0
                                                                ? "text-amber-600 bg-amber-50 dark:bg-amber-900/20"
                                                                : "text-blue-600 bg-blue-50 dark:bg-blue-900/20"
                                                    }`}>
                                                        {r.variance > 0 ? <TrendingUp  className="w-3 h-3" /> : r.variance < 0 ? <TrendingDown className="w-3 h-3" /> : null}
                                                        {r.variance > 0 ? `+${r.variance}` : r.variance === 0 ? "±0" : r.variance}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4 text-center">
                                                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${status.class}`}>
                                                        {status.icon}
                                                        {status.label}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4 text-slate-500 text-xs whitespace-nowrap">{r.read_date}</td>
                                                <td className="px-4 py-4 text-slate-500 text-xs whitespace-nowrap">{r.reader}</td>
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
                            Total: {totalConsumption} m³ consumed
                        </span>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}