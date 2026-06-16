"use client";

import { useState } from "react";
import {
    Search, Plus, Loader2, CheckCircle2,
    Clock, XCircle, Droplets, Receipt
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

interface Bill {
    id: number;
    customer_name: string;
    branch: string;
    zone: string;
    september: number;
    october: number;
    november: number;
    total: number;
    status: "paid" | "pending" | "overdue";
    due_date: string;
}

const dummyBills: Bill[] = [
    { id: 1, customer_name: "Mohamed Ahmed", branch: "Dayniile", zone: "Gubta 1", september: 20, october: 15, november: 13, total: 48, status: "paid", due_date: "2024-12-01" },
    { id: 2, customer_name: "Amina Hassan", branch: "Hodan", zone: "Gubta 2", september: 11, october: 12, november: 15, total: 38, status: "pending", due_date: "2024-12-15" },
    { id: 3, customer_name: "Ali Yusuf", branch: "Wadajir", zone: "Gubta 3", september: 2, october: 2, november: 1, total: 5, status: "overdue", due_date: "2024-11-01" },
    { id: 4, customer_name: "Faadumo Omar", branch: "Hawlwadaag", zone: "Gubta 1", september: 6, october: 5, november: 6, total: 17, status: "paid", due_date: "2024-12-01" },
    { id: 5, customer_name: "Abdullahi Muse", branch: "Dayniile", zone: "Gubta 4", september: 3, october: 3, november: 3, total: 9, status: "pending", due_date: "2024-12-20" },
    { id: 6, customer_name: "Hodan Ibrahim", branch: "Hodan", zone: "Gubta 2", september: 8, october: 9, november: 7, total: 24, status: "overdue", due_date: "2024-11-10" },
];

const RATE_PER_UNIT = 2.5; // $ per m³

const statusConfig = {
    paid:    { label: "Paid",    icon: <CheckCircle2 className="w-3.5 h-3.5" />, class: "bg-green-50 text-green-600 dark:bg-green-900/20" },
    pending: { label: "Pending", icon: <Clock        className="w-3.5 h-3.5" />, class: "bg-amber-50  text-amber-600  dark:bg-amber-900/20"  },
    overdue: { label: "Overdue", icon: <XCircle      className="w-3.5 h-3.5" />, class: "bg-red-50    text-red-600    dark:bg-red-900/20"    },
};

export default function BillingPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState<"all" | "paid" | "pending" | "overdue">("all");

    const filtered = dummyBills.filter((bill) => {
        const matchSearch =
            bill.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            bill.branch.toLowerCase().includes(searchTerm.toLowerCase()) ||
            bill.zone.toLowerCase().includes(searchTerm.toLowerCase());
        const matchStatus = filterStatus === "all" || bill.status === filterStatus;
        return matchSearch && matchStatus;
    });

    const totalRevenue  = dummyBills.reduce((s, b) => s + b.total * RATE_PER_UNIT, 0);
    const totalPaid     = dummyBills.filter((b) => b.status === "paid")   .reduce((s, b) => s + b.total * RATE_PER_UNIT, 0);
    const totalPending  = dummyBills.filter((b) => b.status === "pending").reduce((s, b) => s + b.total * RATE_PER_UNIT, 0);
    const totalOverdue  = dummyBills.filter((b) => b.status === "overdue").reduce((s, b) => s + b.total * RATE_PER_UNIT, 0);

    return (
        <div className="space-y-6">

            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold font-heading text-slate-800 dark:text-slate-100">
                        Billing
                    </h2>
                    <p className="text-slate-500 text-sm mt-1">
                        Manage water bill payments and track transactions.
                    </p>
                </div>
                <Button className="gap-2 shadow-lg shadow-primary/20">
                    <Plus className="w-4 h-4" />
                    Add Bill
                </Button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: "Total Revenue",  value: `$${totalRevenue.toFixed(2)}`,  color: "text-slate-700  dark:text-slate-100", bg: "bg-slate-50  dark:bg-slate-800/50",  icon: <Receipt       className="w-5 h-5 text-slate-400"  /> },
                    { label: "Paid",           value: `$${totalPaid.toFixed(2)}`,     color: "text-green-600",                      bg: "bg-green-50 dark:bg-green-900/20",   icon: <CheckCircle2  className="w-5 h-5 text-green-500"  /> },
                    { label: "Pending",        value: `$${totalPending.toFixed(2)}`,  color: "text-amber-600",                      bg: "bg-amber-50 dark:bg-amber-900/20",   icon: <Clock         className="w-5 h-5 text-amber-500"  /> },
                    { label: "Overdue",        value: `$${totalOverdue.toFixed(2)}`,  color: "text-red-600",                        bg: "bg-red-50   dark:bg-red-900/20",     icon: <XCircle       className="w-5 h-5 text-red-500"    /> },
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
                                placeholder="Search by name, branch, zone..."
                                className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                            />
                        </div>

                        {/* Status filter */}
                        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                            {(["all", "paid", "pending", "overdue"] as const).map((s) => (
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
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-800/50 border-b dark:border-slate-800">
                                <tr>
                                    <th className="px-6 py-4">#</th>
                                    <th className="px-6 py-4">Customer Name</th>
                                    <th className="px-6 py-4">Branch / Zone</th>
                                    <th className="px-6 py-4 text-right">Sep (m³)</th>
                                    <th className="px-6 py-4 text-right">Oct (m³)</th>
                                    <th className="px-6 py-4 text-right">Nov (m³)</th>
                                    <th className="px-6 py-4 text-right">Total (m³)</th>
                                    <th className="px-6 py-4 text-right">Amount ($)</th>
                                    <th className="px-6 py-4 text-center">Status</th>
                                    <th className="px-6 py-4">Due Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan={10} className="px-6 py-10 text-center text-slate-400">
                                            No bills found.
                                        </td>
                                    </tr>
                                ) : (
                                    filtered.map((bill, index) => {
                                        const amount = (bill.total * RATE_PER_UNIT).toFixed(2);
                                        const status = statusConfig[bill.status];
                                        return (
                                            <tr
                                                key={bill.id}
                                                className="border-b last:border-0 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors"
                                            >
                                                <td className="px-6 py-4 text-slate-400 text-xs">{index + 1}</td>
                                                <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-100">
                                                    <div className="flex items-center gap-2">
                                                        <Droplets className="w-4 h-4 text-primary/60" />
                                                        {bill.customer_name}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-slate-500">
                                                    <div className="text-xs">
                                                        <p className="font-medium text-slate-700 dark:text-slate-300">{bill.branch}</p>
                                                        <p className="text-slate-400">{bill.zone}</p>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right text-slate-600 dark:text-slate-300">{bill.september}</td>
                                                <td className="px-6 py-4 text-right text-slate-600 dark:text-slate-300">{bill.october}</td>
                                                <td className="px-6 py-4 text-right text-slate-600 dark:text-slate-300">{bill.november}</td>
                                                <td className="px-6 py-4 text-right font-semibold text-slate-800 dark:text-slate-100">{bill.total}</td>
                                                <td className="px-6 py-4 text-right font-bold text-primary">${amount}</td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${status.class}`}>
                                                        {status.icon}
                                                        {status.label}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-slate-500 text-xs">{bill.due_date}</td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-3 border-t dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
                        <span>Showing {filtered.length} of {dummyBills.length} bills</span>
                        <span>Rate: ${RATE_PER_UNIT}/m³</span>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}