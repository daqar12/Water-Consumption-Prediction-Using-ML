"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Search, Plus, Upload, Loader2, ChevronLeft, ChevronRight,
  Brain, Lock, CheckCircle2, AlertCircle, X, Sparkles, Filter,
  ArrowUpDown, ArrowUp, ArrowDown
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { API_URL } from "@/lib/config";
import { authHeaders, getSession, isAdminRole } from "@/lib/session";

interface Customer {
  id: number;
  customer_code: string;
  record_source: "imported" | "manual" | string;
  Customer_Name: string;
  Branch: string;
  Zone: string;
  september: number;
  october: number;
  november: number | null;
}

interface PaginatedResponse {
  total: number;
  page: number;
  limit: number;
  total_pages: number;
  data: Customer[];
}

const branchList = [
  "Bakaaro", "Dayniile", "Garasbaaleey", "Hodan",
  "Waaberi", "Xamar Jajab", "Xamar Wayne"
];

const branchZones: Record<string, string[]> = {
  "Bakaaro": ["Yaaqshiid", "W.Nabada 2", "W.Nabada 1", "H.Wadaag 2", "H.Wadaag 1"],
  "Dayniile": ["Gubta 1", "Gubta 2", "Raadeel", "Oodweyne", "Wardheere"],
  "Garasbaaleey": ["Tabeelaha", "Tareedisho", "Galmudug", "Warlalis"],
  "Hodan": ["Zope", "Seebiyaano"],
  "Waaberi": ["Maajo", "Buulo Weekiyo", "Tareebiyaano"],
  "Xamar Jajab": ["Buundada"],
  "Xamar Wayne": ["Beerta"]
};

