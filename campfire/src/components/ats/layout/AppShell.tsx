"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignOutButton, useUser } from "@clerk/nextjs";
import { motion, AnimatePresence } from "motion/react";
import {
  LayoutDashboard,
  Swords,
  User,
  BarChart3,
  Briefcase,
  Plus,
  Users,
  LogOut,
  Menu,
  X,
  Zap,
  Map,
} from "lucide-react";
import { retro, navIndicatorVariants } from "@/lib/animations";
import { cn } from "@/components/ats/ui/utils";

type ActiveRole = "applicant" | "recruiter" | "interviewer";

function roleFromPathname(pathname: string): ActiveRole {
  if (pathname.startsWith("/applicant")) return "applicant";
  if (pathname.startsWith("/recruiter")) return "recruiter";
  if (pathname.startsWith("/interviewer")) return "interviewer";
  return "applicant";
}

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

const applicantNav: NavItem[] = [
  { label: "My Journey", path: "/applicant", icon: <Map size={16} /> },
  { label: "Job Board", path: "/applicant/jobs", icon: <Briefcase size={16} /> },
  { label: "Challenges", path: "/applicant/tasks", icon: <Swords size={16} /> },
  { label: "Profile", path: "/applicant/profile", icon: <User size={16} /> },
];

const recruiterNav: NavItem[] = [
  { label: "Dashboard", path: "/recruiter", icon: <LayoutDashboard size={16} /> },
  { label: "Jobs", path: "/recruiter/jobs", icon: <Briefcase size={16} /> },
  { label: "Post a Job", path: "/recruiter/jobs/new", icon: <Plus size={16} /> },
  { label: "Analytics", path: "/recruiter/analytics", icon: <BarChart3 size={16} /> },
];

const interviewerNav: NavItem[] = [
  { label: "My Interviews", path: "/interviewer", icon: <Users size={16} /> },
];

const NAV_BY_ROLE: Record<ActiveRole, NavItem[]> = {
  applicant: applicantNav,
  recruiter: recruiterNav,
  interviewer: interviewerNav,
};

