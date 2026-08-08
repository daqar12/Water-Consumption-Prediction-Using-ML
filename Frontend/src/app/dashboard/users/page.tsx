"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, Plus, Mail, X, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { API_URL } from "@/lib/config";
import { authHeaders } from "@/lib/session";

const API_BASE = API_URL;

interface User {
  id: number;
  username: string;
  fullname: string;
  phone: string;
  email: string;
  role: string;
}

interface EditFormData {
  fullname: string;
  phone: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface EditFormErrors {
  fullname?: string;
  phone?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

const emptyAddForm = {
  username: "",
  email: "",
  phone: "",
  fullname: "",
  password: "",
};

const emptyEditForm: EditFormData = {
  fullname: "",
  phone: "",
  email: "",
  password: "",
  confirmPassword: "",
};

function validatePhone(phone: string): string {
  const value = phone.trim();
  if (!value) return "Phone number is required.";
  if (!/^\+?[0-9\s\-()]{7,20}$/.test(value)) return "Invalid phone number format.";
  const digits = value.replace(/\D/g, "");
  if (digits.length < 7 || digits.length > 15) return "Invalid phone number format.";
  return "";
}

function validateEmail(email: string): string {
  const value = email.trim();
  if (!value) return "Email address is required.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Invalid email format.";
  return "";
}

function validateEditForm(form: EditFormData): EditFormErrors {
  const errors: EditFormErrors = {};
  const name = form.fullname.trim();

  if (!name) errors.fullname = "Full name is required.";
  else if (name.length < 3) errors.fullname = "Full name must be at least 3 characters.";
  else if (name.length > 100) errors.fullname = "Full name must be at most 100 characters.";

  const phoneErr = validatePhone(form.phone);
  if (phoneErr) errors.phone = phoneErr;

  const emailErr = validateEmail(form.email);
  if (emailErr) errors.email = emailErr;

  if (form.password) {
    if (form.password.length < 8) {
      errors.password = "Password must contain at least 8 characters.";
    }
    if (!form.confirmPassword) {
      errors.confirmPassword = "Confirm password is required.";
    } else if (form.password !== form.confirmPassword) {
      errors.confirmPassword = "Passwords do not match.";
    }
  } else if (form.confirmPassword) {
    errors.confirmPassword = "Passwords do not match.";
  }

  return errors;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Add User Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState(emptyAddForm);

  // Edit User Modal & Form State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editFormData, setEditFormData] = useState<EditFormData>(emptyEditForm);
  const [editErrors, setEditErrors] = useState<EditFormErrors>({});
  const [editApiError, setEditApiError] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (!successMessage) return;
    const timer = setTimeout(() => setSuccessMessage(""), 3500);
    return () => clearTimeout(timer);
  }, [successMessage]);

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API_BASE}/users`, {
        headers: { ...authHeaders() }
      });
      const data = await response.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch {
      console.log("Error fetching users");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE}/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders()
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setIsModalOpen(false);
        setFormData(emptyAddForm);
        fetchUsers();
      } else {
        console.error("Failed to add user");
      }
    } catch (error) {
      console.error("Error submitting form", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setEditFormData({
      fullname: user.fullname || "",
      phone: user.phone || "",
      email: user.email || "",
      password: "",
      confirmPassword: "",
    });
    setEditErrors({});
    setEditApiError("");
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditingUser(null);
    setEditFormData(emptyEditForm);
    setEditErrors({});
    setEditApiError("");
  };

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const next = { ...editFormData, [name]: value };
    setEditFormData(next);
    setEditErrors(validateEditForm(next));
    setEditApiError("");
  };

  const editValidation = useMemo(() => validateEditForm(editFormData), [editFormData]);
  const isEditFormValid = Object.keys(editValidation).length === 0;

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    const errors = validateEditForm(editFormData);
    setEditErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setIsUpdating(true);
    setEditApiError("");

    const payload: Record<string, string> = {
      fullname: editFormData.fullname.trim(),
      phone: editFormData.phone.trim(),
      email: editFormData.email.trim(),
    };

    if (editFormData.password) {
      payload.password = editFormData.password;
    }

    try {
      const response = await fetch(`${API_BASE}/users/${editingUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const detail = typeof data.detail === "string" ? data.detail : "Failed to update user.";
        setEditApiError(detail);
        return;
      }

      closeEditModal();
      setSuccessMessage("User updated successfully.");
      await fetchUsers();
    } catch {
      setEditApiError("Failed to update user.");
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredUsers = users.filter((user) =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 relative">
      {successMessage && (
        <div className="fixed top-6 right-6 z-[60] flex items-center gap-2 rounded-xl bg-emerald-600 text-white px-4 py-3 shadow-lg animate-in fade-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span className="text-sm font-medium">{successMessage}</span>
        </div>
      )}

      {/* Header section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold font-heading text-slate-800 dark:text-slate-100">
            System Users
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Manage platform access, roles and user permissions.
          </p>
        </div>
        <Button
          onClick={() => setIsModalOpen(true)}
          className="gap-2 shadow-lg shadow-primary/20 hover:-translate-y-0.5 transition-transform"
        >
          <Plus className="w-4 h-4" />
          Add User
        </Button>
      </div>

      {/* Main Table Card */}
      <Card>
        <CardContent className="p-0">
          <div className="p-4 border-b dark:border-slate-800">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search..."
                className="w-full pl-10 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 dark:bg-slate-900 dark:border-slate-700"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-800/50 border-b dark:border-slate-800">
                <tr>
                  <th scope="col" className="px-6 py-4">UserName</th>
                  <th scope="col" className="px-6 py-4">Fullname</th>
                  <th scope="col" className="px-6 py-4">Phone</th>
                  <th scope="col" className="px-6 py-4">Email</th>
                  <th scope="col" className="px-6 py-4">Role</th>
                  <th scope="col" className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-slate-400">
                      Loading users...
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-slate-400">
                      No users found.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b last:border-0 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                            {user.username.split(" ").map((n) => n[0]).join("")}
                          </div>
                          <span className="font-medium text-slate-900 dark:text-slate-100">
                            {user.username}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-900">{user.fullname}</td>
                      <td className="px-6 py-4 text-slate-900">{user.phone}</td>
                      <td className="px-6 py-4 text-slate-500">
                        <div className="flex items-center gap-2">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          {user.email}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wider ${
                            user.role === "Admin"
                              ? "bg-danger/10 text-danger"
                              : user.role === "Manager"
                              ? "bg-secondary/10 text-secondary"
                              : "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-primary hover:text-primary/80"
                          onClick={() => openEditModal(user)}
                        >
                          Edit User
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Modern Add User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <Card className="w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b dark:border-slate-800">
              <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100">
                Register New User
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <CardContent className="p-6">
              <form onSubmit={handleAddUser} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Username</label>
                  <input
                    required
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 dark:bg-slate-900 dark:border-slate-700"
                    placeholder="johndoe"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Full Name</label>
                  <input
                    required
                    name="fullname"
                    value={formData.fullname}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 dark:bg-slate-900 dark:border-slate-700"
                    placeholder="John Doe"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Email</label>
                  <input
                    required
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 dark:bg-slate-900 dark:border-slate-700"
                    placeholder="john@example.com"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Phone</label>
                  <input
                    required
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 dark:bg-slate-900 dark:border-slate-700"
                    placeholder="+1 234 567 890"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Password</label>
                  <input
                    required
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 dark:bg-slate-900 dark:border-slate-700"
                    placeholder="••••••••"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t dark:border-slate-800">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setIsModalOpen(false)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting} className="gap-2">
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save User"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Edit User Modal */}
      {isEditModalOpen && editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <Card className="w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b dark:border-slate-800 sticky top-0 bg-white dark:bg-slate-950 z-10">
              <div>
                <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100">
                  Edit User
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">@{editingUser.username}</p>
              </div>
              <button
                onClick={closeEditModal}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <CardContent className="p-6">
              <form onSubmit={handleUpdateUser} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Full Name</label>
                  <input
                    name="fullname"
                    value={editFormData.fullname}
                    onChange={handleEditInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 dark:bg-slate-900 dark:border-slate-700 ${
                      editErrors.fullname ? "border-red-400" : ""
                    }`}
                    placeholder="John Doe"
                  />
                  {editErrors.fullname && (
                    <p className="text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {editErrors.fullname}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Phone Number</label>
                  <input
                    name="phone"
                    value={editFormData.phone}
                    onChange={handleEditInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 dark:bg-slate-900 dark:border-slate-700 ${
                      editErrors.phone ? "border-red-400" : ""
                    }`}
                    placeholder="+252612747820"
                  />
                  {editErrors.phone && (
                    <p className="text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {editErrors.phone}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={editFormData.email}
                    onChange={handleEditInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 dark:bg-slate-900 dark:border-slate-700 ${
                      editErrors.email ? "border-red-400" : ""
                    }`}
                    placeholder="john@example.com"
                  />
                  {editErrors.email && (
                    <p className="text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {editErrors.email}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Password <span className="text-slate-400 font-normal">(optional)</span>
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={editFormData.password}
                    onChange={handleEditInputChange}
                    autoComplete="new-password"
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 dark:bg-slate-900 dark:border-slate-700 ${
                      editErrors.password ? "border-red-400" : ""
                    }`}
                    placeholder="Leave blank to keep current"
                  />
                  {editErrors.password && (
                    <p className="text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {editErrors.password}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Confirm Password
                    {editFormData.password ? (
                      <span className="text-red-400 font-normal"> *</span>
                    ) : (
                      <span className="text-slate-400 font-normal"> (optional)</span>
                    )}
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={editFormData.confirmPassword}
                    onChange={handleEditInputChange}
                    autoComplete="new-password"
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 dark:bg-slate-900 dark:border-slate-700 ${
                      editErrors.confirmPassword ? "border-red-400" : ""
                    }`}
                    placeholder="Repeat new password"
                  />
                  {editErrors.confirmPassword && (
                    <p className="text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {editErrors.confirmPassword}
                    </p>
                  )}
                </div>

                {editApiError && (
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                    <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                    <p className="text-xs text-red-600 dark:text-red-400">{editApiError}</p>
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-4 border-t dark:border-slate-800">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={closeEditModal}
                    disabled={isUpdating}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isUpdating || !isEditFormValid}
                    className="gap-2"
                  >
                    {isUpdating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      "Update User"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
