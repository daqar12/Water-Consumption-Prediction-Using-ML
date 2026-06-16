"use client";

import { useState } from "react";
import {
    Search, Plus, CheckCircle2, Clock,
    XCircle, CreditCard, Banknote, Smartphone, Receipt
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

interface Payment {
    id: number;
    transaction_id: string;
    customer_name: string;
    branch: string;
    zone: string;
    amount: number;
    method: "cash" | "evc" | "bank";
    status: "completed" | "pending" | "failed";
    date: string;
    bill_period: string;
}

const dummyPayments: Payment[] = [
    { id: 1,  transaction_id: "TXN-001", customer_name: "Mohamed Ahmed",   branch: "Dayniile",    zone: "Gubta 1", amount: 120.00, method: "evc",  status: "completed", date: "2024-11-01", bill_period: "Sep–Nov 2024" },
    { id: 2,  transaction_id: "TXN-002", customer_name: "Amina Hassan",    branch: "Hodan",       zone: "Gubta 2", amount: 95.00,  method: "cash", status: "completed", date: "2024-11-03", bill_period: "Sep–Nov 2024" },
    { id: 3,  transaction_id: "TXN-003", customer_name: "Ali Yusuf",       branch: "Wadajir",     zone: "Gubta 3", amount: 12.50,  method: "bank", status: "pending",   date: "2024-11-05", bill_period: "Sep–Nov 2024" },
    { id: 4,  transaction_id: "TXN-004", customer_name: "Faadumo Omar",    branch: "Hawlwadaag",  zone: "Gubta 1", amount: 42.50,  method: "evc",  status: "completed", date: "2024-11-07", bill_period: "Sep–Nov 2024" },
    { id: 5,  transaction_id: "TXN-005", customer_name: "Abdullahi Muse",  branch: "Dayniile",    zone: "Gubta 4", amount: 22.50,  method: "cash", status: "failed",    date: "2024-11-08", bill_period: "Sep–Nov 2024" },
    { id: 6,  transaction_id: "TXN-006", customer_name: "Hodan Ibrahim",   branch: "Hodan",       zone: "Gubta 2", amount: 60.00,  method: "evc",  status: "pending",   date: "2024-11-10", bill_period: "Sep–Nov 2024" },
    { id: 7,  transaction_id: "TXN-007", customer_name: "Ismail Farah",    branch: "Wadajir",     zone: "Gubta 1", amount: 87.50,  method: "bank", status: "completed", date: "2024-11-12", bill_period: "Sep–Nov 2024" },
    { id: 8,  transaction_id: "TXN-008", customer_name: "Sahra Warsame",   branch: "Hawlwadaag",  zone: "Gubta 3", amount: 35.00,  method: "cash", status: "failed",    date: "2024-11-14", bill_period: "Sep–Nov 2024" },
];

const statusConfig = {
    completed: { label: "Completed", icon: <CheckCircle2 className="w-3.5 h-3.5" />, class: "bg-green-50 text-green-600 dark:bg-green-900/20" },
    pending:   { label: "Pending",   icon: <Clock        className="w-3.5 h-3.5" />, class: "bg-amber-50  text-amber-600  dark:bg-amber-900/20"  },
    failed:    { label: "Failed",    icon: <XCircle      className="w-3.5 h-3.5" />, class: "bg-red-50    text-red-600    dark:bg-red-900/20"    },
};

const methodConfig = {
    cash: { label: "Cash",       icon: <Banknote     className="w-3.5 h-3.5 text-green-500"  />, class: "bg-green-50  text-green-700  dark:bg-green-900/20"  },
    evc:  { label: "EVC Plus",   icon: <Smartphone   className="w-3.5 h-3.5 text-blue-500"   />, class: "bg-blue-50   text-blue-700   dark:bg-blue-900/20"   },
    bank: { label: "Bank",       icon: <CreditCard   className="w-3.5 h-3.5 text-purple-500" />, class: "bg-purple-50 text-purple-700 dark:bg-purple-900/20" },
};

export default function PaymentsPage() {
    const [searchTerm, setSearchTerm]     = useState("");
    const [filterStatus, setFilterStatus] = useState<"all" | "completed" | "pending" | "failed">("all");
    const [filterMethod, setFilterMethod] = useState<"all" | "cash" | "evc" | "bank">("all");

    const filtered = dummyPayments.filter((p) => {
        const matchSearch =
            p.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.transaction_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.branch.toLowerCase().includes(searchTerm.toLowerCase());
        const matchStatus = filterStatus === "all" || p.status === filterStatus;
        const matchMethod = filterMethod === "all" || p.method === filterMethod;
        return matchSearch && matchStatus && matchMethod;
    });

    const totalCollected = dummyPayments.filter((p) => p.status === "completed").reduce((s, p) => s + p.amount, 0);
    const totalPending   = dummyPayments.filter((p) => p.status === "pending")  .reduce((s, p) => s + p.amount, 0);
    const totalFailed    = dummyPayments.filter((p) => p.status === "failed")   .reduce((s, p) => s + p.amount, 0);
    const totalAll       = dummyPayments.reduce((s, p) => s + p.amount, 0);

    return (
        <div className="space-y-6">

            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold font-heading text-slate-800 dark:text-slate-100">
                        Payments
                    </h2>
                    <p className="text-slate-500 text-sm mt-1">
                        Manage and track all water bill payment transactions.
                    </p>
                </div>
                <Button className="gap-2 shadow-lg shadow-primary/20">
                    <Plus className="w-4 h-4" />
                    Add Payment
                </Button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: "Total Transactions", value: `$${totalAll.toFixed(2)}`,       color: "text-slate-700 dark:text-slate-100", bg: "bg-slate-50 dark:bg-slate-800/50",  icon: <Receipt      className="w-5 h-5 text-slate-400"  /> },
                    { label: "Collected",          value: `$${totalCollected.toFixed(2)}`, color: "text-green-600",                     bg: "bg-green-50 dark:bg-green-900/20",  icon: <CheckCircle2 className="w-5 h-5 text-green-500"  /> },
                    { label: "Pending",            value: `$${totalPending.toFixed(2)}`,   color: "text-amber-600",                     bg: "bg-amber-50 dark:bg-amber-900/20",  icon: <Clock        className="w-5 h-5 text-amber-500"  /> },
                    { label: "Failed",             value: `$${totalFailed.toFixed(2)}`,    color: "text-red-600",                       bg: "bg-red-50   dark:bg-red-900/20",    icon: <XCircle      className="w-5 h-5 text-red-500"    /> },
                ].map((stat, i) => (
                    <Card key={i}>
                        <CardContent className="p-4 flex items-center gap-3">
                            <div className={`p-2.5 rounded-lg ${stat.bg}`}>{stat.icon}</div>
                            <div>
                                <p className="text-xs text-slate-500">{stat.label}</p>
                                <p className={`text-lg font-bold ${stat.color}`}>{stat.value}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
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
                                placeholder="Search by name, TXN ID, branch..."
                                className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                            />
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                            {/* Status filter */}
                            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                                {(["all", "completed", "pending", "failed"] as const).map((s) => (
                                    <button
                                        key={s}
                                        onClick={() => setFilterStatus(s)}
                                        className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-all ${
                                            filterStatus === s
                                                ? "bg-white dark:bg-slate-700 text-primary shadow-sm"
                                                : "text-slate-500 hover:text-slate-700"
                                        }`}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>

                            {/* Method filter */}
                            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                                {(["all", "cash", "evc", "bank"] as const).map((m) => (
                                    <button
                                        key={m}
                                        onClick={() => setFilterMethod(m)}
                                        className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-all ${
                                            filterMethod === m
                                                ? "bg-white dark:bg-slate-700 text-primary shadow-sm"
                                                : "text-slate-500 hover:text-slate-700"
                                        }`}
                                    >
                                        {m === "all" ? "All Methods" : m === "evc" ? "EVC Plus" : m.charAt(0).toUpperCase() + m.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-800/50 border-b dark:border-slate-800">
                                <tr>
                                    <th className="px-6 py-4">#</th>
                                    <th className="px-6 py-4">Transaction ID</th>
                                    <th className="px-6 py-4">Customer</th>
                                    <th className="px-6 py-4">Branch / Zone</th>
                                    <th className="px-6 py-4">Bill Period</th>
                                    <th className="px-6 py-4 text-center">Method</th>
                                    <th className="px-6 py-4 text-right">Amount</th>
                                    <th className="px-6 py-4 text-center">Status</th>
                                    <th className="px-6 py-4">Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan={9} className="px-6 py-10 text-center text-slate-400">
                                            No payments found.
                                        </td>
                                    </tr>
                                ) : (
                                    filtered.map((payment, index) => {
                                        const status = statusConfig[payment.status];
                                        const method = methodConfig[payment.method];
                                        return (
                                            <tr
                                                key={payment.id}
                                                className="border-b last:border-0 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors"
                                            >
                                                <td className="px-6 py-4 text-slate-400 text-xs">{index + 1}</td>
                                                <td className="px-6 py-4 font-mono text-xs text-primary font-semibold">
                                                    {payment.transaction_id}
                                                </td>
                                                <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-100">
                                                    {payment.customer_name}
                                                </td>
                                                <td className="px-6 py-4 text-slate-500">
                                                    <div className="text-xs">
                                                        <p className="font-medium text-slate-700 dark:text-slate-300">{payment.branch}</p>
                                                        <p className="text-slate-400">{payment.zone}</p>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-xs text-slate-500">{payment.bill_period}</td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${method.class}`}>
                                                        {method.icon}
                                                        {method.label}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right font-bold text-slate-800 dark:text-slate-100">
                                                    ${payment.amount.toFixed(2)}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${status.class}`}>
                                                        {status.icon}
                                                        {status.label}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-slate-500 text-xs">{payment.date}</td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-3 border-t dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
                        <span>Showing {filtered.length} of {dummyPayments.length} transactions</span>
                        <span className="font-medium text-green-600">
                            Collected: ${totalCollected.toFixed(2)}
                        </span>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}