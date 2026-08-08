"use client";

import { useState, useEffect } from "react";
import { 
  ScrollText, Search, Filter, ShieldAlert, Loader2,
  ChevronLeft, ChevronRight, UserCheck, KeyRound, UserPlus,
  Brain, FileSpreadsheet, Download, Trash2, Edit3, Lock
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { API_URL } from "@/lib/config";
import { authHeaders, getSession, isAdminRole } from "@/lib/session";

interface ActivityLogItem {
  id: number;
  user_id: number | null;
  user_fullname: string;
  user_role: string;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  entity_code: string | null;
  description: string | null;
  created_at: string;
}

interface ActivityLogsResponse {
  total: number;
  page: number;
  limit: number;
  total_pages: number;
  data: ActivityLogItem[];
}

export default function ActivityLogsPage() {
  const session = getSession();
  const userRole = (session?.user as { role?: string })?.role;
  const isAdmin = isAdminRole(userRole);

  const [logs, setLogs] = useState<ActivityLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState("all");

  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const limit = 15;

  useEffect(() => {
    if (isAdmin) {
      fetchLogs(currentPage, searchTerm, actionFilter);
    }
  }, [currentPage, actionFilter, isAdmin]);

  const fetchLogs = async (page: number, search = "", action = "all") => {
    setLoading(true);
    setError("");
    try {
      let query = `${API_URL}/activity-logs?page=${page}&limit=${limit}`;
      if (search.trim()) query += `&search=${encodeURIComponent(search.trim())}`;
      if (action !== "all") query += `&action=${encodeURIComponent(action)}`;

      const response = await fetch(query, {
        headers: { ...authHeaders() },
      });

      if (response.status === 403) {
        setError("Access Denied: You do not have permission to view system activity logs.");
        return;
      }
      if (!response.ok) {
        throw new Error("Failed to load activity logs.");
      }

      const result: ActivityLogsResponse = await response.json();
      setLogs(result.data);
      setTotalRecords(result.total);
      setTotalPages(result.total_pages);
    } catch (err: unknown) {
      setError("Error connecting to server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchLogs(1, searchTerm, actionFilter);
  };

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center space-y-4">
        <div className="p-4 rounded-full bg-red-50 dark:bg-red-900/20 text-red-500">
          <ShieldAlert className="w-12 h-12" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Access Restricted</h2>
        <p className="text-sm text-slate-500 max-w-md">
          System Activity Logs are restricted to Administrator accounts only. Your account role does not have permission to access this page.
        </p>
      </div>
    );
  }

  const renderActionBadge = (action: string) => {
    switch (action.toUpperCase()) {
      case "LOGIN_SUCCESS":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300">
            <UserCheck className="w-3 h-3" /> Login
          </span>
        );
      case "LOGOUT":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300">
            <KeyRound className="w-3 h-3" /> Logout
          </span>
        );
      case "CREATE_CUSTOMER":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200 dark:bg-teal-900/30 dark:text-teal-300">
            <UserPlus className="w-3 h-3" /> Customer Created
          </span>
        );
      case "IMPORT_CUSTOMERS":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300">
            <FileSpreadsheet className="w-3 h-3" /> Dataset Imported
          </span>
        );
      case "GENERATE_PREDICTION":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-900/30 dark:text-blue-300">
            <Brain className="w-3 h-3" /> Prediction Saved
          </span>
        );
      case "CREATE_USER":
      case "UPDATE_USER":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-900/30 dark:text-amber-300">
            <Edit3 className="w-3 h-3" /> User Admin
          </span>
        );
      case "DELETE_PREDICTION":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/30 dark:text-red-300">
            <Trash2 className="w-3 h-3" /> Prediction Deleted
          </span>
        );
      case "EXPORT_REPORT":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-900/30 dark:text-purple-300">
            <Download className="w-3 h-3" /> Report Exported
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            {action}
          </span>
        );
    }
  };

  const startRecord = (currentPage - 1) * limit + 1;
  const endRecord = Math.min(currentPage * limit, totalRecords);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-2xl bg-primary/10 text-primary">
              <ScrollText className="w-6 h-6" />
            </div>
            <h2 className="text-3xl font-bold font-heading text-slate-800 dark:text-slate-100">
              Activity Logs
            </h2>
          </div>
          <p className="text-slate-500 text-sm mt-1">
            System audit trail recording staff and administrator operations in real time.
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {/* Search + Filter controls */}
          <div className="p-4 border-b dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <form onSubmit={handleSearchSubmit} className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative max-w-sm w-full sm:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search logs by action, user, or code..."
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                />
              </div>

              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-400 shrink-0" />
                <select
                  value={actionFilter}
                  onChange={(e) => setActionFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs font-medium text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="all">All Actions</option>
                  <option value="LOGIN_SUCCESS">Login Success</option>
                  <option value="LOGOUT">Logout</option>
                  <option value="CREATE_CUSTOMER">Create Customer</option>
                  <option value="IMPORT_CUSTOMERS">Import Dataset</option>
                  <option value="GENERATE_PREDICTION">Generate Prediction</option>
                  <option value="CREATE_USER">Create User</option>
                  <option value="UPDATE_USER">Update User</option>
                  <option value="EXPORT_REPORT">Export Report</option>
                </select>
              </div>

              <Button type="submit" variant="ghost" size="sm" className="text-xs">
                Search
              </Button>
            </form>

            {!loading && !error && (
              <p className="text-sm text-slate-500">
                Showing{" "}
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {totalRecords > 0 ? startRecord : 0}–{endRecord}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {totalRecords.toLocaleString()}
                </span>{" "}
                activity logs
              </p>
            )}
          </div>

          {/* Table Body */}
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex flex-col items-center justify-center p-12 text-slate-500 gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                <p className="text-sm">Loading activity logs...</p>
              </div>
            ) : error ? (
              <div className="p-8 text-center text-red-500 text-sm">{error}</div>
            ) : (
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-800/50 border-b dark:border-slate-800">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Date &amp; Time</th>
                    <th className="px-6 py-4 font-semibold">User</th>
                    <th className="px-6 py-4 font-semibold">Role</th>
                    <th className="px-6 py-4 font-semibold">Action</th>
                    <th className="px-6 py-4 font-semibold">Customer / Entity</th>
                    <th className="px-6 py-4 font-semibold">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                        No activity logs found matching search criteria.
                      </td>
                    </tr>
                  ) : (
                    logs.map((log) => (
                      <tr
                        key={log.id}
                        className="border-b last:border-0 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors"
                      >
                        {/* Date Time */}
                        <td className="px-6 py-4 text-xs font-medium text-slate-600 dark:text-slate-400 whitespace-nowrap">
                          {new Date(log.created_at).toLocaleString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                          })}
                        </td>

                        {/* User */}
                        <td className="px-6 py-4 font-semibold text-slate-900 dark:text-slate-100">
                          {log.user_fullname}
                        </td>

                        {/* Role */}
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider ${
                            log.user_role === "admin" || log.user_role === "administrator"
                              ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
                              : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                          }`}>
                            {log.user_role}
                          </span>
                        </td>

                        {/* Action Badge */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          {renderActionBadge(log.action)}
                        </td>

                        {/* Entity Code */}
                        <td className="px-6 py-4 font-mono font-bold text-xs text-primary">
                          {log.entity_code || log.entity_id || "-"}
                        </td>

                        {/* Description */}
                        <td className="px-6 py-4 text-slate-600 dark:text-slate-300 text-xs">
                          {log.description || "-"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination Controls */}
          {!loading && !error && totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t dark:border-slate-800">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) =>
                    p === 1 ||
                    p === totalPages ||
                    (p >= currentPage - 2 && p <= currentPage + 2)
                  )
                  .reduce<(number | string)[]>((acc, p, idx, arr) => {
                    if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push("...");
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((p, idx) =>
                    p === "..." ? (
                      <span key={`ellipsis-${idx}`} className="px-2 text-slate-400">...</span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => setCurrentPage(p as number)}
                        className={`w-8 h-8 rounded-md text-sm font-medium transition-colors ${
                          currentPage === p
                            ? "bg-primary text-white"
                            : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                        }`}
                      >
                        {p}
                      </button>
                    )
                  )}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="gap-1"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
