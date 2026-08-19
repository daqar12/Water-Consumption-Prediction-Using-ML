"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Save, 
  Building, 
  BrainCircuit, 
  Droplets, 
  User, 
  Bell, 
  Shield, 
  Database, 
  History, 
  ChevronDown, 
  Globe, 
  Calendar, 
  Clock, 
  Smartphone, 
  Lock, 
  Key, 
  RotateCcw,
  CheckCircle,
  AlertTriangle,
  Info,
  Trash2,
  Download,
  Plus,
  RefreshCw,
  Eye,
  EyeOff,
  Upload
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { getSession } from "@/lib/session";
import { cn } from "@/lib/utils";

// Types for Settings State
interface SettingsState {
  // 1. System Information
  systemName: string;
  orgName: string;
  logoUrl: string;
  contactEmail: string;
  supportPhone: string;
  hqAddress: string;
  timeZone: string;
  defaultLanguage: string;
  dateFormat: string;
  measurementUnit: string;

  // 2. Machine Learning Settings
  activeModel: string;
  modelVersion: string;
  predictionStatus: "active" | "training" | "disabled";
  modelAccuracy: string;
  lastTrainingDate: string;
  predictionThreshold: number;
  enablePredictionLogs: boolean;
  enableAutoValidation: boolean;

  // 3. Water Consumption Settings
  minConsumption: number;
  maxConsumption: number;
  maxDecimalPlaces: number;
  enableDuplicateCheck: boolean;
  defaultPredictionMonth: string;

  // 4. User Management (Profile is read-only metadata, password / 2FA are interactive)
  profileName: string;
  profileEmail: string;
  profileRole: string;
  twoFactorEnabled: boolean;

  // 5. Notification Settings
  emailNotifications: boolean;
  smsNotifications: boolean;
  predictionCompleted: boolean;
  predictionFailed: boolean;
  systemUpdates: boolean;
  securityAlerts: boolean;

  // 6. Security
  sessionTimeout: number; // minutes
  jwtExpiration: number; // hours
  failedLoginLimit: number;
  apiKey: string;

  // 7. Database & Backup
  dbStatus: "connected" | "disconnected" | "maintenance";
  lastBackup: string;
  autoBackup: boolean;
  backupFrequency: string;

  // 8. Prediction History Settings
  maxStoredPredictions: number;
  autoDeleteOldPredictions: boolean;
  historyRetentionPeriod: string;
  exportFormat: string;
}

// Initial default state values
const DEFAULT_SETTINGS: SettingsState = {
  systemName: "HydroFlow Core",
  orgName: "Water Consumption prediction ML",
  logoUrl: "", // Defaults to generated initials avatar if empty
  contactEmail: "inf@wateralpha.com",
  supportPhone: "+252 61 123 4567",
  hqAddress: "Maka Al-Mukarama Road, Mogadishu, Somalia",
  timeZone: "UTC+3 (East Africa Time)",
  defaultLanguage: "English",
  dateFormat: "YYYY-MM-DD",
  measurementUnit: "Cubic Meter (m³)",

  activeModel: "linear_regression",
  modelVersion: "v2.4.1",
  predictionStatus: "active",
  modelAccuracy: "96.4%",
  lastTrainingDate: "2026-07-25",
  predictionThreshold: 0.85,
  enablePredictionLogs: true,
  enableAutoValidation: true,

  minConsumption: 0.5,
  maxConsumption: 100000,
  maxDecimalPlaces: 2,
  enableDuplicateCheck: true,
  defaultPredictionMonth: "November",

  profileName: "Mohamed Dahir Abdullahi",
  profileEmail: "modahir@wateralpha.com",
  profileRole: "Administrator",
  twoFactorEnabled: false,

  emailNotifications: true,
  smsNotifications: false,
  predictionCompleted: true,
  predictionFailed: true,
  systemUpdates: false,
  securityAlerts: true,

  sessionTimeout: 45,
  jwtExpiration: 24,
  failedLoginLimit: 5,
  apiKey: "",

  dbStatus: "connected",
  lastBackup: "2026-07-28 02:00:00",
  autoBackup: true,
  backupFrequency: "daily",

  maxStoredPredictions: 50000,
  autoDeleteOldPredictions: true,
  historyRetentionPeriod: "180",
  exportFormat: "CSV",
};