const ROLE_LABELS: Record<ActiveRole, string> = {
  applicant: "Applicant",
  recruiter: "Hiring Manager",
  interviewer: "Interviewer",
};

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useUser();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const role = roleFromPathname(pathname);
  const navItems = NAV_BY_ROLE[role];

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ background: "var(--background)", color: "var(--foreground)" }}
    >
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            className="fixed inset-0 z-30"
            style={{ background: "rgba(0,24,36,0.8)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      <aside
        className={cn(
          "flex flex-col transition-transform duration-300 shrink-0 fixed z-40 h-full",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
        style={{
          width: 240,
          background: "var(--surface)",
          borderRight: "2px solid var(--border)",
        }}
      >
        <div
          className="flex items-center gap-3 px-4 py-4 border-b-2"
          style={{ borderColor: "var(--border)" }}
        >
          <div
            className="flex items-center justify-center shrink-0"
            style={{
              width: 36,
              height: 36,
              background: "linear-gradient(135deg, var(--color-orange), var(--color-gold))",
              boxShadow: "2px 2px 0 rgba(0,0,0,0.4), 0 0 16px rgba(247,127,0,0.3)",
            }}
          >
            <Zap size={18} style={{ color: "var(--primary-foreground)" }} />
          </div>
          <div>
            <div
              className="text-sm uppercase tracking-wider"
              style={{ color: "var(--foreground)" }}
            >
              QuestHire
            </div>
            <div
              className="text-[10px] uppercase tracking-widest"
              style={{ color: "var(--color-orange)" }}
            >
              ATS Platform
            </div>
          </div>
          <button
            className="ml-auto p-1 transition-colors hover:text-[var(--color-orange)]"
            onClick={() => setSidebarOpen(false)}
            style={{ color: "var(--muted-foreground)" }}
          >
            <X size={16} />
          </button>
        </div>

        {user && (
          <div
            className="px-4 py-4 border-b-2"
            style={{ borderColor: "var(--border)" }}
          >
            <div className="flex items-center gap-3">
              {user.imageUrl ? (
                <img
                  src={user.imageUrl}
                  alt=""
                  className="shrink-0"
                  style={{
                    width: 36,
                    height: 36,
                    border: "2px solid var(--color-orange)",
                    boxShadow: "2px 2px 0 rgba(0,0,0,0.4)",
                  }}
                />
              ) : (
                <div
                  className="flex items-center justify-center text-xs shrink-0"
                  style={{
                    width: 36,
                    height: 36,
                    background: "linear-gradient(135deg, var(--color-gold), var(--color-orange))",
                    color: "var(--primary-foreground)",
                    fontWeight: 700,
                  }}
                >
                  {(user.firstName?.[0] ?? "").toUpperCase()}
                </div>
              )}
              <div className="min-w-0">
                <div
                  className="text-xs truncate"
                  style={{ color: "var(--foreground)" }}
                >
                  {user.firstName} {user.lastName}
                </div>
                <div
                  className="text-[10px] uppercase tracking-wider"
                  style={{ color: "var(--color-orange)" }}
                >
                  {ROLE_LABELS[role]}
                </div>
              </div>
            </div>
          </div>
        )}

        <nav className="flex-1 py-3 px-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive =
              pathname === item.path ||
              (item.path !== "/applicant" &&
                item.path !== "/recruiter" &&
                item.path !== "/interviewer" &&
                pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                href={item.path}
                onClick={() => setSidebarOpen(false)}
                className="relative flex items-center gap-3 py-2.5 px-3 transition-all"
                style={{
                  background: isActive ? "rgba(247,127,0,0.12)" : "transparent",
                  color: isActive ? "var(--color-orange)" : "var(--muted-foreground)",
                }}
              >
                {isActive && (
                  <motion.div
                    className="absolute left-0 top-0 bottom-0 w-[3px]"
                    style={{ background: "var(--color-orange)" }}
                    variants={navIndicatorVariants}
                    initial="initial"
                    animate="animate"
                    transition={retro.snap}
                    layoutId="nav-indicator"
                  />
                )}
                {item.icon}
                <span className="text-xs uppercase tracking-wider">
                  {item.label}
                </span>
                {isActive && (
                  <span
                    className="ml-auto text-xs"
                    style={{ color: "var(--color-gold)" }}
                  >
                    ▶
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div
          className="p-2 border-t-2"
          style={{ borderColor: "var(--border)" }}
        >
          <SignOutButton redirectUrl="/">
            <button
              className="flex items-center gap-3 py-2.5 px-3 w-full transition-all hover:text-[var(--color-flag)]"
              style={{ color: "var(--muted-foreground)" }}
            >
              <LogOut size={16} />
              <span className="text-xs uppercase tracking-wider">Logout</span>
            </button>
          </SignOutButton>
        </div>
      </aside>

      <main
        className="flex-1 overflow-y-auto"
        style={{ background: "var(--background)" }}
      >
        {!sidebarOpen && (
          <div
            className="sticky top-0 z-20 flex items-center gap-3 px-4 py-3 border-b-2"
            style={{
              background: "var(--surface)",
              borderColor: "var(--border)",
            }}
          >
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-1 transition-colors hover:text-[var(--color-orange)]"
              style={{ color: "var(--muted-foreground)" }}
            >
              <Menu size={20} />
            </button>
            <div
              className="flex items-center justify-center shrink-0"
              style={{
                width: 28,
                height: 28,
                background: "linear-gradient(135deg, var(--color-orange), var(--color-gold))",
              }}
            >
              <Zap size={14} style={{ color: "var(--primary-foreground)" }} />
            </div>
            <span
              className="text-xs uppercase tracking-wider"
              style={{ color: "var(--foreground)" }}
            >
              QuestHire
            </span>
          </div>
        )}
        {children}
      </main>
    </div>
  );
}
