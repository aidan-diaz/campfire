"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAts } from "@/context/AtsContext";
import {
  getCompanyById,
  stageStoryLabels,
  type Applicant,
  type Application,
} from "@/data/ats/mockData";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ats/ui/card";
import { Badge } from "@/components/ats/ui/badge";
import { Button } from "@/components/ats/ui/button";
import { Input } from "@/components/ats/ui/input";
import {
  Briefcase,
  Plus,
  Search,
  Users,
  Calendar,
  CheckCircle2,
  Eye,
  ChevronRight,
  FileText,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { retro } from "@/lib/animations";

export default function RecruiterJobsList() {
  const { currentTeamMember, allJobs, allApplicants } = useAts();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "open" | "draft" | "closed"
  >("all");
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null);

  const company = getCompanyById(currentTeamMember.companyId);
  const myJobs = allJobs.filter(
    (j) => j.companyId === currentTeamMember.companyId
  );

  const filtered = myJobs.filter((j) => {
    const matchesSearch =
      j.title.toLowerCase().includes(search.toLowerCase()) ||
      j.team.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || j.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen" style={{ background: "var(--background)" }}>
      <div
        className="px-6 pt-8 pb-6 border-b-2"
        style={{ borderColor: "var(--border)" }}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Briefcase
                size={16}
                style={{ color: company?.color || "var(--color-orange)" }}
              />
              <span
                className="text-[10px] uppercase tracking-widest"
                style={{ color: company?.color || "var(--color-orange)" }}
              >
                {company?.name?.toUpperCase()} · Quest Board
              </span>
            </div>
            <h1
              className="text-xl uppercase tracking-wider"
              style={{ color: "var(--color-gold)" }}
            >
              All Jobs
            </h1>
            <p
              className="text-xs mt-1"
              style={{ color: "var(--muted-foreground)" }}
            >
              ► {myJobs.filter((j) => j.status === "open").length} open ·{" "}
              {myJobs.filter((j) => j.status === "draft").length} draft
            </p>
          </div>
          <Button onClick={() => router.push("/recruiter/jobs/new")}>
            <Plus size={16} />
            Post a Job
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5">
          {[
            {
              label: "Open Roles",
              value: myJobs.filter((j) => j.status === "open").length,
              color: "#4caf50",
              icon: <CheckCircle2 size={14} />,
            },
            {
              label: "Drafts",
              value: myJobs.filter((j) => j.status === "draft").length,
              color: "var(--muted-foreground)",
              icon: <FileText size={14} />,
            },
            {
              label: "Avg. Applicants",
              value:
                myJobs.length > 0
                  ? (
                    myJobs.reduce((s, j) => s + j.applicantIds.length, 0) /
                    myJobs.filter((j) => j.status === "open").length || 0
                  ).toFixed(1)
                  : "0",
              color: "var(--color-gold)",
              icon: <Users size={14} />,
            },
          ].map((s) => (
            <Card key={s.label} style={{ borderColor: `${s.color}40` }}>
              <CardContent className="pt-4">
                <div
                  className="flex items-center gap-2 mb-2"
                  style={{ color: s.color }}
                >
                  {s.icon}
                  <span className="text-[10px] uppercase tracking-widest">
                    {s.label}
                  </span>
                </div>
                <div
                  className="text-2xl"
                  style={{ color: "var(--foreground)" }}
                >
                  {s.value}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3 mt-5">
          <div className="relative flex-1 max-w-sm">
            <Search
              size={14}
              style={{
                color: "var(--muted-foreground)",
                position: "absolute",
                left: 12,
                top: "50%",
                transform: "translateY(-50%)",
                zIndex: 1,
              }}
            />
            <input
              className="stat-input w-full pl-9"
              placeholder="Search jobs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            {(["all", "open", "draft", "closed"] as const).map((s) => (
              <Button
                key={s}
                variant={statusFilter === s ? "default" : "ghost"}
                size="sm"
                onClick={() => setStatusFilter(s)}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="px-6 py-6">
        {filtered.length === 0 ? (
          <Card className="text-center py-20">
            <CardContent>
              <FileText
                size={40}
                style={{
                  color: "var(--muted-foreground)",
                  margin: "0 auto 12px",
                }}
              />
              <p className="text-sm" style={{ color: "var(--foreground)" }}>
                No jobs found
              </p>
              <p
                className="text-xs mt-2"
                style={{ color: "var(--muted-foreground)" }}
              >
                Try adjusting your search or filters
              </p>
              <Button
                variant="ghost"
                className="mt-4"
                onClick={() => router.push("/recruiter/jobs/new")}
              >
                Post your first job
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <div
              className="grid px-5 py-3 border-b-2"
              style={{
                gridTemplateColumns: "1fr 140px 100px 100px 120px 80px",
                borderColor: "var(--border)",
                background: "rgba(252,191,73,0.04)",
              }}
            >
              {["Job Title", "Team", "Applicants", "Status", "Posted", ""].map(
                (h) => (
                  <div
                    key={h}
                    className="text-[10px] uppercase tracking-widest"
                    style={{ color: "var(--color-gold)" }}
                  >
                    {h}
                  </div>
                )
              )}
            </div>

            {filtered.map((job, i) => {
              const applicantCount = job.applicantIds.length;
              const applicantsForJob: {
                applicant: Applicant;
                application: Application;
              }[] = allApplicants.reduce(
                (acc, applicant) => {
                  const application = applicant.applications.find(
                    (candidateApplication) =>
                      candidateApplication.jobId === job.id
                  );
                  if (application) {
                    acc.push({ applicant, application });
                  }
                  return acc;
                },
                [] as { applicant: Applicant; application: Application }[]
              );

              const isExpanded = expandedJobId === job.id;

              return (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <div
                    className="grid px-5 py-4 border-b-2 items-center cursor-pointer transition-all"
                    style={{
                      gridTemplateColumns: "1fr 140px 100px 100px 120px 80px",
                      borderColor: "var(--border)",
                      background: isExpanded
                        ? "rgba(247,127,0,0.04)"
                        : "transparent",
                    }}
                    onClick={() => router.push(`/recruiter/jobs/${job.id}`)}
                  >
                    <div>
                      <div
                        className="text-xs"
                        style={{ color: "var(--foreground)" }}
                      >
                        {job.title}
                      </div>
                      <div
                        className="text-[10px] mt-0.5 truncate max-w-[200px]"
                        style={{ color: "var(--muted-foreground)" }}
                      >
                        {job.overview.slice(0, 60)}...
                      </div>
                    </div>
                    <div
                      className="text-xs"
                      style={{ color: "var(--muted-foreground)" }}
                    >
                      {job.team}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Users
                        size={12}
                        style={{ color: "var(--muted-foreground)" }}
                      />
                      <span className="text-xs" style={{ color: "var(--foreground)" }}>
                        {applicantCount}
                      </span>
                    </div>
                    <div>
                      <Badge
                        variant={
                          job.status === "open"
                            ? "success"
                            : job.status === "draft"
                              ? "muted"
                              : "danger"
                        }
                      >
                        {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar
                        size={11}
                        style={{ color: "var(--muted-foreground)" }}
                      />
                      <span
                        className="text-[10px]"
                        style={{ color: "var(--muted-foreground)" }}
                      >
                        {job.postedDate}
                      </span>
                    </div>
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/recruiter/jobs/${job.id}`);
                        }}
                        className="p-1.5 transition-all"
                        style={{
                          background: "rgba(247,127,0,0.15)",
                          color: "var(--color-orange)",
                        }}
                      >
                        <Eye size={13} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedJobId(isExpanded ? null : job.id);
                        }}
                        className="p-1.5 transition-all"
                        style={{
                          background: "rgba(252,191,73,0.15)",
                          color: "var(--color-gold)",
                        }}
                      >
                        <ChevronRight
                          size={13}
                          style={{
                            transform: isExpanded
                              ? "rotate(90deg)"
                              : "rotate(0)",
                            transition: "transform 0.15s",
                          }}
                        />
                      </button>
                    </div>
                  </div>
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={retro.snap}
                        className="overflow-hidden"
                      >
                        <div
                          className="px-5 py-3 border-b-2"
                          style={{
                            borderColor: "var(--border)",
                            background: "rgba(252,191,73,0.04)",
                          }}
                        >
                          <div
                            className="text-[10px] uppercase tracking-widest mb-3"
                            style={{ color: "var(--color-orange)" }}
                          >
                            Applicants ({applicantsForJob.length})
                          </div>
                          {applicantsForJob.length === 0 ? (
                            <p
                              className="text-xs"
                              style={{ color: "var(--muted-foreground)" }}
                            >
                              No applicants yet.
                            </p>
                          ) : (
                            <div className="space-y-2">
                              {applicantsForJob.map(
                                ({ applicant, application }) => (
                                  <div
                                    key={`${job.id}-${applicant.id}`}
                                    className="flex items-center justify-between gap-3 p-3"
                                    style={{
                                      border: "1px solid var(--border)",
                                      background: "var(--surface)",
                                    }}
                                  >
                                    <div>
                                      <div
                                        className="text-xs"
                                        style={{ color: "var(--foreground)" }}
                                      >
                                        {applicant.firstName} {applicant.lastName}
                                      </div>
                                      <div
                                        className="text-[10px]"
                                        style={{
                                          color: "var(--muted-foreground)",
                                        }}
                                      >
                                        {stageStoryLabels[application.stage]}
                                      </div>
                                    </div>
                                    <Badge
                                      variant={
                                        application.resumeUrl
                                          ? "success"
                                          : "muted"
                                      }
                                    >
                                      {application.resumeUrl
                                        ? "Resume attached"
                                        : "No resume"}
                                    </Badge>
                                  </div>
                                )
                              )}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </Card>
        )}
      </div>
    </div>
  );
}
