"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  GraduationCap,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Smartphone,
  Laptop,
} from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { useToast } from "@/components/ui/toast";
import { ROUTES } from "@/constants/routes";
import { UserProfile, UserRole } from "@/types/auth";
import { cn } from "@/lib/utils";

const DEMO_ACCOUNTS: Array<{
  role: UserRole;
  label: string;
  email: string;
  badgeColor: string;
  name: string;
  description: string;
}> = [
  {
    role: "SUPER_ADMIN",
    label: "Super Admin",
    email: "admin@schoolerp.com",
    badgeColor: "bg-purple-600 text-white",
    name: "Dr. Alexander Wright",
    description: "Full system & multi-branch control",
  },
  {
    role: "PRINCIPAL",
    label: "Principal",
    email: "principal@schoolerp.com",
    badgeColor: "bg-blue-600 text-white",
    name: "Prof. Sarah Jenkins",
    description: "Academic & staff management",
  },
  {
    role: "ACCOUNTANT",
    label: "Accountant",
    email: "accountant@schoolerp.com",
    badgeColor: "bg-emerald-600 text-white",
    name: "Marcus Vance",
    description: "Fee collections & financial ledger",
  },
  {
    role: "TEACHER",
    label: "Teacher",
    email: "teacher@schoolerp.com",
    badgeColor: "bg-amber-600 text-white",
    name: "Elena Rostova",
    description: "Class attendance, marks & syllabus",
  },
];

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || ROUTES.DASHBOARD;
  const { toast } = useToast();
  const setAuth = useAuthStore((state) => state.setAuth);

  const [email, setEmail] = React.useState("admin@schoolerp.com");
  const [password, setPassword] = React.useState("Admin@123456");
  const [showPassword, setShowPassword] = React.useState(false);
  const [rememberMe, setRememberMe] = React.useState(true);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!email.trim() || !password.trim()) {
      toast({
        type: "error",
        title: "Validation Error",
        message: "Please enter your email address and password.",
      });
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const matchedDemo = DEMO_ACCOUNTS.find(
        (acc) => acc.email.toLowerCase() === email.trim().toLowerCase()
      );

      const role: UserRole = matchedDemo ? matchedDemo.role : "SUPER_ADMIN";
      const name = matchedDemo
        ? matchedDemo.name
        : email.split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

      const profile: UserProfile = {
        id: matchedDemo ? `usr-${matchedDemo.role.toLowerCase()}` : "usr-admin-01",
        name: name || "System Administrator",
        email: email.trim(),
        role: role,
        schoolId: "sch-sunrise-01",
        schoolName: "Sunrise Public School",
        permissions: ["*"],
      };

      const token = `erp-auth-token-${role.toLowerCase()}-${Date.now()}`;

      setAuth({
        user: profile,
        token: token,
      });

      toast({
        type: "success",
        title: "Welcome Back",
        message: `Logged in as ${profile.name} (${profile.role})`,
      });

      setIsLoading(false);
      router.push(redirectUrl);
    }, 400);
  };

  const handleQuickLogin = (demo: (typeof DEMO_ACCOUNTS)[0]) => {
    setEmail(demo.email);
    setPassword("Admin@123456");

    const profile: UserProfile = {
      id: `usr-${demo.role.toLowerCase()}`,
      name: demo.name,
      email: demo.email,
      role: demo.role,
      schoolId: "sch-sunrise-01",
      schoolName: "Sunrise Public School",
      permissions: ["*"],
    };

    setAuth({
      user: profile,
      token: `erp-demo-token-${demo.role.toLowerCase()}`,
    });

    toast({
      type: "success",
      title: `Logged in as ${demo.label}`,
      message: `Active session for ${demo.name}`,
    });

    router.push(redirectUrl);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-[var(--bg-secondary)] px-4 py-8 sm:px-6 lg:px-8">
      {/* Subtle Background Glow */}
      <div className="fixed inset-0 pointer-events-none opacity-30 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-600/20 via-transparent to-transparent" />

      <div className="relative w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center p-3.5 rounded-2xl bg-[var(--brand-primary)] text-white shadow-xl shadow-[var(--brand-primary)]/20 mb-1">
            <GraduationCap className="h-8 w-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] tracking-tight">
            Sunrise Public School
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium">
            Next-Gen School ERP Management Platform
          </p>
        </div>

        {/* Main Login Card */}
        <div className="bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-2xl shadow-xl p-6 sm:p-8 space-y-6">
          <div className="border-b border-[var(--border-secondary)] pb-4">
            <h2 className="text-base font-bold text-[var(--text-primary)]">
              Sign In to Your Workspace
            </h2>
            <p className="text-xs text-[var(--text-tertiary)] mt-0.5">
              Access fee directory, student management, and academic dashboards
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[var(--text-primary)]">
                Email Address / Staff ID
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--neutral-400)]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@schoolerp.com"
                  required
                  className="w-full h-11 pl-10 pr-3 text-xs bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-primary)] focus:ring-2 focus:ring-[var(--brand-primary)]/20 transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-[var(--text-primary)]">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() =>
                    toast({
                      type: "info",
                      title: "Demo Mode Notice",
                      message: "You can enter any password or use the 1-click profiles below.",
                    })
                  }
                  className="text-[11px] font-medium text-[var(--brand-primary)] hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--neutral-400)]" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full h-11 pl-10 pr-10 text-xs bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-primary)] focus:ring-2 focus:ring-[var(--brand-primary)]/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[var(--neutral-400)] hover:text-[var(--text-primary)]"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center gap-2 pt-1">
              <input
                id="rememberMe"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded border-[var(--border-primary)] text-[var(--brand-primary)] focus:ring-[var(--brand-primary)]"
              />
              <label htmlFor="rememberMe" className="text-xs text-[var(--text-secondary)] select-none">
                Remember this device on local network
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 flex items-center justify-center gap-2 text-xs font-bold text-white bg-[var(--brand-primary)] hover:bg-[var(--brand-secondary)] rounded-lg shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span>Signing in...</span>
              ) : (
                <>
                  <span>Sign In to ERP</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Logins Section */}
          <div className="pt-3 border-t border-[var(--border-secondary)] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-tertiary)] flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                1-Click Quick Demo Profiles
              </span>
              <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded">
                Instant Access
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {DEMO_ACCOUNTS.map((demo) => (
                <button
                  key={demo.role}
                  type="button"
                  onClick={() => handleQuickLogin(demo)}
                  className="flex flex-col text-left p-2.5 rounded-lg border border-[var(--border-primary)] bg-[var(--bg-secondary)] hover:border-[var(--brand-primary)] hover:bg-[var(--bg-primary)] transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span
                      className={cn(
                        "text-[9px] font-bold uppercase px-1.5 py-0.5 rounded",
                        demo.badgeColor
                      )}
                    >
                      {demo.label}
                    </span>
                    <CheckCircle2 className="h-3 w-3 text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <span className="text-xs font-bold text-[var(--text-primary)] truncate">
                    {demo.name}
                  </span>
                  <span className="text-[10px] text-[var(--text-tertiary)] truncate">
                    {demo.description}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Network & Multi-device Info */}
        <div className="flex items-center justify-center gap-4 text-xs text-[var(--text-tertiary)]">
          <div className="flex items-center gap-1.5">
            <Laptop className="h-3.5 w-3.5 text-blue-500" />
            <span>Desktop</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1.5">
            <Smartphone className="h-3.5 w-3.5 text-emerald-500" />
            <span>Mobile & Tablet Ready</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-purple-500" />
            <span>Multi-Device Sync</span>
          </div>
        </div>
      </div>
    </div>
  );
}
