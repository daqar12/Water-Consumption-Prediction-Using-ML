"use client";

import { useState, useEffect, useRef } from "react";
import {
    Brain, Droplets, TrendingUp, Upload, Calendar,
    SlidersHorizontal, FileText, Download, Save,
    Share2, Filter, Clock, Target, Award,
    ChevronDown, Loader2, Sparkles, AlertCircle,
    CheckCircle2, AlertTriangle, BarChart3, X
} from "lucide-react";
import {
    RadialBarChart, RadialBar, ResponsiveContainer,
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    LineChart, Line, Area, AreaChart
} from "recharts";

// ── Constants from the trained model ─────────────────────
const API_BASE = "http://127.0.0.1:4050";

const branchList = [
    "Bakaaro", "Dayniile", "Garasbaaleey", "Hodan",
    "Waaberi", "Xamar Jajab", "Xamar Wayne"
];

const zoneList = [
    "Beerta", "Buulo Weekiyo", "Buundada", "Galmudug",
    "Gubta 1", "Gubta 2", "H.Wadaag 1", "H.Wadaag 2",
    "Maajo", "Oodweyne", "Raadeel", "Seebiyaano",
    "Tabeelaha", "Tareebiyaano", "Tareedisho",
    "W.Nabada 1", "W.Nabada 2", "Wardheere",
    "Warlalis", "Yaaqshiid", "Zope"
];

const modelDisplayNames: Record<string, string> = {
    linear_regression: "Linear Regression",
    decision_tree: "Decision Tree",
    random_forest: "Random Forest",
    gradient_boosting: "Gradient Boosting",
    xgboost: "XGBoost",
    tuned_random_forest: "Tuned Random Forest",
    tuned_xgboost: "Tuned XGBoost",
    final_model: "Final Model",
};

// ── Types ────────────────────────────────────────────────
interface PredictionResult {
    bestModel: string;
    finalPrediction: number;
    input: { September: number; October: number; Branch: string; Zone: string };
    allPredictions: Record<string, number>;
}

interface HistoryRow {
    id: string;
    branch: string;
    zone: string;
    september: number;
    october: number;
    predicted: number;
    model: string;
    date: string;
}

// ── Mock chart data (decorative, same as before) ─────────
const trendData = [
    { month: "Jun", predicted: 18, actual: 17 },
    { month: "Jul", predicted: 22, actual: 21 },
    { month: "Aug", predicted: 25, actual: 26 },
    { month: "Sep", predicted: 19, actual: 20 },
    { month: "Oct", predicted: 15, actual: 14 },
    { month: "Nov", predicted: 14, actual: null },
];

// ── Animated counter ──────────────────────────────────────
function useCountUp(target: number, duration = 1200) {
    const [val, setVal] = useState(0);
    useEffect(() => {
        let start = 0;
        const step = target / (duration / 16);
        const t = setInterval(() => {
            start += step;
            if (start >= target) { setVal(target); clearInterval(t); }
            else setVal(Math.floor(start));
        }, 16);
        return () => clearInterval(t);
    }, [target, duration]);
    return val;
}

// ── Circular progress ─────────────────────────────────────
function CircularProgress({ value, color, label }: { value: number; color: string; label: string }) {
    const r = 70, circ = 2 * Math.PI * r;
    const displayVal = Math.min(value, 999);
    const normalizedForCircle = Math.min(value, 100);
    const offset = circ - (normalizedForCircle / 100) * circ;
    return (
        <div className="relative flex items-center justify-center w-48 h-48">
            <svg className="w-48 h-48 -rotate-90" viewBox="0 0 180 180">
                <circle cx="90" cy="90" r={r} fill="none" stroke="#e2e8f0" strokeWidth="12" />
                <circle cx="90" cy="90" r={r} fill="none" stroke={color} strokeWidth="12"
                    strokeDasharray={circ} strokeDashoffset={offset}
                    strokeLinecap="round"
                    style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(.4,0,.2,1)" }} />
            </svg>
            <div className="absolute flex flex-col items-center">
                <span className="text-3xl font-black text-slate-800 dark:text-slate-100">{displayVal.toFixed(1)}</span>
                <span className="text-xs text-slate-400 mt-0.5">{label}</span>
            </div>
        </div>
    );
}

