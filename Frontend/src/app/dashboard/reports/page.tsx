"use client";

import { useState, useEffect } from "react";
import {
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
    BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line
} from "recharts";
import { Download, FileText, Filter, Droplets, TrendingUp, AlertTriangle, CheckCircle, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { authHeaders, getSession } from "@/lib/session";
import { API_URL } from "@/lib/config";
import { ClientOnly } from "@/components/ClientOnly";

const FASTAPI_BASE = API_URL;
const COLORS = ["#0F766E", "#F59E0B", "#3B82F6", "#EC4899", "#8B5CF6", "#EC4899", "#10B981"];

interface SummaryStats {
    model_accuracy: string;
    predictions_made: number;
    anomalies_detected: number;
    validated_predictions: number;
}

interface ChartData {
    branch_summary: Array<{ name: string; september: number; october: number; november: number }>;
    zone_distribution: Array<{ name: string; value: number }>;
    prediction_accuracy: Array<{ name: string; actual: number; predicted: number }>;
}

export default function ReportsPage() {
    const [stats, setStats] = useState<SummaryStats | null>(null);
    const [charts, setCharts] = useState<ChartData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState("All");
    const [exporting, setExporting] = useState<string | null>(null);
    const [exportSuccess, setExportSuccess] = useState<string | null>(null);

    const session = getSession();
    const role = (session?.user as { role?: string })?.role;

    const fetchReportData = async () => {
        try {
            setLoading(true);
            setError(null);

            const [summaryRes, chartsRes] = await Promise.all([
                fetch(`${FASTAPI_BASE}/reports/summary`, { headers: { ...authHeaders() } }),
                fetch(`${FASTAPI_BASE}/reports/charts`, { headers: { ...authHeaders() } })
            ]);

            if (!summaryRes.ok || !chartsRes.ok) {
                throw new Error("Failed to fetch reports metadata from server");
            }

            const summaryData = await summaryRes.json();
            const chartsData = await chartsRes.json();

            setStats(summaryData);
            setCharts(chartsData);
        } catch (err: any) {
            setError(err.message || "Could not retrieve live database reports.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReportData();
    }, []);

    const statsCards = stats ? [
        { label: "Model Accuracy", value: stats.model_accuracy, icon: <TrendingUp className="w-5 h-5" />, color: "text-green-600", bg: "bg-green-50 dark:bg-green-900/20" },
        { label: "Predictions Made", value: stats.predictions_made.toLocaleString(), icon: <Droplets className="w-5 h-5" />, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-900/20" },
        { label: "Anomalies Detected", value: stats.anomalies_detected.toLocaleString(), icon: <AlertTriangle className="w-5 h-5" />, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-900/20" },
        { label: "Validated Predictions", value: stats.validated_predictions.toLocaleString(), icon: <CheckCircle className="w-5 h-5" />, color: "text-teal-600", bg: "bg-teal-50 dark:bg-teal-900/20" },
    ] : [];

    const fileExtMap: Record<string, string> = { pdf: ".pdf", excel: ".xlsx", csv: ".csv" };
    const mimeMap: Record<string, string> = {
        pdf: "application/pdf",
        excel: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        csv: "text/csv",
    };

    const reports = [
        { name: "ML Model Accuracy Report - Q4 2026", date: "June 2026", format: "pdf" },
        { name: "Water Consumption Prediction Summary", date: "June 2026", format: "excel" },
        { name: "Zone-wise Billing Forecast", date: "June 2026", format: "csv" }
    ];

    const handleExport = async (format: string) => {
        try {
            setExporting(format);
            setExportSuccess(null);

            const res = await fetch(`${FASTAPI_BASE}/reports/export/${format}`, {
                headers: { ...authHeaders() },
            });
            if (!res.ok) throw new Error(`Export failed (${res.status})`);

            const blob = await res.blob();
            const ext = fileExtMap[format] || `.${format}`;
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `prediction_history_report${ext}`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);

            setExportSuccess(format);
            setTimeout(() => setExportSuccess(null), 3000);
        } catch (err: any) {
            setError(err.message || `Failed to export ${format.toUpperCase()} report.`);
        } finally {
            setExporting(null);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold font-heading text-slate-800 dark:text-slate-100">
                        {role === "staff" ? "My Reports" : "Water Consumption Prediction Reports"}
                    </h2>
                    <p className="text-slate-500 text-sm mt-1">
                        {role === "staff" 
                            ? "View and export predictions generated by your account." 
                            : "ML-based water consumption analytics and billing forecasts from PostgreSQL."}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => handleExport("pdf")}
                        disabled={exporting === "pdf"}
                        className="flex items-center justify-center gap-2 h-10 px-5 rounded-xl bg-gradient-to-r from-red-600 to-rose-500 hover:from-red-700 hover:to-rose-600 text-white font-semibold text-xs uppercase tracking-wider shadow-md shadow-red-500/20 hover:shadow-lg hover:shadow-red-500/30 transition-all duration-200 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap"
                    >
                        {exporting === "pdf" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                        {exporting === "pdf" ? "Exporting..." : "Export PDF"}
                    </button>
                    <button
                        onClick={() => handleExport("excel")}
                        disabled={exporting === "excel"}
                        className="flex items-center justify-center gap-2 h-10 px-5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-white font-semibold text-xs uppercase tracking-wider shadow-md shadow-emerald-500/20 hover:shadow-lg hover:shadow-emerald-500/30 transition-all duration-200 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap"
                    >
                        {exporting === "excel" ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                        {exporting === "excel" ? "Exporting..." : "Export Excel"}
                    </button>
                    {/* <button
                        onClick={() => handleExport("csv")}
                        disabled={exporting === "csv"}
                        className="flex items-center justify-center gap-2 h-10 px-5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-500 hover:from-blue-700 hover:to-indigo-600 text-white font-semibold text-xs uppercase tracking-wider shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-200 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap"
                    >
                        {exporting === "csv" ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                        {exporting === "csv" ? "Exporting..." : "Export CSV"}
                    </button> */}
                </div>
            </div>

            {/* Error handling */}
            {error && (
                <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 text-sm">
                    {error}
                </div>
            )}

            {/* Export success toast */}
            {exportSuccess && (
                <div className="fixed top-6 right-6 z-50 flex items-center gap-2 px-5 py-3 rounded-xl bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 shadow-lg animate-in slide-in-from-top-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-sm font-medium text-green-700 dark:text-green-300">
                        {exportSuccess.toUpperCase()} report downloaded successfully!
                    </span>
                </div>
            )}

            {/* Loading Indicator */}
            {loading && (
                <div className="flex flex-col items-center justify-center p-12 text-slate-500 gap-2">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    <p className="text-sm">Calculating reports & compiling PostgreSQL data...</p>
                </div>
            )}

            {!loading && (
                <>
                    {/* Stats Row */}
                    {/* <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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
                    </div> */}

                    {/* Charts Row 1 */}
                    <ClientOnly
                        fallback={
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <div className="lg:col-span-2 h-[320px] rounded-2xl bg-slate-100 dark:bg-slate-800/60 animate-pulse" />
                                <div className="h-[320px] rounded-2xl bg-slate-100 dark:bg-slate-800/60 animate-pulse" />
                            </div>
                        }
                    >
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Prediction vs Actual */}
                        <Card className="lg:col-span-2">
                            <CardHeader>
                                <CardTitle className="text-lg">Predicted vs Actual Consumption (m³)</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[380px]">
                                    {charts && charts.prediction_accuracy.length > 0 ? (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={charts.prediction_accuracy}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                                                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                                <Legend />
                                                <Line type="monotone" dataKey="actual" stroke="#0F766E" strokeWidth={2.5} dot={{ r: 4 }} name="Actual" />
                                                <Line type="monotone" dataKey="predicted" stroke="#F59E0B" strokeWidth={2.5} strokeDasharray="5 5" dot={{ r: 4 }} name="Predicted" />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-slate-400 text-xs">No records available for trend charts.</div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Zone Distribution Pie */}
                        <Card className="flex flex-col">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg">Predictions by Zone</CardTitle>
                            </CardHeader>
                            <CardContent className="flex-1 flex flex-col justify-between">
                                {charts && charts.zone_distribution.length > 0 ? (
                                    <>
                                        {/* Donut Chart */}
                                        <div className="h-[170px] w-full relative">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                    <Pie
                                                        data={charts.zone_distribution}
                                                        cx="50%"
                                                        cy="50%"
                                                        innerRadius={48}
                                                        outerRadius={72}
                                                        paddingAngle={3}
                                                        dataKey="value"
                                                    >
                                                        {charts.zone_distribution.map((_, index) => (
                                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip
                                                        formatter={(value: any, name?: string | number) => [String(value).toLocaleString(), String(name ?? "Predictions")]}
                                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                                    />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </div>

                                        {/* Vertical Line-by-Line Data Breakdown List */}
                                        <div className="border-t border-slate-100 dark:border-slate-800/80 pt-3 mt-2">
                                            <div className="flex items-center justify-between text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider px-2 mb-1.5">
                                                <span>Zone</span>
                                                <span>Predictions / Share</span>
                                            </div>
                                            <div className="max-h-[190px] overflow-y-auto space-y-1 pr-1 divide-y divide-slate-100 dark:divide-slate-800/40">
                                                {(() => {
                                                    const totalVal = charts.zone_distribution.reduce((acc, curr) => acc + (curr.value || 0), 0);
                                                    return charts.zone_distribution.map((item, index) => {
                                                        const pct = totalVal > 0 ? ((item.value / totalVal) * 100).toFixed(1) : "0.0";
                                                        return (
                                                            <div
                                                                key={item.name || index}
                                                                className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                                                            >
                                                                <div className="flex items-center gap-2 min-w-0">
                                                                    <span
                                                                        className="w-2.5 h-2.5 rounded-full shrink-0"
                                                                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                                                    />
                                                                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate">
                                                                        {item.name}
                                                                    </span>
                                                                </div>
                                                                <div className="flex items-center gap-2.5 shrink-0 ml-2">
                                                                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                                                                        {item.value.toLocaleString()}
                                                                    </span>
                                                                    <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 w-11 text-right">
                                                                        {pct}%
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        );
                                                    });
                                                })()}
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex items-center justify-center h-[340px] text-slate-400 text-xs">
                                        No records available for distribution charts.
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Charts Row 2 */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Consumption by Zone Bar */}
                        <Card className="lg:col-span-2">
                            <CardHeader>
                                <CardTitle className="text-lg">
                                    {role === "staff" ? "Monthly Prediction Summaries (m³)" : "Monthly Prediction Summaries by Branch (m³)"}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[260px]">
                                    {charts && charts.branch_summary.length > 0 ? (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={charts.branch_summary}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                                                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                                <Legend />
                                                <Bar dataKey="september" fill="#0F766E" radius={[4, 4, 0, 0]} name="September" />
                                                <Bar dataKey="october" fill="#F59E0B" radius={[4, 4, 0, 0]} name="October" />
                                                <Bar dataKey="november" fill="#3B82F6" radius={[4, 4, 0, 0]} name="Predicted Nov" />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-slate-400 text-xs">No records available.</div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Generated Reports */}
                        {/* <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Download Live Reports</CardTitle>
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
                                        <Button onClick={() => handleExport(report.format)} disabled={exporting === report.format} variant="ghost" size="icon" className="text-slate-400 group-hover:text-primary h-7 w-7 shrink-0">
                                            {exporting === report.format ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                                        </Button>
                                    </div>
                                ))}
                            </CardContent>
                        </Card> */}
                    </div>
                    </ClientOnly>
                </>
            )}
        </div>
    );
}