// Main Component
export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingsState>(DEFAULT_SETTINGS);
  const [savedSettings, setSavedSettings] = useState<SettingsState>(DEFAULT_SETTINGS);
  
  // Tabs management
  const [activeTab, setActiveTab] = useState<string>("system-info");

  // Collapsible cards state
  const [collapsedCards, setCollapsedCards] = useState<Record<string, boolean>>({
    "sys-profile": false,
    "sys-contact": false,
    "sys-locale": false,
    "ml-model": false,
    "ml-tuning": false,
    "water-validation": false,
    "water-constraints": false,
    "user-profile": false,
    "user-pwd": true, // Collapsed by default
    "user-sessions": false,
    "noti-channels": false,
    "noti-triggers": false,
    "sec-policies": false,
    "sec-api": false,
    "sec-perms": false,
    "db-status": false,
    "db-restore": false,
    "db-export": false,
    "history-storage": false,
    "history-export": false,
  });

  // Password change state
  const [passwordState, setPasswordState] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // UI features state
  const [showApiKey, setShowApiKey] = useState(false);
  const [isBackupLoading, setIsBackupLoading] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Active Sessions Mock Data
  const [sessions, setSessions] = useState([
    { id: 1, device: "Chrome on Windows 11", ip: "197.220.35.42", location: "Mogadishu, Somalia", active: true },
    { id: 2, device: "Safari on iPhone 15", ip: "197.220.35.45", location: "Mogadishu, Somalia", active: false }
  ]);

  // Login History Mock Data
  const loginHistory = [
    { id: 1, timestamp: "2026-07-28 14:32:10", device: "Chrome on Windows 11", ip: "197.220.35.42", status: "Success" },
    { id: 2, timestamp: "2026-07-27 09:15:44", device: "Safari on iPhone 15", ip: "197.220.35.45", status: "Success" },
    { id: 3, timestamp: "2026-07-26 18:22:01", device: "Firefox on macOS", ip: "102.164.21.11", status: "Failed (Wrong Password)" }
  ];

  // Audit Logs Mock Data
  const auditLogs = [
    { id: 1, timestamp: "2026-07-28 15:10:22", action: "User session expired", user: "system", severity: "Low" },
    { id: 2, timestamp: "2026-07-28 14:32:10", action: "Successful login", user: "dahir@adt.org", severity: "Low" },
    { id: 3, timestamp: "2026-07-26 18:22:01", action: "Failed login attempt", user: "dahir@adt.org", severity: "Medium" },
    { id: 4, timestamp: "2026-07-25 11:05:00", action: "Database backup completed", user: "backup_service", severity: "Low" }
  ];

  // Load from local storage
  useEffect(() => {
    const saved = localStorage.getItem("water_prediction_settings");
    let loadedSettings = DEFAULT_SETTINGS;
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        loadedSettings = { ...DEFAULT_SETTINGS, ...parsed };
      } catch (e) {
        console.error("Failed to parse settings from storage", e);
      }
    }
    
    // Sync with session if session exists
    const session = getSession();
    if (session?.user) {
      const user = session.user as any;
      loadedSettings = {
        ...loadedSettings,
        profileName: user.name || loadedSettings.profileName,
        profileEmail: user.email || loadedSettings.profileEmail,
        profileRole: user.role || loadedSettings.profileRole,
      };
    }
    setSettings(loadedSettings);
    setSavedSettings(loadedSettings);
  }, []);

  // Run validation checks on changes
  useEffect(() => {
    validateForm();
  }, [settings, passwordState]);

  // Validation Logic
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // System Information
    if (!settings.systemName.trim()) {
      newErrors.systemName = "System Name is required.";
    } else if (settings.systemName.trim().length < 3) {
      newErrors.systemName = "System Name must be at least 3 characters.";
    }

    if (!settings.orgName.trim()) {
      newErrors.orgName = "Organization Name is required.";
    } else if (settings.orgName.trim().length < 3) {
      newErrors.orgName = "Organization Name must be at least 3 characters.";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!settings.contactEmail.trim()) {
      newErrors.contactEmail = "Contact email is required.";
    } else if (!emailRegex.test(settings.contactEmail)) {
      newErrors.contactEmail = "Enter a valid email address.";
    }

    const phoneRegex = /^\+?[0-9\s\-()]{7,18}$/;
    if (!settings.supportPhone.trim()) {
      newErrors.supportPhone = "Support phone is required.";
    } else if (!phoneRegex.test(settings.supportPhone)) {
      newErrors.supportPhone = "Enter a valid phone number.";
    }

    if (!settings.hqAddress.trim()) {
      newErrors.hqAddress = "Headquarters Address is required.";
    } else if (settings.hqAddress.trim().length < 5) {
      newErrors.hqAddress = "Address must be at least 5 characters.";
    }

    // Machine Learning Settings
    const semVerRegex = /^v?\d+\.\d+\.\d+$/;
    if (!settings.modelVersion.trim()) {
      newErrors.modelVersion = "Model Version is required.";
    } else if (!semVerRegex.test(settings.modelVersion)) {
      newErrors.modelVersion = "Use semantic versioning format (e.g. v1.0.0 or 2.4.1).";
    }

    if (isNaN(settings.predictionThreshold) || settings.predictionThreshold < 0 || settings.predictionThreshold > 1) {
      newErrors.predictionThreshold = "Threshold must be between 0.0 and 1.0.";
    }

    // Water Consumption Settings
    if (isNaN(settings.minConsumption) || settings.minConsumption < 0) {
      newErrors.minConsumption = "Minimum consumption must be greater than or equal to 0.";
    }

    if (isNaN(settings.maxConsumption) || settings.maxConsumption <= settings.minConsumption) {
      newErrors.maxConsumption = `Maximum consumption must be greater than Minimum consumption (${settings.minConsumption} m³).`;
    } else if (settings.maxConsumption > 10000000) {
      newErrors.maxConsumption = "Maximum consumption cannot exceed 10,000,000 m³.";
    }

    if (isNaN(settings.maxDecimalPlaces) || settings.maxDecimalPlaces < 0 || settings.maxDecimalPlaces > 5) {
      newErrors.maxDecimalPlaces = "Decimal places must be an integer between 0 and 5.";
    }

    // Security Settings
    if (isNaN(settings.sessionTimeout) || settings.sessionTimeout < 1 || settings.sessionTimeout > 1440) {
      newErrors.sessionTimeout = "Session timeout must be between 1 and 1440 minutes.";
    }

    if (isNaN(settings.jwtExpiration) || settings.jwtExpiration < 1 || settings.jwtExpiration > 720) {
      newErrors.jwtExpiration = "JWT Expiration must be between 1 and 720 hours.";
    }

    if (isNaN(settings.failedLoginLimit) || settings.failedLoginLimit < 1 || settings.failedLoginLimit > 20) {
      newErrors.failedLoginLimit = "Limit must be between 1 and 20 attempts.";
    }

    // Prediction History Settings
    if (isNaN(settings.maxStoredPredictions) || settings.maxStoredPredictions < 100) {
      newErrors.maxStoredPredictions = "Minimum value is 100 predictions.";
    }

    // Change Password Validation (only validated if at least one field is filled)
    const pw = passwordState;
    if (pw.currentPassword || pw.newPassword || pw.confirmPassword) {
      if (!pw.currentPassword) {
        newErrors.currentPassword = "Current password is required to save changes.";
      }
      
      // Password Policy: Min 8 chars, 1 uppercase, 1 number, 1 special char
      const pwPolicy = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      if (!pw.newPassword) {
        newErrors.newPassword = "New password is required.";
      } else if (!pwPolicy.test(pw.newPassword)) {
        newErrors.newPassword = "Must be at least 8 chars with 1 uppercase, 1 number, and 1 special char.";
      }

      if (pw.newPassword !== pw.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match.";
      }
    }

    setErrors(newErrors);
  };

  const hasChanges = 
    JSON.stringify(settings) !== JSON.stringify(savedSettings) || 
    passwordState.currentPassword !== "" || 
    passwordState.newPassword !== "" || 
    passwordState.confirmPassword !== "";

  const isValid = Object.keys(errors).length === 0;

  // Toggle Collapse
  const toggleCard = (id: string) => {
    setCollapsedCards(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // State Change Handlers
  const handleInputChange = (field: keyof SettingsState, val: any) => {
    setSettings(prev => ({ ...prev, [field]: val }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Logo size must be less than 2MB.");
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          handleInputChange("logoUrl", event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const generateApiKey = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let key = "adt_live_";
    for (let i = 0; i < 24; i++) {
      key += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    handleInputChange("apiKey", key);
  };

  const handleBackupNow = () => {
    setIsBackupLoading(true);
    setTimeout(() => {
      setIsBackupLoading(false);
      const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
      handleInputChange("lastBackup", nowStr);
      alert("Database backup completed successfully.");
    }, 1500);
  };

  const handleRestoreNow = () => {
    setIsRestoring(true);
    setTimeout(() => {
      setIsRestoring(false);
      alert("Database successfully restored to the latest snapshot.");
    }, 2000);
  };

  const handleRevokeSession = (id: number) => {
    setSessions(prev => prev.filter(s => s.id !== id));
  };

  // Save Settings Action
  const handleSave = () => {
    if (!isValid) return;

    // Persist configurations to localStorage
    localStorage.setItem("water_prediction_settings", JSON.stringify(settings));
    setSavedSettings(settings);

    // Simulate password change if fields filled
    if (passwordState.newPassword) {
      alert("Password updated successfully.");
      setPasswordState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    }

    setSaveSuccessMsg("Settings updated successfully!");
    setTimeout(() => setSaveSuccessMsg(""), 4000);
  };

  // Reset Settings Action
  const handleReset = () => {
    setSettings(savedSettings);
    setPasswordState({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  // Sections navigation configurations
  const sections = [
    { id: "system-info", name: "System Information", icon: Building },
    { id: "ml-settings", name: "Machine Learning Settings", icon: BrainCircuit },
    { id: "water-settings", name: "Water Consumption Settings", icon: Droplets },
    { id: "user-mgmt", name: "User Management", icon: User },
    { id: "notifications", name: "Notification Settings", icon: Bell },
    { id: "security", name: "Security Policies", icon: Shield },
    { id: "database", name: "Database & Backup", icon: Database },
    { id: "history-settings", name: "Prediction History Settings", icon: History },
  ];

  // Helper Switch component
  const ToggleSwitch = ({ 
    checked, 
    onChange, 
    disabled = false 
  }: { 
    checked: boolean; 
    onChange: (val: boolean) => void; 
    disabled?: boolean;
  }) => {
    return (
      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:cursor-not-allowed disabled:opacity-50",
          checked ? "bg-primary" : "bg-slate-200 dark:bg-slate-700"
        )}
      >
        <span
          className={cn(
            "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
            checked ? "translate-x-5" : "translate-x-0"
          )}
        />
      </button>
    );
  };

  // Form Field Wrapper
  const FormField = ({ 
    label, 
    error, 
    required, 
    children 
  }: { 
    label: string; 
    error?: string; 
    required?: boolean; 
    children: React.ReactNode;
  }) => {
    return (
      <div className="space-y-1.5 w-full">
        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
          {label}
          {required && <span className="text-red-500">*</span>}
        </label>
        {children}
        {error && (
          <p className="text-xs font-semibold text-red-500 flex items-center gap-1 animate-in fade-in duration-200">
            <AlertTriangle className="w-3.5 h-3.5" />
            {error}
          </p>
        )}
      </div>
    );
  };

  // Card Header / Collapsible container
  const SettingsGroup = ({ 
    id, 
    title, 
    icon: Icon, 
    children 
  }: { 
    id: string; 
    title: string; 
    icon: any; 
    children: React.ReactNode;
  }) => {
    const isOpen = !collapsedCards[id];
    return (
      <Card className="overflow-hidden border border-slate-200/80 dark:border-slate-800 shadow-sm bg-card hover:shadow-md transition-all duration-200">
        <div 
          onClick={() => toggleCard(id)}
          className="flex items-center justify-between p-5 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Icon className="w-4 h-4" />
            </div>
            <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">{title}</h3>
          </div>
          <ChevronDown className={cn("w-5 h-5 text-slate-400 transition-transform duration-200", isOpen ? "transform rotate-180" : "")} />
        </div>
        {isOpen && (
          <CardContent className="p-6 pt-0 border-t border-slate-100 dark:border-slate-800/60 animate-in slide-in-from-top-2 duration-200">
            <div className="pt-6 space-y-6">
              {children}
            </div>
          </CardContent>
        )}
      </Card>
    );
  };

  const inputStyle = "w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary text-sm transition-all text-slate-800 dark:text-slate-100 placeholder:text-slate-400";

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-24">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800/60 pb-6">
        <div>
          <h2 className="text-3xl font-bold font-heading text-slate-800 dark:text-slate-100 flex items-center gap-3">
            Platform Settings
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Redesign system-wide rules, models accuracy thresholds, security policies, and localization.
          </p>
        </div>

        {/* System & Status Badges */}
        <div className="flex items-center gap-2">
          <Badge variant={settings.predictionStatus}>
            Model: {settings.predictionStatus === "active" ? "🟢 Active" : settings.predictionStatus === "training" ? "🟡 Training" : "🔴 Disabled"}
          </Badge>
          <Badge variant={settings.dbStatus === "connected" ? "success" : "danger"}>
            Database: {settings.dbStatus === "connected" ? "Connected" : "Offline"}
          </Badge>
        </div>
      </div>

      {/* Main Grid: Left Nav + Form Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Sticky Desktop Left Navigation / Responsive Tab Switcher */}
        <div className="lg:col-span-1">
          <div className="sticky top-6 flex lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible pb-3 lg:pb-0 scrollbar-none z-10 bg-background/80 backdrop-blur-md lg:bg-transparent -mx-4 px-4 lg:mx-0 lg:px-0">
            {sections.map((sec) => {
              const Icon = sec.icon;
              const isActive = activeTab === sec.id;
              return (
                <button
                  key={sec.id}
                  onClick={() => setActiveTab(sec.id)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg whitespace-nowrap transition-all duration-200 border",
                    isActive
                      ? "bg-primary border-primary text-white shadow-sm shadow-primary/20"
                      : "bg-card hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200/80 dark:border-slate-800"
                  )}
                >
                  <Icon className={cn("w-4 h-4 shrink-0", isActive ? "text-white" : "text-slate-400")} />
                  {sec.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Settings Form Content Area */}
        <div className="lg:col-span-3 space-y-6">

          {/* 1. SYSTEM INFORMATION TAB */}
          {activeTab === "system-info" && (
            <div className="space-y-6">
              
              {/* Profile card with logo and metadata */}
              <Card className="border border-slate-200 dark:border-slate-800 bg-card overflow-hidden">
                <CardContent className="p-6 flex flex-col sm:flex-row items-center gap-6">
                  {settings.logoUrl ? (
                    <img 
                      src={settings.logoUrl} 
                      alt="Org Logo" 
                      className="w-20 h-20 rounded-xl object-contain border border-slate-100 bg-white shadow-sm"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-xl bg-primary text-white flex items-center justify-center font-bold text-3xl font-heading shadow-md shadow-primary/25">
                      {settings.orgName.charAt(0)}
                    </div>
                  )}
                  <div className="flex-1 text-center sm:text-left space-y-1">
                    <h3 className="font-heading font-semibold text-lg text-slate-800 dark:text-slate-100">
                      {settings.orgName || "African Development Trust"}
                    </h3>
                    <p className="text-xs text-slate-400">
                      System Instance: <span className="font-medium text-slate-600 dark:text-slate-300">{settings.systemName}</span>
                    </p>
                    <p className="text-xs text-slate-400">
                      Primary Contact: <span className="font-medium text-slate-600 dark:text-slate-300">{settings.contactEmail}</span>
                    </p>
                    <div className="pt-2 flex flex-wrap justify-center sm:justify-start gap-2">
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm" 
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-white dark:bg-slate-900 flex items-center gap-2"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        Upload Logo
                      </Button>
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleLogoUpload} 
                        accept="image/*" 
                        className="hidden" 
                      />
                      {settings.logoUrl && (
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleInputChange("logoUrl", "")}
                          className="text-danger hover:bg-danger/10"
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* General details collapsible card */}
              <SettingsGroup id="sys-profile" title="Identity & Profile" icon={Building}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField label="System Name" error={errors.systemName} required>
                    <input
                      type="text"
                      className={inputStyle}
                      value={settings.systemName}
                      onChange={(e) => handleInputChange("systemName", e.target.value)}
                    />
                  </FormField>

                  <FormField label="Organization Name" error={errors.orgName} required>
                    <input
                      type="text"
                      className={inputStyle}
                      value={settings.orgName}
                      onChange={(e) => handleInputChange("orgName", e.target.value)}
                    />
                  </FormField>
                </div>
              </SettingsGroup>

              {/* Contacts Collapsible */}
              <SettingsGroup id="sys-contact" title="Support & Contacts" icon={Smartphone}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField label="Contact Email" error={errors.contactEmail} required>
                    <input
                      type="email"
                      className={inputStyle}
                      value={settings.contactEmail}
                      onChange={(e) => handleInputChange("contactEmail", e.target.value)}
                    />
                  </FormField>

                  <FormField label="Support Phone" error={errors.supportPhone} required>
                    <input
                      type="text"
                      className={inputStyle}
                      value={settings.supportPhone}
                      onChange={(e) => handleInputChange("supportPhone", e.target.value)}
                    />
                  </FormField>

                  <div className="md:col-span-2">
                    <FormField label="Headquarters Address" error={errors.hqAddress} required>
                      <input
                        type="text"
                        className={inputStyle}
                        value={settings.hqAddress}
                        onChange={(e) => handleInputChange("hqAddress", e.target.value)}
                      />
                    </FormField>
                  </div>
                </div>
              </SettingsGroup>

              {/* Localization Collapsible */}
              <SettingsGroup id="sys-locale" title="Localization & Units" icon={Globe}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField label="Time Zone">
                    <select
                      className={inputStyle}
                      value={settings.timeZone}
                      onChange={(e) => handleInputChange("timeZone", e.target.value)}
                    >
                      <option>UTC+3 (East Africa Time)</option>
                      <option>UTC+0 (Greenwich Mean Time)</option>
                      <option>UTC+1 (Central European Time)</option>
                      <option>UTC-5 (Eastern Standard Time)</option>
                    </select>
                  </FormField>

                  <FormField label="Default Language">
                    <select
                      className={inputStyle}
                      value={settings.defaultLanguage}
                      onChange={(e) => handleInputChange("defaultLanguage", e.target.value)}
                    >
                      <option>English</option>
                      <option>Somali</option>
                      <option>Arabic</option>
                    </select>
                  </FormField>

                  <FormField label="Date Format">
                    <select
                      className={inputStyle}
                      value={settings.dateFormat}
                      onChange={(e) => handleInputChange("dateFormat", e.target.value)}
                    >
                      <option>YYYY-MM-DD</option>
                      <option>DD/MM/YYYY</option>
                      <option>MM/DD/YYYY</option>
                    </select>
                  </FormField>

                  <FormField label="Measurement Unit">
                    <select
                      className={inputStyle}
                      value={settings.measurementUnit}
                      onChange={(e) => handleInputChange("measurementUnit", e.target.value)}
                    >
                      <option value="Cubic Meter (m³)">Cubic Meter (m³)</option>
                      <option value="Liters (L)">Liters (L)</option>
                      <option value="Gallons (gal)">Gallons (gal)</option>
                    </select>
                  </FormField>
                </div>
              </SettingsGroup>

            </div>
          )}

          {/* 2. MACHINE LEARNING SETTINGS TAB */}
          {activeTab === "ml-settings" && (
            <div className="space-y-6">
              
              <SettingsGroup id="ml-model" title="Prediction Model Status" icon={BrainCircuit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  <FormField label="Active Prediction Model">
                    <select
                      className={inputStyle}
                      value={settings.activeModel}
                      onChange={(e) => handleInputChange("activeModel", e.target.value)}
                    >
                      <option value="tuned_xgboost">Tuned XGBoost (Recommended)</option>
                      <option value="tuned_random_forest">Tuned Random Forest</option>
                      <option value="gradient_boosting">Gradient Boosting</option>
                      <option value="random_forest">Random Forest</option>
                      <option value="linear_regression">Linear Regression</option>
                    </select>
                  </FormField>

                  <FormField label="Model Version" error={errors.modelVersion} required>
                    <input
                      type="text"
                      className={inputStyle}
                      value={settings.modelVersion}
                      onChange={(e) => handleInputChange("modelVersion", e.target.value)}
                    />
                  </FormField>

                  <FormField label="Model Accuracy (Read Only)">
                    <input
                      type="text"
                      className={cn(inputStyle, "bg-slate-50 dark:bg-slate-800/40 text-slate-500 font-semibold")}
                      value={settings.modelAccuracy}
                      disabled
                    />
                  </FormField>

                  <FormField label="Last Training Date (Read Only)">
                    <input
                      type="text"
                      className={cn(inputStyle, "bg-slate-50 dark:bg-slate-800/40 text-slate-500")}
                      value={settings.lastTrainingDate}
                      disabled
                    />
                  </FormField>

                  <FormField label="Prediction Status Badge Control">
                    <select
                      className={inputStyle}
                      value={settings.predictionStatus}
                      onChange={(e) => handleInputChange("predictionStatus", e.target.value as any)}
                    >
                      <option value="active">Active (Active & serving predictions)</option>
                      <option value="training">Training (Currently retraining on new meters)</option>
                      <option value="disabled">Disabled (Do not run predictions)</option>
                    </select>
                  </FormField>
                </div>
              </SettingsGroup>

              <SettingsGroup id="ml-tuning" title="Tuning & Logs Configuration" icon={Calendar}>
                <div className="space-y-4">
                  <FormField label={`Prediction Confidence Threshold (${settings.predictionThreshold})`} error={errors.predictionThreshold} required>
                    <div className="flex items-center gap-4">
                      <input
                        type="range"
                        min="0.0"
                        max="1.0"
                        step="0.05"
                        className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary"
                        value={settings.predictionThreshold}
                        onChange={(e) => handleInputChange("predictionThreshold", parseFloat(e.target.value))}
                      />
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="1"
                        className="w-20 px-2 py-1 border text-sm rounded text-center dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                        value={settings.predictionThreshold}
                        onChange={(e) => handleInputChange("predictionThreshold", parseFloat(e.target.value))}
                      />
                    </div>
                  </FormField>

                  <hr className="border-slate-100 dark:border-slate-800/60" />

                  <div className="flex items-center justify-between py-2">
                    <div className="space-y-0.5">
                      <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Enable Prediction Logs</h4>
                      <p className="text-xs text-slate-400">Log all predictions inputs and confidence metrics for auditing.</p>
                    </div>
                    <ToggleSwitch 
                      checked={settings.enablePredictionLogs}
                      onChange={(val) => handleInputChange("enablePredictionLogs", val)}
                    />
                  </div>

                  <hr className="border-slate-100 dark:border-slate-800/60" />

                  <div className="flex items-center justify-between py-2">
                    <div className="space-y-0.5">
                      <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Enable Automatic Prediction Validation</h4>
                      <p className="text-xs text-slate-400">Validate future prediction values against actual readings automatically once typed.</p>
                    </div>
                    <ToggleSwitch 
                      checked={settings.enableAutoValidation}
                      onChange={(val) => handleInputChange("enableAutoValidation", val)}
                    />
                  </div>
                </div>
              </SettingsGroup>

            </div>
          )}

          {/* 3. WATER CONSUMPTION SETTINGS TAB */}
          {activeTab === "water-settings" && (
            <div className="space-y-6">
              
              <SettingsGroup id="water-validation" title="Consumption Validation Rules" icon={Droplets}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  <FormField label="Minimum Consumption Value (m³)" error={errors.minConsumption} required>
                    <input
                      type="number"
                      step="0.1"
                      className={inputStyle}
                      value={settings.minConsumption}
                      onChange={(e) => handleInputChange("minConsumption", parseFloat(e.target.value))}
                    />
                  </FormField>

                  <FormField label="Maximum Consumption Value (m³)" error={errors.maxConsumption} required>
                    <input
                      type="number"
                      step="1"
                      className={inputStyle}
                      value={settings.maxConsumption}
                      onChange={(e) => handleInputChange("maxConsumption", parseFloat(e.target.value))}
                    />
                  </FormField>

                  <FormField label="Maximum Decimal Places" error={errors.maxDecimalPlaces} required>
                    <input
                      type="number"
                      step="1"
                      className={inputStyle}
                      value={settings.maxDecimalPlaces}
                      onChange={(e) => handleInputChange("maxDecimalPlaces", parseInt(e.target.value))}
                    />
                  </FormField>

                  <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/20 rounded-lg border border-slate-100 dark:border-slate-800/60 self-end">
                    <div className="space-y-0.5">
                      <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200">Negative Value Validation</h4>
                      <p className="text-[11px] text-slate-400">Guarantees no readings are below zero.</p>
                    </div>
                    <ToggleSwitch checked={true} onChange={() => {}} disabled={true} />
                  </div>
                </div>
              </SettingsGroup>

              <SettingsGroup id="water-constraints" title="Prediction Constraints" icon={Clock}>
                <div className="space-y-4">
                  
                  <FormField label="Default Prediction Month">
                    <select
                      className={inputStyle}
                      value={settings.defaultPredictionMonth}
                      onChange={(e) => handleInputChange("defaultPredictionMonth", e.target.value)}
                    >
                      {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </FormField>

                  <hr className="border-slate-100 dark:border-slate-800/60" />

                  <div className="flex items-center justify-between py-2">
                    <div className="space-y-0.5">
                      <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Enable Duplicate Prediction Check</h4>
                      <p className="text-xs text-slate-400">Alerts the analyst if a prediction for the same customer/branch/zone is already generated for the chosen month.</p>
                    </div>
                    <ToggleSwitch 
                      checked={settings.enableDuplicateCheck}
                      onChange={(val) => handleInputChange("enableDuplicateCheck", val)}
                    />
                  </div>
                </div>
              </SettingsGroup>

            </div>
          )}

          {/* 4. USER MANAGEMENT TAB */}
          {activeTab === "user-mgmt" && (
            <div className="space-y-6">
              
              {/* Profile Details Card */}
              <SettingsGroup id="user-profile" title="Personal Profile Info" icon={User}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField label="Full Name">
                    <input
                      type="text"
                      className={inputStyle}
                      value={settings.profileName}
                      onChange={(e) => handleInputChange("profileName", e.target.value)}
                    />
                  </FormField>

                  <FormField label="Email Address">
                    <input
                      type="email"
                      className={inputStyle}
                      value={settings.profileEmail}
                      onChange={(e) => handleInputChange("profileEmail", e.target.value)}
                    />
                  </FormField>

                  <FormField label="Assigned Role (Read Only)">
                    <input
                      type="text"
                      className={cn(inputStyle, "bg-slate-50 dark:bg-slate-800/40 text-slate-500 font-semibold")}
                      value={settings.profileRole}
                      disabled
                    />
                  </FormField>

                  <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/20 rounded-lg border border-slate-100 dark:border-slate-800/60 self-end">
                    <div className="space-y-0.5">
                      <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200 font-sans">Two-Factor Auth (2FA)</h4>
                      <p className="text-[11px] text-slate-400">Protects your account with an extra verification code.</p>
                    </div>
                    <ToggleSwitch 
                      checked={settings.twoFactorEnabled}
                      onChange={(val) => handleInputChange("twoFactorEnabled", val)}
                    />
                  </div>
                </div>
              </SettingsGroup>

              {/* Password Settings Card */}
              <SettingsGroup id="user-pwd" title="Change Password" icon={Lock}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  
                  <FormField label="Current Password" error={errors.currentPassword}>
                    <div className="relative">
                      <input
                        type={showCurrentPassword ? "text" : "password"}
                        className={`${inputStyle} pr-10`}
                        placeholder="••••••••"
                        value={passwordState.currentPassword}
                        onChange={(e) => setPasswordState(prev => ({ ...prev, currentPassword: e.target.value }))}
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                      >
                        {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </FormField>

                  <FormField label="New Password" error={errors.newPassword}>
                    <div className="relative">
                      <input
                        type={showNewPassword ? "text" : "password"}
                        className={`${inputStyle} pr-10`}
                        placeholder="••••••••"
                        value={passwordState.newPassword}
                        onChange={(e) => setPasswordState(prev => ({ ...prev, newPassword: e.target.value }))}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </FormField>

                  <FormField label="Confirm Password" error={errors.confirmPassword}>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        className={`${inputStyle} pr-10`}
                        placeholder="••••••••"
                        value={passwordState.confirmPassword}
                        onChange={(e) => setPasswordState(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </FormField>

                  <div className="md:col-span-3 bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-lg border border-slate-100 dark:border-slate-800/60 flex gap-2">
                    <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <p className="text-xs text-slate-500 leading-normal">
                      <strong>Password Policy:</strong> Minimum 8 characters. Must contain at least 1 uppercase letter, 1 number, and 1 special symbol (e.g. @, $, !, %).
                    </p>
                  </div>
                </div>
              </SettingsGroup>

              {/* Sessions and Login History */}
              <SettingsGroup id="user-sessions" title="Session Activity & Log History" icon={Clock}>
                <div className="space-y-6">
                  
                  {/* Active sessions list */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Authorized Sessions</h4>
                    <div className="space-y-2">
                      {sessions.map(sess => (
                        <div key={sess.id} className="flex justify-between items-center p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 text-xs">
                          <div>
                            <p className="font-semibold text-slate-800 dark:text-slate-200">
                              {sess.device} {sess.active && <span className="text-primary font-bold">(Current Session)</span>}
                            </p>
                            <p className="text-slate-400 text-[11px] mt-0.5">IP: {sess.ip} • Location: {sess.location}</p>
                          </div>
                          {!sess.active && (
                            <Button 
                              type="button" 
                              variant="ghost" 
                              size="sm"
                              className="text-danger hover:bg-danger/10 text-xs h-8 px-2"
                              onClick={() => handleRevokeSession(sess.id)}
                            >
                              Revoke
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <hr className="border-slate-100 dark:border-slate-800/60" />

                  {/* Login history */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Recent Account Logins</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-medium">
                            <th className="py-2 px-1">Timestamp</th>
                            <th className="py-2">Device/Browser</th>
                            <th className="py-2">IP Address</th>
                            <th className="py-2 text-right">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {loginHistory.map(row => (
                            <tr key={row.id} className="border-b border-slate-100 dark:border-slate-800/50 text-slate-600 dark:text-slate-300">
                              <td className="py-2 px-1 font-mono text-[11px]">{row.timestamp}</td>
                              <td className="py-2">{row.device}</td>
                              <td className="py-2 font-mono text-[11px]">{row.ip}</td>
                              <td className="py-2 text-right">
                                <span className={cn(
                                  "inline-block px-2 py-0.5 rounded text-[10px] font-bold",
                                  row.status === "Success" ? "bg-green-50 text-green-600 dark:bg-green-950/20" : "bg-red-50 text-red-600 dark:bg-red-950/20"
                                )}>
                                  {row.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                </div>
              </SettingsGroup>

            </div>
          )}

          {/* 5. NOTIFICATION SETTINGS TAB */}
          {activeTab === "notifications" && (
            <div className="space-y-6">
              
              <SettingsGroup id="noti-channels" title="Alert Notification Channels" icon={Bell}>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-2">
                    <div className="space-y-0.5">
                      <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Email Notifications</h4>
                      <p className="text-xs text-slate-400">Receive reports, alerts, and system health checks in your email inbox.</p>
                    </div>
                    <ToggleSwitch 
                      checked={settings.emailNotifications}
                      onChange={(val) => handleInputChange("emailNotifications", val)}
                    />
                  </div>

                  <hr className="border-slate-100 dark:border-slate-800/60" />

                  <div className="flex items-center justify-between py-2">
                    <div className="space-y-0.5">
                      <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">SMS Notifications</h4>
                      <p className="text-xs text-slate-400">Send urgent predictions status and security alerts via text messages.</p>
                    </div>
                    <ToggleSwitch 
                      checked={settings.smsNotifications}
                      onChange={(val) => handleInputChange("smsNotifications", val)}
                    />
                  </div>
                </div>
              </SettingsGroup>

              <SettingsGroup id="noti-triggers" title="Notification Preferences & Triggers" icon={Calendar}>
                <div className="space-y-4">
                  
                  <div className="flex items-center justify-between py-2">
                    <div className="space-y-0.5">
                      <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Prediction Completed</h4>
                      <p className="text-xs text-slate-400">Notify when the ML model finishes predicting water consumption for a branch.</p>
                    </div>
                    <ToggleSwitch 
                      checked={settings.predictionCompleted}
                      onChange={(val) => handleInputChange("predictionCompleted", val)}
                    />
                  </div>

                  <hr className="border-slate-100 dark:border-slate-800/60" />

                  <div className="flex items-center justify-between py-2">
                    <div className="space-y-0.5">
                      <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Prediction Failed</h4>
                      <p className="text-xs text-slate-400">Alert if predictions fail because of missing parameters or out-of-bounds readings.</p>
                    </div>
                    <ToggleSwitch 
                      checked={settings.predictionFailed}
                      onChange={(val) => handleInputChange("predictionFailed", val)}
                    />
                  </div>

                  <hr className="border-slate-100 dark:border-slate-800/60" />

                  <div className="flex items-center justify-between py-2">
                    <div className="space-y-0.5">
                      <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">System Updates</h4>
                      <p className="text-xs text-slate-400">Notify regarding planned platform maintenance windows or package installations.</p>
                    </div>
                    <ToggleSwitch 
                      checked={settings.systemUpdates}
                      onChange={(val) => handleInputChange("systemUpdates", val)}
                    />
                  </div>

                  <hr className="border-slate-100 dark:border-slate-800/60" />

                  <div className="flex items-center justify-between py-2">
                    <div className="space-y-0.5">
                      <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Security Alerts</h4>
                      <p className="text-xs text-slate-400">Get warnings on password resets, unknown logins, or failed 2FA authorization attempts.</p>
                    </div>
                    <ToggleSwitch 
                      checked={settings.securityAlerts}
                      onChange={(val) => handleInputChange("securityAlerts", val)}
                    />
                  </div>

                </div>
              </SettingsGroup>

            </div>
          )}

          {/* 6. SECURITY TAB */}
          {activeTab === "security" && (
            <div className="space-y-6">
              
              <SettingsGroup id="sec-policies" title="System Security & Policy Limits" icon={Shield}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  <FormField label="Session Timeout Limit (minutes)" error={errors.sessionTimeout} required>
                    <input
                      type="number"
                      step="1"
                      className={inputStyle}
                      value={settings.sessionTimeout}
                      onChange={(e) => handleInputChange("sessionTimeout", parseInt(e.target.value))}
                    />
                  </FormField>

                  <FormField label="JWT Expiration Time (hours)" error={errors.jwtExpiration} required>
                    <input
                      type="number"
                      step="1"
                      className={inputStyle}
                      value={settings.jwtExpiration}
                      onChange={(e) => handleInputChange("jwtExpiration", parseInt(e.target.value))}
                    />
                  </FormField>

                  <FormField label="Failed Login Lockout Limit" error={errors.failedLoginLimit} required>
                    <input
                      type="number"
                      step="1"
                      className={inputStyle}
                      value={settings.failedLoginLimit}
                      onChange={(e) => handleInputChange("failedLoginLimit", parseInt(e.target.value))}
                    />
                  </FormField>

                  <div className="p-3 bg-slate-50 dark:bg-slate-800/20 rounded-lg border border-slate-100 dark:border-slate-800/60 flex gap-2 self-end text-xs text-slate-500">
                    <Lock className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-slate-700 dark:text-slate-300">Policy Enabled</p>
                      <p className="mt-0.5 text-[11px]">Accounts are locked for 15 mins after limits are breached.</p>
                    </div>
                  </div>
                </div>
              </SettingsGroup>

              {/* API Security */}
              <SettingsGroup id="sec-api" title="API Security & Keys" icon={Key}>
                <div className="space-y-4">
                  <FormField label="Active API Key">
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <input
                          type={showApiKey ? "text" : "password"}
                          className={cn(inputStyle, "font-mono pr-10 bg-slate-50 dark:bg-slate-800/30 text-slate-600")}
                          value={settings.apiKey}
                          readOnly
                        />
                        <button
                          type="button"
                          onClick={() => setShowApiKey(!showApiKey)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      <Button 
                        type="button" 
                        variant="outline" 
                        className="flex items-center gap-1.5 whitespace-nowrap bg-white dark:bg-slate-900"
                        onClick={generateApiKey}
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        Regenerate
                      </Button>
                    </div>
                  </FormField>
                  
                  {/* Audit Logs Sub-table */}
                  <div className="space-y-3 pt-2">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">System Security Audit Log</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-medium">
                            <th className="py-2 px-1">Time</th>
                            <th className="py-2">Security Action Event</th>
                            <th className="py-2">Operator</th>
                            <th className="py-2 text-right">Severity</th>
                          </tr>
                        </thead>
                        <tbody>
                          {auditLogs.map(log => (
                            <tr key={log.id} className="border-b border-slate-100 dark:border-slate-800/50 text-slate-600 dark:text-slate-300">
                              <td className="py-2 px-1 font-mono text-[11px]">{log.timestamp}</td>
                              <td className="py-2">{log.action}</td>
                              <td className="py-2">{log.user}</td>
                              <td className="py-2 text-right">
                                <span className={cn(
                                  "inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase",
                                  log.severity === "Low" ? "bg-green-50 text-green-600 dark:bg-green-950/20" : "bg-amber-50 text-amber-600 dark:bg-amber-950/20"
                                )}>
                                  {log.severity}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </SettingsGroup>

              {/* Role Permissions (Read Only) */}
              <SettingsGroup id="sec-perms" title="Role-Based Permissions Matrix (Read Only)" icon={User}>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-medium bg-slate-50 dark:bg-slate-850">
                        <th className="py-3 px-3">Module Resource</th>
                        <th className="py-3 px-2">Administrator</th>
                        <th className="py-3 px-2">Analyst</th>
                        <th className="py-3 px-2">Staff</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { resource: "System Configurations", admin: "Full Access", analyst: "No Access", staff: "No Access" },
                        { resource: "Machine Learning Training", admin: "Execute", analyst: "Execute", staff: "No Access" },
                        { resource: "Consumption Predictions", admin: "Read & Write", analyst: "Read & Write", staff: "Read Only" },
                        { resource: "Meter Readings Log", admin: "Read & Write", analyst: "Read & Write", staff: "Read & Write" },
                        { resource: "Users Management", admin: "Full Access", analyst: "No Access", staff: "No Access" },
                      ].map((row, idx) => (
                        <tr key={idx} className="border-b border-slate-100 dark:border-slate-850 text-slate-700 dark:text-slate-300">
                          <td className="py-2.5 px-3 font-semibold">{row.resource}</td>
                          <td className="py-2.5 px-2">
                            <span className="text-green-600 dark:text-green-400 font-medium">✓ {row.admin}</span>
                          </td>
                          <td className="py-2.5 px-2">
                            {row.analyst === "No Access" ? (
                              <span className="text-slate-400 dark:text-slate-600">✕ None</span>
                            ) : (
                              <span className="text-green-600 dark:text-green-400 font-medium">✓ {row.analyst}</span>
                            )}
                          </td>
                          <td className="py-2.5 px-2">
                            {row.staff === "No Access" ? (
                              <span className="text-slate-400 dark:text-slate-600">✕ None</span>
                            ) : (
                              <span className="text-primary font-medium">✓ {row.staff}</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </SettingsGroup>

            </div>
          )}

          {/* 7. DATABASE & BACKUP TAB */}
          {activeTab === "database" && (
            <div className="space-y-6">
              
              <SettingsGroup id="db-status" title="Database Configuration & Automations" icon={Database}>
                <div className="space-y-4">
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    <FormField label="Database Connection State">
                      <div className="flex items-center gap-2 px-3 py-2 border rounded-lg bg-slate-50 dark:bg-slate-800/30 dark:border-slate-800 font-semibold text-slate-700 dark:text-slate-300 text-sm">
                        <span className="inline-block w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse" />
                        PostgreSQL Active / Online
                      </div>
                    </FormField>

                    <FormField label="Last Completed Backup Time">
                      <input
                        type="text"
                        className={cn(inputStyle, "font-mono text-slate-500 bg-slate-50 dark:bg-slate-800/40")}
                        value={settings.lastBackup}
                        disabled
                      />
                    </FormField>

                    <FormField label="Automatic Backup Frequency">
                      <select
                        className={inputStyle}
                        value={settings.backupFrequency}
                        onChange={(e) => handleInputChange("backupFrequency", e.target.value)}
                      >
                        <option value="hourly">Hourly Backup</option>
                        <option value="daily">Daily Backup (Recommended)</option>
                        <option value="weekly">Weekly Backup</option>
                        <option value="monthly">Monthly Backup</option>
                      </select>
                    </FormField>

                    <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/20 rounded-lg border border-slate-100 dark:border-slate-800/60 self-end">
                      <div className="space-y-0.5">
                        <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200">Automatic Backup Service</h4>
                        <p className="text-[11px] text-slate-400">Trigger cron backup on the chosen frequency.</p>
                      </div>
                      <ToggleSwitch 
                        checked={settings.autoBackup}
                        onChange={(val) => handleInputChange("autoBackup", val)}
                      />
                    </div>
                  </div>

                  <hr className="border-slate-100 dark:border-slate-800/60" />

                  <div className="flex justify-end">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={handleBackupNow}
                      disabled={isBackupLoading}
                      className="flex items-center gap-2 border-primary text-primary hover:bg-primary/5 bg-white dark:bg-slate-900"
                    >
                      {isBackupLoading ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Backing up database...
                        </>
                      ) : (
                        <>
                          <Database className="w-4 h-4" />
                          Backup Database Now
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </SettingsGroup>

              {/* Restore Backup Panel */}
              <SettingsGroup id="db-restore" title="Restore System Snapshot" icon={RotateCcw}>
                <div className="space-y-4">
                  <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/60 rounded-lg p-4 flex gap-3 text-xs text-amber-800 dark:text-amber-300">
                    <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-amber-500" />
                    <div>
                      <p className="font-semibold text-sm">Caution: High Risk Restoration Area</p>
                      <p className="mt-1 leading-normal">
                        Restoring a database snapshot overrides all current meter readings, predictions log history, and user updates made after the snapshot timestamp.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 border border-dashed rounded-lg border-slate-200 dark:border-slate-800">
                    <div>
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Load Snapshot File (.zip, .sql)</p>
                      <p className="text-xs text-slate-400 mt-0.5 font-sans">Select a local database backup file to upload.</p>
                    </div>
                    <Button 
                      type="button" 
                      variant="danger" 
                      onClick={handleRestoreNow}
                      disabled={isRestoring}
                      className="flex items-center justify-center gap-1.5 whitespace-nowrap"
                    >
                      {isRestoring ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Restoring...
                        </>
                      ) : (
                        <>
                          <RotateCcw className="w-4 h-4" />
                          Upload & Restore Now
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </SettingsGroup>

              {/* Database Exports */}
              <SettingsGroup id="db-export" title="Export Prediction History Logs" icon={Download}>
                <div className="space-y-4">
                  <p className="text-xs text-slate-500 font-sans leading-relaxed">
                    Download full archived logs of historical predicted values against actual consumption to train models offline or generate custom stakeholder reports.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => alert("Downloading prediction logs in CSV format...")}
                      className="bg-white dark:bg-slate-900 flex items-center gap-1.5 text-sm"
                    >
                      <Download className="w-4 h-4 text-emerald-600" />
                      Export CSV Report
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => alert("Downloading prediction logs in XLSX Excel format...")}
                      className="bg-white dark:bg-slate-900 flex items-center gap-1.5 text-sm"
                    >
                      <Download className="w-4 h-4 text-green-600" />
                      Export Excel Report
                    </Button>
                  </div>
                </div>
              </SettingsGroup>

            </div>
          )}

          {/* 8. PREDICTION HISTORY SETTINGS TAB */}
          {activeTab === "history-settings" && (
            <div className="space-y-6">
              
              <SettingsGroup id="history-storage" title="History Storage & Lifecycle Policies" icon={History}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  <FormField label="Maximum Stored Predictions Limit" error={errors.maxStoredPredictions} required>
                    <input
                      type="number"
                      step="500"
                      className={inputStyle}
                      value={settings.maxStoredPredictions}
                      onChange={(e) => handleInputChange("maxStoredPredictions", parseInt(e.target.value))}
                    />
                  </FormField>

                  <FormField label="History Retention Period">
                    <select
                      className={inputStyle}
                      value={settings.historyRetentionPeriod}
                      onChange={(e) => handleInputChange("historyRetentionPeriod", e.target.value)}
                    >
                      <option value="30">30 Days</option>
                      <option value="90">90 Days</option>
                      <option value="180">180 Days (Recommended)</option>
                      <option value="365">1 Year</option>
                      <option value="730">2 Years</option>
                      <option value="unlimited">Keep Indefinitely</option>
                    </select>
                  </FormField>

                  <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/20 rounded-lg border border-slate-100 dark:border-slate-800/60 md:col-span-2">
                    <div className="space-y-0.5">
                      <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200">Auto Delete Old Predictions</h4>
                      <p className="text-[11px] text-slate-400">Prune predictions logs automatically when they cross the selected retention period.</p>
                    </div>
                    <ToggleSwitch 
                      checked={settings.autoDeleteOldPredictions}
                      onChange={(val) => handleInputChange("autoDeleteOldPredictions", val)}
                    />
                  </div>
                </div>
              </SettingsGroup>

              {/* History Exports Configurations */}
              <SettingsGroup id="history-export" title="History Backup & Export Formatting" icon={Calendar}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  <FormField label="Default Export File Format">
                    <select
                      className={inputStyle}
                      value={settings.exportFormat}
                      onChange={(e) => handleInputChange("exportFormat", e.target.value)}
                    >
                      <option value="CSV">CSV Format (.csv)</option>
                      <option value="Excel">Excel Spreadsheet (.xlsx)</option>
                      <option value="JSON">JSON Structure Data (.json)</option>
                    </select>
                  </FormField>

                  <div className="p-3 bg-slate-50 dark:bg-slate-800/20 rounded-lg border border-slate-100 dark:border-slate-800/60 flex gap-2 text-xs text-slate-500 self-end">
                    <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-slate-700 dark:text-slate-300 font-sans">Automatic Formatting</p>
                      <p className="mt-0.5 text-[11px]">Exports use localization date format ({settings.dateFormat}) and cubic meter calculations.</p>
                    </div>
                  </div>
                </div>
              </SettingsGroup>

            </div>
          )}

        </div>

      </div>

      {/* Floating Save Actions Fixed Footer */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800/60 px-4 py-4 md:px-8 shadow-2xl flex justify-between items-center transition-all duration-300">
        
        {/* Validation / Changes Feedback Status */}
        <div className="flex items-center gap-2">
          {saveSuccessMsg ? (
            <div className="text-sm font-semibold text-emerald-600 flex items-center gap-1.5 animate-bounce">
              <CheckCircle className="w-4.5 h-4.5" />
              {saveSuccessMsg}
            </div>
          ) : !isValid ? (
            <div className="text-sm font-semibold text-red-500 flex items-center gap-1.5">
              <AlertTriangle className="w-4.5 h-4.5" />
              Validation error(s) present. Please correct inputs.
            </div>
          ) : hasChanges ? (
            <div className="text-sm font-semibold text-amber-500 flex items-center gap-1.5">
              <Info className="w-4.5 h-4.5" />
              Unsaved changes present.
            </div>
          ) : (
            <div className="text-sm text-slate-400 flex items-center gap-1.5">
              <CheckCircle className="w-4.5 h-4.5 text-slate-300 dark:text-slate-600" />
              All settings are up-to-date.
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleReset} 
            disabled={!hasChanges}
            className="border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 bg-transparent text-sm h-10 px-5"
          >
            Reset
          </Button>
          <Button 
            type="button" 
            variant="primary" 
            onClick={handleSave} 
            disabled={!hasChanges || !isValid}
            className="shadow-md shadow-primary/20 disabled:opacity-50 text-sm h-10 px-6 flex items-center gap-1.5"
          >
            <Save className="w-4 h-4" />
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}

// Inline Badge component
function Badge({ 
  children, 
  variant 
}: { 
  children: React.ReactNode; 
  variant: "active" | "training" | "disabled" | "connected" | "disconnected" | "maintenance" | "success" | "danger";
}) {
  const styles = {
    active: "bg-green-500/10 text-green-600 border-green-200 dark:border-green-800",
    training: "bg-amber-500/10 text-amber-600 border-amber-200 dark:border-amber-800",
    disabled: "bg-red-500/10 text-red-600 border-red-200 dark:border-red-800",
    connected: "bg-green-500/10 text-green-600 border-green-200 dark:border-green-800",
    disconnected: "bg-red-500/10 text-red-600 border-red-200 dark:border-red-800",
    maintenance: "bg-amber-500/10 text-amber-600 border-amber-200 dark:border-amber-800",
    success: "bg-green-500/10 text-green-600 border-green-200 dark:border-green-800",
    danger: "bg-red-500/10 text-red-600 border-red-200 dark:border-red-800",
  };

  return (
    <span className={cn(
      "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border bg-card tracking-wide select-none",
      styles[variant] || "bg-slate-100 text-slate-600"
    )}>
      {children}
    </span>
  );
}
