"use client";

import { useState, useEffect } from "react";
import { Search, Plus, ExternalLink, Upload, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

interface Customer {
  id: number;
  Customer_Name: string;
  Branch: string;
  Zone: string;
  september: number;
  october: number;
  november: number;
}

interface PaginatedResponse {
  total: number;
  page: number;
  limit: number;
  total_pages: number;
  data: Customer[];
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [uploading, setUploading] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const limit = 10;

  useEffect(() => {
    fetchCustomers(currentPage);
  }, [currentPage]);

  const fetchCustomers = async (page: number) => {
    setLoading(true);
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/customers?page=${page}&limit=${limit}`
      );
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

  const filteredCustomers = customers.filter((customer) =>
    customer.Customer_Name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const startRecord = (currentPage - 1) * limit + 1;
  const endRecord = Math.min(currentPage * limit, totalRecords);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold font-heading text-slate-800 dark:text-slate-100">
            Customers
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Manage customers list and details.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Upload Excel */}
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
                  const response = await fetch("http://127.0.0.1:8000/customers/upload", {
                    method: "POST",
                    body: formData,
                  });
                  if (response.ok) {
                    const result = await response.json();
                    alert(result.message || "File uploaded successfully!");
                    fetchCustomers(1);
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
            {/* <Button
              variant="outline"
              className="group gap-2 cursor-pointer border-dashed border-slate-300 bg-green-500 text-white transition-all duration-300"
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
                    <span className="font-medium">Upload Excel</span>
                  </>
                )}
              </label>
            </Button> */}
          </div>

          {/* <Button className="gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-300 hover:-translate-y-0.5">
            <Plus className="w-4 h-4" />
            Add Customer
          </Button> */}
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {/* Search + Record Count */}
          <div className="p-4 border-b dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search customers by name..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
              />
            </div>

            {/* Record count */}
            {!loading && (
              <p className="text-sm text-slate-500">
                Showing{" "}
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {startRecord}–{endRecord}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {totalRecords.toLocaleString()}
                </span>{" "}
                customers
              </p>
            )}
          </div>

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
                    <th className="px-6 py-4">ID</th>
                    <th className="px-6 py-4">Customer Name</th>
                    <th className="px-6 py-4">Branch</th>
                    <th className="px-6 py-4 text-center">Zone</th>
                    <th className="px-6 py-4 text-right">September</th>
                    <th className="px-6 py-4 text-right">October</th>
                    <th className="px-6 py-4 text-right">November</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCustomers.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-8 text-center text-slate-400">
                        No customers found.
                      </td>
                    </tr>
                  ) : (
                    filteredCustomers.map((customer, index) => (
                      <tr
                        key={customer.id}
                        className="border-b last:border-0 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors"
                      >
                        <td className="px-6 py-4 text-slate-400 text-xs">
                          {(currentPage - 1) * limit + index + 1}
                        </td>
                        <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-100">
                          {customer.Customer_Name}
                        </td>
                        <td className="px-6 py-4 text-slate-500">{customer.Branch}</td>
                        <td className="px-6 py-4 text-center text-slate-500">{customer.Zone}</td>
                        <td className="px-6 py-4 text-right font-semibold text-slate-900 dark:text-slate-100">
                          {customer.september}
                        </td>
                        <td className="px-6 py-4 text-right font-semibold text-slate-900 dark:text-slate-100">
                          {customer.october}
                        </td>
                        <td className="px-6 py-4 text-right font-semibold text-slate-900 dark:text-slate-100">
                          {customer.november}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Button variant="ghost" size="icon" className="text-slate-400 hover:text-primary">
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))
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

              {/* Page numbers */}
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