// ── Animated progress bar ─────────────────────────────────
function AnimBar({ label, value, color, suffix = "m³" }: { label: string; value: number; color: string; suffix?: string }) {
    const [width, setWidth] = useState(0);
    const maxVal = 100;
    const pct = Math.min((value / maxVal) * 100, 100);
    useEffect(() => { const t = setTimeout(() => setWidth(pct), 100); return () => clearTimeout(t); }, [pct]);
    return (
        <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-medium text-slate-600 dark:text-slate-300">
                <span>{label}</span><span>{value.toFixed(2)} {suffix}</span>
            </div>
            <div className="h-2.5 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                <div className={`h-full rounded-full ${color} transition-all duration-1000 ease-out`}
                    style={{ width: `${width}%` }} />
            </div>
        </div>
    );
}

// ── Custom dropdown ───────────────────────────────────────
function Select({ label, options, value, onChange }: {
    label: string; options: string[]; value: string; onChange: (v: string) => void;
}) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    return (
        <div className="relative" ref={ref}>
            <button onClick={() => setOpen(!open)}
                className="w-full flex items-center justify-between px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-800/60 backdrop-blur text-sm text-slate-700 dark:text-slate-200 hover:border-primary/50 transition-all focus:outline-none focus:ring-2 focus:ring-primary/30">
                <span className={value ? "text-slate-800 dark:text-slate-100" : "text-slate-400"}>{value || label}</span>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} />
            </button>
            {open && (
                <div className="absolute z-20 mt-1 w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl overflow-hidden max-h-56 overflow-y-auto">
                    {options.map((o) => (
                        <button key={o} onClick={() => { onChange(o); setOpen(false); }}
                            className={`w-full text-left px-4 py-2.5 text-sm hover:bg-primary/5 hover:text-primary transition-colors ${value === o ? "text-primary font-medium bg-primary/5" : "text-slate-700 dark:text-slate-300"}`}>
                            {o}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

// ══════════════════════════════════════════════════════════
export default function MLPredictionsPage() {
    // Form state — matches backend required fields
    const [september,  setSeptember]  = useState("");
    const [october,    setOctober]    = useState("");
    const [branch,     setBranch]     = useState("");
    const [zone,       setZone]       = useState("");
    const [notes,      setNotes]      = useState("");

    const [loading,    setLoading]    = useState(false);
    const [result,     setResult]     = useState<PredictionResult | null>(null);
    const [apiError,   setApiError]   = useState("");
    const [errors,     setErrors]     = useState<Record<string, string>>({});
    const [history,    setHistory]    = useState<HistoryRow[]>([]);
    const [filterStat, setFilterStat] = useState<"all" | string>("all");

    const validate = () => {
        const e: Record<string, string> = {};
        if (!september || isNaN(Number(september))) e.september = "Enter a valid September value";
        if (!october   || isNaN(Number(october)))   e.october   = "Enter a valid October value";
        if (!branch)   e.branch   = "Please select a branch";
        if (!zone)     e.zone     = "Please select a zone";
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handlePredict = async () => {
        if (!validate()) return;
        setLoading(true);
        setApiError("");
        setResult(null);

        const payload = {
            September: parseFloat(september),
            October:   parseFloat(october),
            Branch:    branch,
            Zone:      zone,
        };

        try {
            // Call predict-all to get predictions from every model
            const res = await fetch(`${API_BASE}/predict-all`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (!res.ok) {
                setApiError(data.error || "Prediction failed");
                setLoading(false);
                return;
            }

            const finalPred = data.predictions?.final_model ?? 0;

            setResult({
                bestModel:      data.best_model,
                finalPrediction: finalPred,
                input:          payload,
                allPredictions:  data.predictions,
            });

            // Add to local history
            setHistory(prev => [{
                id:        `PRD-${String(prev.length + 1).padStart(3, "0")}`,
                branch:    branch,
                zone:      zone,
                september: payload.September,
                october:   payload.October,
                predicted: finalPred,
                model:     data.best_model,
                date:      new Date().toLocaleDateString(),
            }, ...prev]);

        } catch (err: unknown) {
            setApiError("Could not connect to ML server. Make sure the backend is running on port 4050.");
        } finally {
            setLoading(false);
        }
    };

    // Build bar chart data from all model predictions
    const modelBarData = result
        ? Object.entries(result.allPredictions).map(([name, value]) => ({
            model: modelDisplayNames[name] || name,
            value: Math.round(value * 100) / 100,
        }))
        : [];

    const statusCfg: Record<string, { label: string; class: string }> = {
        all:       { label: "All",       class: "" },
    };

    return (
        <div className="space-y-6 pb-8">

            {/* ── Header ── */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3">
                        <h2 className="text-3xl font-black text-slate-800 dark:text-slate-100">ML Predictions</h2>
                    </div>
                    <p className="text-slate-500 text-sm mt-1 ml-1">Water consumption forecasting powered by machine learning — predicts November consumption.</p>
                </div>
                <div className="flex items-center gap-2">
                    <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-600 dark:text-slate-300 hover:border-primary/40 transition-all">
                        <Download className="w-4 h-4" /> Export
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary to-teal-500 text-white text-sm font-medium shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all">
                        <Save className="w-4 h-4" /> Save Results
                    </button>
                </div>
            </div>

            {/* ── Main grid ── */}
            <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">

                {/* ── LEFT: Form ── */}
                <div className="xl:col-span-2">
                    <div className="rounded-3xl border border-slate-200/80 dark:border-slate-700/80 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 p-6 space-y-5">

                        {/* Form title */}
                        <div className="flex items-center gap-3 pb-2 border-b border-slate-100 dark:border-slate-800">
                            <div className="p-1.5 rounded-lg bg-primary/10">
                                <Sparkles className="w-4 h-4 text-primary" />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-800 dark:text-slate-100">Prediction Form</h3>
                                <p className="text-xs text-slate-400">Enter September &amp; October consumption to predict November</p>
                            </div>
                        </div>

                        {/* September Consumption */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                                <span className="flex items-center gap-1"><Droplets className="w-3 h-3" />September Consumption (m³)</span>
                            </label>
                            <input
                                type="number"
                                value={september}
                                onChange={(e) => { setSeptember(e.target.value); setErrors((p) => ({ ...p, september: "" })); }}
                                placeholder="e.g. 15"
                                className={`w-full px-4 py-3 rounded-2xl border ${errors.september ? "border-red-400" : "border-slate-200 dark:border-slate-700"} bg-white/60 dark:bg-slate-800/60 backdrop-blur text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all`}
                            />
                            {errors.september && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.september}</p>}
                        </div>

                        {/* October Consumption */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                                <span className="flex items-center gap-1"><Droplets className="w-3 h-3" />October Consumption (m³)</span>
                            </label>
                            <input
                                type="number"
                                value={october}
                                onChange={(e) => { setOctober(e.target.value); setErrors((p) => ({ ...p, october: "" })); }}
                                placeholder="e.g. 12"
                                className={`w-full px-4 py-3 rounded-2xl border ${errors.october ? "border-red-400" : "border-slate-200 dark:border-slate-700"} bg-white/60 dark:bg-slate-800/60 backdrop-blur text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all`}
                            />
                            {errors.october && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.october}</p>}
                        </div>

                        {/* Branch */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Branch</label>
                            <Select label="Select Branch" options={branchList} value={branch} onChange={(v) => { setBranch(v); setErrors((p) => ({ ...p, branch: "" })); }} />
                            {errors.branch && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.branch}</p>}
                        </div>

                        {/* Zone */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Zone</label>
                            <Select label="Select Zone" options={zoneList} value={zone} onChange={(v) => { setZone(v); setErrors((p) => ({ ...p, zone: "" })); }} />
                            {errors.zone && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.zone}</p>}
                        </div>

                        {/* Notes */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Notes (Optional)</label>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Add any relevant notes..."
                                rows={3}
                                className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-800/60 backdrop-blur text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none transition-all"
                            />
                        </div>

                        {/* API Error */}
                        {apiError && (
                            <div className="flex items-start gap-2 p-3 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                                <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                                <p className="text-xs text-red-600 dark:text-red-400">{apiError}</p>
                            </div>
                        )}

                        {/* CTA */}
                        <button onClick={handlePredict} disabled={loading}
                            className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-primary to-teal-500 text-white font-bold text-sm shadow-lg shadow-primary/30 hover:shadow-primary/50 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200">
                            {loading
                                ? <><Loader2 className="w-4 h-4 animate-spin" />Analyzing with ML Model...</>
                                : <><Brain  className="w-4 h-4" />Generate Prediction</>
                            }
                        </button>
                    </div>
                </div>

                {/* ── RIGHT: Results ── */}
                <div className="xl:col-span-3 space-y-5">

                    {/* Empty state */}
                    {!result && !loading && (
                        <div className="h-full min-h-[400px] flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 backdrop-blur text-center p-12 space-y-4">
                            <div className="p-5 rounded-full bg-gradient-to-br from-primary/10 to-teal-100 dark:from-primary/20 dark:to-teal-900/30">
                                <Brain className="w-12 h-12 text-primary" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-700 dark:text-slate-200">No Prediction Yet</h3>
                                <p className="text-slate-400 text-sm mt-1 max-w-xs mx-auto">Fill in the prediction form and click <strong>Generate Prediction</strong> to see your ML results here.</p>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-400">
                                <Sparkles className="w-3.5 h-3.5 text-primary" />
                                Powered by Water Consumption ML Model
                            </div>
                        </div>
                    )}

                    {/* Loading skeleton */}
                    {loading && (
                        <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl p-8 space-y-6 animate-pulse">
                            <div className="flex justify-center"><div className="w-48 h-48 rounded-full bg-slate-100 dark:bg-slate-800" /></div>
                            {[1,2,3].map(i => <div key={i} className="h-8 rounded-2xl bg-slate-100 dark:bg-slate-800" />)}
                        </div>
                    )}

                    {/* Result */}
                    {result && !loading && (() => {
                        const pred = result.finalPrediction;
                        const levelColor = pred >= 15 ? "#10b981" : pred >= 8 ? "#f59e0b" : "#ef4444";
                        const levelLabel = pred >= 15 ? "High Consumption" : pred >= 8 ? "Moderate Consumption" : "Low Consumption";
                        const levelGradient = pred >= 15 ? "from-green-400 to-teal-500" : pred >= 8 ? "from-amber-400 to-orange-500" : "from-blue-400 to-cyan-500";
                        const LevelIcon = pred >= 15 ? CheckCircle2 : pred >= 8 ? AlertTriangle : AlertCircle;

                        // Find min and max across all model predictions for chart scaling
                        const allVals = Object.values(result.allPredictions);
                        const avgPred = allVals.reduce((a, b) => a + b, 0) / allVals.length;
                        const minPred = Math.min(...allVals);
                        const maxPred = Math.max(...allVals);

                        return (
                            <div className="space-y-5">

                                {/* Circular + status */}
                                <div className="rounded-3xl border border-slate-200/80 dark:border-slate-700/80 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl shadow-xl p-6">
                                    <div className="flex flex-col sm:flex-row items-center gap-8">

                                        {/* Circle */}
                                        <div className="shrink-0">
                                            <CircularProgress value={pred} color={levelColor} label="m³ Nov Predicted" />
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 space-y-4 w-full">
                                            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-gradient-to-r ${levelGradient} text-white font-semibold text-sm shadow-lg`}>
                                                <LevelIcon className="w-5 h-5" />{levelLabel}
                                            </div>
                                            <div className="space-y-3">
                                                <div className="space-y-1.5">
                                                    <div className="flex justify-between text-xs font-medium text-slate-600 dark:text-slate-300">
                                                        <span>September Input</span><span>{result.input.September} m³</span>
                                                    </div>
                                                </div>
                                                <div className="space-y-1.5">
                                                    <div className="flex justify-between text-xs font-medium text-slate-600 dark:text-slate-300">
                                                        <span>October Input</span><span>{result.input.October} m³</span>
                                                    </div>
                                                </div>
                                                <div className="space-y-1.5">
                                                    <div className="flex justify-between text-xs font-medium text-slate-600 dark:text-slate-300">
                                                        <span>Predicted November</span><span className="text-primary font-bold">{pred.toFixed(2)} m³</span>
                                                    </div>
                                                </div>
                                                <div className="space-y-1.5">
                                                    <div className="flex justify-between text-xs font-medium text-slate-600 dark:text-slate-300">
                                                        <span>Best Model</span><span className="font-semibold">{result.bestModel}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Analytics cards */}
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    {[
                                        { label: "Final Prediction", value: `${pred.toFixed(2)} m³`,     icon: <Target     className="w-4 h-4 text-blue-500"   />, bg: "bg-blue-50   dark:bg-blue-900/20"   },
                                        { label: "Models Used",      value: `${allVals.length}`,          icon: <Award       className="w-4 h-4 text-green-500"  />, bg: "bg-green-50  dark:bg-green-900/20"  },
                                        { label: "Avg Prediction",   value: `${avgPred.toFixed(2)} m³`,   icon: <TrendingUp  className="w-4 h-4 text-teal-500"   />, bg: "bg-teal-50   dark:bg-teal-900/20"   },
                                        { label: "Prediction Range", value: `${minPred.toFixed(1)} – ${maxPred.toFixed(1)}`, icon: <Clock className="w-4 h-4 text-amber-500" />, bg: "bg-amber-50  dark:bg-amber-900/20"  },
                                    ].map((c, i) => (
                                        <div key={i} className="rounded-2xl border border-slate-200/80 dark:border-slate-700/80 bg-white/70 dark:bg-slate-800/70 backdrop-blur p-4 space-y-2">
                                            <div className={`p-2 rounded-xl w-fit ${c.bg}`}>{c.icon}</div>
                                            <p className="text-xs text-slate-500">{c.label}</p>
                                            <p className="text-base font-bold text-slate-800 dark:text-slate-100">{c.value}</p>
                                        </div>
                                    ))}
                                </div>

                                {/* Charts */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    {/* Trend chart (decorative) */}
                                    <div className="rounded-3xl border border-slate-200/80 dark:border-slate-700/80 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl p-5">
                                        <p className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-3">Consumption Trend</p>
                                        <div className="h-[160px]">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <AreaChart data={trendData}>
                                                    <defs>
                                                        <linearGradient id="tg" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="5%"  stopColor="#0F766E" stopOpacity={0.2} />
                                                            <stop offset="95%" stopColor="#0F766E" stopOpacity={0}   />
                                                        </linearGradient>
                                                    </defs>
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                                                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', fontSize: '11px' }} />
                                                    <Area  type="monotone" dataKey="actual"    stroke="#0F766E" strokeWidth={2} fill="url(#tg)" />
                                                    <Line  type="monotone" dataKey="predicted" stroke="#F59E0B" strokeWidth={2} strokeDasharray="4 3" dot={false} />
                                                </AreaChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>

                                    {/* Model comparison chart (REAL data) */}
                                    <div className="rounded-3xl border border-slate-200/80 dark:border-slate-700/80 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl p-5">
                                        <p className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-3">Model Comparison (m³)</p>
                                        <div className="h-[160px]">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={modelBarData} barSize={18}>
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                                    <XAxis dataKey="model" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 7 }} angle={-20} textAnchor="end" height={40} />
                                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                                                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', fontSize: '11px' }} />
                                                    <Bar dataKey="value" radius={[8, 8, 0, 0]}
                                                        fill="url(#barGrad)" />
                                                    <defs>
                                                        <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="0%"   stopColor="#0F766E" />
                                                            <stop offset="100%" stopColor="#14b8a6" />
                                                        </linearGradient>
                                                    </defs>
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                </div>

                                {/* All model predictions table */}
                                <div className="rounded-3xl border border-slate-200/80 dark:border-slate-700/80 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl p-5">
                                    <p className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-3 flex items-center gap-2">
                                        <BarChart3 className="w-4 h-4 text-primary" />
                                        All Model Predictions
                                    </p>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                        {Object.entries(result.allPredictions).map(([name, value]) => {
                                            const isFinal = name === "final_model";
                                            return (
                                                <div key={name}
                                                    className={`rounded-2xl p-3 border transition-all ${isFinal
                                                        ? "border-primary bg-primary/5 dark:bg-primary/10 ring-1 ring-primary/30"
                                                        : "border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50"
                                                    }`}>
                                                    <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider truncate">{modelDisplayNames[name] || name}</p>
                                                    <p className={`text-lg font-black mt-1 ${isFinal ? "text-primary" : "text-slate-800 dark:text-slate-100"}`}>
                                                        {value.toFixed(2)}
                                                    </p>
                                                    <p className="text-[10px] text-slate-400">m³</p>
                                                    {isFinal && <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[9px] font-bold uppercase">Best Model</span>}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Action buttons */}
                                <div className="flex flex-wrap items-center gap-3">
                                    {[
                                        { label: "Export PDF",   icon: <Download  className="w-4 h-4" />, style: "border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200" },
                                        { label: "Export Excel", icon: <BarChart3 className="w-4 h-4" />, style: "border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200" },
                                        { label: "Save",         icon: <Save      className="w-4 h-4" />, style: "bg-primary to-teal-500 text-white shadow-lg shadow-primary/25" },
                                        { label: "Share",        icon: <Share2    className="w-4 h-4" />, style: "border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200" },
                                    ].map((btn, i) => (
                                        <button key={i} className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-medium hover:-translate-y-0.5 transition-all ${btn.style}`}>
                                            {btn.icon}{btn.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        );
                    })()}
                </div>
            </div>

            {/* ── History Table ── */}
            <div className="rounded-3xl border border-slate-200/80 dark:border-slate-700/80 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl shadow-xl overflow-hidden">
                <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-primary" />
                        <h3 className="font-bold text-slate-800 dark:text-slate-100">Prediction History</h3>
                        <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-semibold">{history.length}</span>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-500 uppercase bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                            <tr>
                                <th className="px-6 py-3">ID</th>
                                <th className="px-6 py-3">Branch</th>
                                <th className="px-6 py-3">Zone</th>
                                <th className="px-6 py-3 text-right">Sep (m³)</th>
                                <th className="px-6 py-3 text-right">Oct (m³)</th>
                                <th className="px-6 py-3 text-right">Predicted Nov (m³)</th>
                                <th className="px-6 py-3">Model</th>
                                <th className="px-6 py-3">Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {history.length === 0 && (
                                <tr>
                                    <td colSpan={8} className="px-6 py-8 text-center text-slate-400 text-sm">
                                        No predictions yet. Use the form to generate your first prediction.
                                    </td>
                                </tr>
                            )}
                            {history.map((h) => (
                                <tr key={h.id} className="border-b last:border-0 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                                    <td className="px-6 py-3 font-mono text-xs text-primary font-semibold">{h.id}</td>
                                    <td className="px-6 py-3 font-medium text-slate-800 dark:text-slate-100">{h.branch}</td>
                                    <td className="px-6 py-3 text-slate-500 text-xs">{h.zone}</td>
                                    <td className="px-6 py-3 text-right text-slate-600 dark:text-slate-300">{h.september}</td>
                                    <td className="px-6 py-3 text-right text-slate-600 dark:text-slate-300">{h.october}</td>
                                    <td className="px-6 py-3 text-right font-bold text-teal-600">{h.predicted.toFixed(2)}</td>
                                    <td className="px-6 py-3 text-xs">
                                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                                            {h.model}
                                        </span>
                                    </td>
                                    <td className="px-6 py-3 text-slate-400 text-xs">{h.date}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}