export default function CustomersPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [uploading, setUploading] = useState(false);
  
  const session = getSession();
  const user = session?.user as any;
  const isAdmin = isAdminRole(user?.role);
  const userBranch = user?.assigned_branch || "";

  // Add Customer Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addName, setAddName] = useState("");
  const [addBranch, setAddBranch] = useState("");
  const [addZone, setAddZone] = useState("");
  const [addSeptember, setAddSeptember] = useState("");
  const [addOctober, setAddOctober] = useState("");
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState("");

  // Update Customer Modal state
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [updateId, setUpdateId] = useState<number | null>(null);
  const [updateName, setUpdateName] = useState("");
  const [updateBranch, setUpdateBranch] = useState("");
  const [updateZone, setUpdateZone] = useState("");
  const [updateSeptember, setUpdateSeptember] = useState("");
  const [updateOctober, setUpdateOctober] = useState("");
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateError, setUpdateError] = useState("");

  // Pagination & Sorting state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [sortBy, setSortBy] = useState("id");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const limit = 10;

  useEffect(() => {
    fetchCustomers(currentPage, searchTerm, sourceFilter, sortBy, sortDir);
  }, [currentPage, sourceFilter, sortBy, sortDir]);

  const fetchCustomers = async (page: number, search = "", source = "all", sortField = "id", sortDirection = "asc") => {
    setLoading(true);
    try {
      let query = `${API_URL}/customers?page=${page}&limit=${limit}&sort_by=${sortField}&sort_dir=${sortDirection}`;
      if (search.trim()) query += `&search=${encodeURIComponent(search.trim())}`;
      if (source !== "all") query += `&record_source=${encodeURIComponent(source)}`;

      const response = await fetch(query, {
        headers: { ...authHeaders() },
      });
      if (!response.ok) throw new Error("Failed to fetch customers");
      const result: PaginatedResponse = await response.json();
      setCustomers(result.data);
      setTotalRecords(result.total);
      setTotalPages(result.total_pages);
    } catch (error) {
      console.error("Error fetching customers:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchCustomers(1, searchTerm, sourceFilter, sortBy, sortDir);
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortDir("asc");
    }
  };

  const renderSortIcon = (field: string) => {
    if (sortBy !== field) return <ArrowUpDown className="w-3 h-3 ml-1 text-slate-400 opacity-50 group-hover:opacity-100 transition-opacity" />;
    return sortDir === "asc" 
      ? <ArrowUp className="w-3 h-3 ml-1 text-primary" /> 
      : <ArrowDown className="w-3 h-3 ml-1 text-primary" />;
  };

  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError("");

    if (!addName.trim()) {
      setAddError("Customer Name is required.");
      return;
    }
    if (!addBranch) {
      setAddError("Please select a Branch.");
      return;
    }
    if (!addZone) {
      setAddError("Please select a Zone.");
      return;
    }

    const sepNum = parseFloat(addSeptember);
    const octNum = parseFloat(addOctober);

    if (isNaN(sepNum) || sepNum < 0.5 || sepNum > 100000) {
      setAddError("September consumption must be between 0.5 and 100,000 m³.");
      return;
    }
    if (isNaN(octNum) || octNum < 0.5 || octNum > 100000) {
      setAddError("October consumption must be between 0.5 and 100,000 m³.");
      return;
    }

    setAddLoading(true);
    try {
      const response = await fetch(`${API_URL}/customers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders(),
        },
        body: JSON.stringify({
          Customer_Name: addName.trim(),
          Branch: addBranch,
          Zone: addZone,
          september: sepNum,
          october: octNum,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        setAddError(data.detail || "Failed to create customer.");
        return;
      }

      setIsAddModalOpen(false);
      setAddName("");
      setAddBranch("");
      setAddZone("");
      setAddSeptember("");
      setAddOctober("");
      fetchCustomers(1, searchTerm, sourceFilter, sortBy, sortDir);
      setCurrentPage(1);
    } catch (err: unknown) {
      setAddError("Network error. Please try again.");
    } finally {
      setAddLoading(false);
    }
  };

  const handleOpenUpdateModal = (customer: Customer) => {
    setUpdateError("");
    setUpdateId(customer.id);
    setUpdateName(customer.Customer_Name);
    setUpdateBranch(customer.Branch);
    setUpdateZone(customer.Zone);
    setUpdateSeptember(customer.september?.toString() || "");
    setUpdateOctober(customer.october?.toString() || "");
    setIsUpdateModalOpen(true);
  };

  const handleUpdateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdateError("");

    if (!updateName.trim()) return setUpdateError("Customer Name is required.");
    if (!updateBranch) return setUpdateError("Please select a Branch.");
    if (!updateZone) return setUpdateError("Please select a Zone.");

    const sepNum = parseFloat(updateSeptember);
    const octNum = parseFloat(updateOctober);

    if (isNaN(sepNum) || sepNum < 0.5 || sepNum > 100000) return setUpdateError("September consumption must be between 0.5 and 100,000 m³.");
    if (isNaN(octNum) || octNum < 0.5 || octNum > 100000) return setUpdateError("October consumption must be between 0.5 and 100,000 m³.");

    setUpdateLoading(true);
    try {
      const response = await fetch(`${API_URL}/customers/${updateId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders(),
        },
        body: JSON.stringify({
          Customer_Name: updateName.trim(),
          Branch: isAdmin ? updateBranch : undefined,
          Zone: isAdmin ? updateZone : undefined,
          september: sepNum,
          october: octNum,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        setUpdateError(data.detail || "Failed to update customer.");
        return;
      }

      setIsUpdateModalOpen(false);
      fetchCustomers(currentPage, searchTerm, sourceFilter, sortBy, sortDir);
    } catch (err) {
      setUpdateError("Network error. Please try again.");
    } finally {
      setUpdateLoading(false);
    }
  };

  const startRecord = (currentPage - 1) * limit + 1;
  const endRecord = Math.min(currentPage * limit, totalRecords);

  return (
    <div className="space-y-6">
      {/* ── Top Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold font-heading text-slate-800 dark:text-slate-100">
            Customers
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Manage customer records, track November prediction eligibility, and add new entries.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Upload Excel / CSV */}
          <div>
            <input
              id="excel-upload"
              type="file"
              accept=".xlsx,.xls,.csv"
              className="hidden"
              disabled={uploading}
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const formData = new FormData();
                formData.append("file", file);
                try {
                  setUploading(true);
                  const response = await fetch(`${API_URL}/customers/upload`, {
                    method: "POST",
                    headers: { ...authHeaders() },
                    body: formData,
                  });
                  if (response.ok) {
                    const result = await response.json();
                    alert(result.message || "File uploaded successfully!");
                    fetchCustomers(1, searchTerm, sourceFilter, sortBy, sortDir);
                    setCurrentPage(1);
                  } else {
                    const errorData = await response.json();
                    alert(`Upload failed: ${errorData.detail || "Unknown error"}`);
                  }
                } catch (error) {
                  alert("An error occurred during the upload process.");
                } finally {
                  setUploading(false);
                  e.target.value = "";
                }
              }}
            />
            <Button
              variant="outline"
              className="group gap-2 cursor-pointer border-dashed border-emerald-300 bg-emerald-600 hover:bg-emerald-700 text-white transition-all duration-300 shadow-sm"
              asChild
            >
              <label htmlFor={uploading ? undefined : "excel-upload"}>
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="font-medium">Uploading...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    <span className="font-medium">Upload</span>
                  </>
                )}
              </label>
            </Button>
          </div>

          {/* Add Customer Button */}
          <Button
            onClick={() => { 
              setAddError(""); 
              setAddName("");
              setAddBranch(!isAdmin ? userBranch : "");
              setAddZone("");
              setAddSeptember("");
              setAddOctober("");
              setIsAddModalOpen(true); 
            }}
            className="gap-2 bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-300 hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4" />
            Add Customer
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {/* Search + Filter Header */}
          <div className="p-4 border-b dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <form onSubmit={handleSearchSubmit} className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative max-w-sm w-full sm:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by code (CUS-00001) or name..."
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                />
              </div>

              {/* Source Filter */}
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-400 shrink-0" />
                <select
                  value={sourceFilter}
                  onChange={(e) => setSourceFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs font-medium text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="all">All Sources</option>
                  <option value="imported">Imported Dataset</option>
                  <option value="manual">New Entry</option>
                </select>
              </div>

              <Button type="submit" variant="ghost" size="sm" className="text-xs">
                Search
              </Button>
            </form>

            {/* Record count */}
            {!loading && (
              <p className="text-sm text-slate-500">
                Showing{" "}
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {totalRecords > 0 ? startRecord : 0}–{endRecord}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {totalRecords.toLocaleString()}
                </span>{" "}
                customers
              </p>
            )}
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex flex-col items-center justify-center p-12 text-slate-500 gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                <p className="text-sm">Loading customers...</p>
              </div>
            ) : (
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-800/50 border-b dark:border-slate-800">
                  <tr>
                    <th className="px-6 py-4 font-semibold cursor-pointer group" onClick={() => handleSort("customer_code")}>
                      <div className="flex items-center">ID {renderSortIcon("customer_code")}</div>
                    </th>
                    <th className="px-6 py-4 font-semibold cursor-pointer group" onClick={() => handleSort("Customer_Name")}>
                      <div className="flex items-center">Customer Name {renderSortIcon("Customer_Name")}</div>
                    </th>
                    <th className="px-6 py-4 font-semibold cursor-pointer group" onClick={() => handleSort("Branch")}>
                      <div className="flex items-center">Branch {renderSortIcon("Branch")}</div>
                    </th>
                    <th className="px-6 py-4 font-semibold cursor-pointer group" onClick={() => handleSort("Zone")}>
                      <div className="flex items-center justify-center">Zone {renderSortIcon("Zone")}</div>
                    </th>
                    <th className="px-6 py-4 font-semibold cursor-pointer group" onClick={() => handleSort("september")}>
                      <div className="flex items-center justify-end">September (m³) {renderSortIcon("september")}</div>
                    </th>
                    <th className="px-6 py-4 font-semibold cursor-pointer group" onClick={() => handleSort("october")}>
                      <div className="flex items-center justify-end">October (m³) {renderSortIcon("october")}</div>
                    </th>
                    <th className="px-6 py-4 font-semibold cursor-pointer group" onClick={() => handleSort("november")}>
                      <div className="flex items-center justify-end">November (m³) {renderSortIcon("november")}</div>
                    </th>
                    <th className="px-6 py-4 font-semibold cursor-pointer group" onClick={() => handleSort("record_source")}>
                      <div className="flex items-center justify-center">Record {renderSortIcon("record_source")}</div>
                    </th>
                    <th className="px-6 py-4 text-right font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-6 py-8 text-center text-slate-400">
                        No customers found matching your criteria.
                      </td>
                    </tr>
                  ) : (
                    customers.map((customer) => {
                      const isImported = customer.record_source === "imported";
                      const isPredicted = customer.november !== null && customer.november !== undefined;

                      return (
                        <tr
                          key={customer.id}
                          className="border-b last:border-0 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors"
                        >
                          {/* Permanent Customer Code */}
                          <td className="px-6 py-4 font-mono font-semibold text-primary text-xs">
                            {customer.customer_code}
                          </td>

                          {/* Customer Name */}
                          <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-100">
                            {customer.Customer_Name}
                          </td>

                          {/* Branch & Zone */}
                          <td className="px-6 py-4 text-slate-500">{customer.Branch}</td>
                          <td className="px-6 py-4 text-center text-slate-500">{customer.Zone}</td>

                          {/* September & October */}
                          <td className="px-6 py-4 text-right font-semibold text-slate-800 dark:text-slate-200">
                            {customer.september != null ? Number(customer.september).toFixed(2) : "-"}
                          </td>
                          <td className="px-6 py-4 text-right font-semibold text-slate-800 dark:text-slate-200">
                            {customer.october != null ? Number(customer.october).toFixed(2) : "-"}
                          </td>

                          {/* November value */}
                          <td className="px-6 py-4 text-right font-bold">
                            {isPredicted ? (
                              <span className="inline-flex items-center gap-1.5 text-slate-900 dark:text-slate-100">
                                {Number(customer.november).toFixed(2)}
                                {!isImported && (
                                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400">
                                    <Lock className="w-2.5 h-2.5 mr-0.5" /> Predicted
                                  </span>
                                )}
                              </span>
                            ) : (
                              <span className="text-slate-400 font-normal italic">Not Predicted</span>
                            )}
                          </td>

                          {/* Record Source Badge */}
                          <td className="px-6 py-4 text-center">
                            {isImported ? (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold  text-blue-700  dark:bg-blue-900/30 dark:text-blue-300">
                                Imported
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold  text-emerald-700  dark:bg-emerald-900/30 dark:text-emerald-300">
                                New 
                              </span>
                            )}
                          </td>

                          {/* Action Button */}
                          <td className="px-6 py-4 text-right">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleOpenUpdateModal(customer)}
                              className="text-primary hover:text-primary/80"
                            >
                              Update
                            </Button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination Controls */}
          {!loading && totalPages > 1 && (
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
                        className={`w-8 h-8 rounded-md text-sm font-medium transition-colors ${currentPage === p
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

      {/* ── Add Customer Modal ── */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">Add New Customer</h3>
                  <p className="text-xs text-slate-400">Creates a New Entry (November prediction eligible)</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {addError && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-xs text-red-600 dark:text-red-400">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{addError}</span>
              </div>
            )}

            <form onSubmit={handleAddCustomer} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Customer Name *
                </label>
                <input
                  type="text"
                  value={addName}
                  onChange={(e) => setAddName(e.target.value)}
                  placeholder="e.g. Hassan Jama Ali"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Branch *
                  </label>
                  <select
                    value={addBranch}
                    onChange={(e) => {
                      setAddBranch(e.target.value);
                      setAddZone("");
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-50"
                    disabled={!isAdmin}
                    required
                  >
                    <option value="">Select Branch</option>
                    {branchList.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                  {!isAdmin && <p className="text-[10px] text-slate-500 mt-1">Assigned branch — cannot be changed</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Zone *
                  </label>
                  <select
                    value={addZone}
                    onChange={(e) => setAddZone(e.target.value)}
                    disabled={!addBranch}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-50"
                    required
                  >
                    <option value="">Select Zone</option>
                    {addBranch && (branchZones[addBranch] || []).map((z) => (
                      <option key={z} value={z}>{z}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    September Consumption (m³) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.5"
                    max="100000"
                    value={addSeptember}
                    onChange={(e) => setAddSeptember(e.target.value)}
                    placeholder="e.g. 15.50"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    October Consumption (m³) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.5"
                    max="100000"
                    value={addOctober}
                    onChange={(e) => setAddOctober(e.target.value)}
                    placeholder="e.g. 12.80"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                    required
                  />
                </div>
              </div>

              <p className="text-xs text-slate-400 italic">
                Note: November value is automatically initialized to NULL and will be locked once predicted by ML.
              </p>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={addLoading}
                  className="bg-primary hover:bg-primary/90 text-white gap-2"
                >
                  {addLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Customer"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Update Customer Modal ── */}
      {isUpdateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">Update Customer</h3>
                  <p className="text-xs text-slate-400">Modify customer details</p>
                </div>
              </div>
              <button
                onClick={() => setIsUpdateModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {updateError && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-xs text-red-600 dark:text-red-400">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{updateError}</span>
              </div>
            )}

            <form onSubmit={handleUpdateCustomer} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Customer Name *
                </label>
                <input
                  type="text"
                  value={updateName}
                  onChange={(e) => setUpdateName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Branch *
                  </label>
                  <select
                    value={updateBranch}
                    onChange={(e) => {
                      setUpdateBranch(e.target.value);
                      setUpdateZone("");
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-50"
                    disabled={!isAdmin}
                    required
                  >
                    <option value="">Select Branch</option>
                    {branchList.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Zone *
                  </label>
                  <select
                    value={updateZone}
                    onChange={(e) => setUpdateZone(e.target.value)}
                    disabled={!isAdmin || !updateBranch}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-50"
                    required
                  >
                    <option value="">Select Zone</option>
                    {updateBranch && (branchZones[updateBranch] || []).map((z) => (
                      <option key={z} value={z}>{z}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    September Consumption (m³) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.5"
                    max="100000"
                    value={updateSeptember}
                    onChange={(e) => setUpdateSeptember(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    October Consumption (m³) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.5"
                    max="100000"
                    value={updateOctober}
                    onChange={(e) => setUpdateOctober(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsUpdateModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={updateLoading}
                  className="bg-primary hover:bg-primary/90 text-white gap-2"
                >
                  {updateLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update Customer"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}