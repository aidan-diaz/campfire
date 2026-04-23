"use client";

import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { useAts } from "@/context/AtsContext";
import { api } from "../../../../../convex/_generated/api";
import {
  getCompanyById,
  stageLabels,
  ApplicationStage,
} from "@/data/ats/mockData";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ats/ui/card";
import { Badge } from "@/components/ats/ui/badge";
import { Button } from "@/components/ats/ui/button";
import {
  LayoutDashboard,
  Briefcase,
  Plus,
  TrendingUp,
  Users,
  Clock,
  ChevronRight,
  AlertCircle,
  Star,
} from "lucide-react";
import { motion } from "motion/react";

function toDisplayName(value: string, fallback: string): string {
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > 24) return fallback;
  return trimmed;
}

export default function RecruiterDashboard() {
  const { currentTeamMember, allJobs, allApplicants } = useAts();
  const router = useRouter();
  const currentUser = useQuery(api.users.getCurrentUser, {});

  const displayFirstName = toDisplayName(
    currentUser?.firstName ?? currentTeamMember.firstName,
    "Manager"
  );
  const company = getCompanyById(currentTeamMember.companyId);
  const displayCompanyName =
    currentUser?.companyName?.trim() || company?.name || "Your Company";
  const myJobs = allJobs.filter(
    (j) => j.companyId === currentTeamMember.companyId
  );
  const openJobs = myJobs.filter((j) => j.status === "open");
  const draftJobs = myJobs.filter((j) => j.status === "draft");

  const myApplicantIds = new Set(myJobs.flatMap((j) => j.applicantIds));
  const myApplicants = allApplicants.filter((a) => myApplicantIds.has(a.id));

  const stageCounts: Record<ApplicationStage, number> = {
    applied: 0,
    screening: 0,
    interview: 0,
    final_round: 0,
    offered: 0,
    hired: 0,
    rejected: 0,
  };
  myApplicants.forEach((a) => {
    a.applications.forEach((app) => {
      if (myJobs.find((j) => j.id === app.jobId)) {
        stageCounts[app.stage] = (stageCounts[app.stage] || 0) + 1;
      }
    });
  });

  const stageDisplay: { stage: ApplicationStage; color: string }[] = [
    { stage: "applied", color: "var(--muted-foreground)" },
    { stage: "screening", color: "var(--color-gold)" },
    { stage: "interview", color: "var(--color-orange)" },
    { stage: "final_round", color: "#f472b6" },
    { stage: "offered", color: "#4caf50" },
    { stage: "hired", color: "#4caf50" },
  ];

  const recentApplicants = myApplicants
    .slice(0, 5)
    .map((a) => {
      const appForMyJob = a.applications.find((app) =>
        myJobs.find((j) => j.id === app.jobId)
      );
      const job = myJobs.find((j) => j.id === appForMyJob?.jobId);
      return { applicant: a, application: appForMyJob, job };
    })
    .filter((x) => x.application && x.job);

  const roleLabel =
    currentTeamMember.role === "hiring_manager"
      ? "Hiring Manager"
      : "Recruiter";

  return (
    <div className="min-h-screen" style={{ background: "var(--background)" }}>
      <div
        className="px-6 pt-8 pb-6 border-b-2"
        style={{ borderColor: "var(--border)" }}
      >
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <LayoutDashboard
                size={16}
                style={{ color: company?.color || "var(--color-orange)" }}
              />
              <span
                className="text-[10px] uppercase tracking-widest"
                style={{ color: company?.color || "var(--color-orange)" }}
              >
                {displayCompanyName} · {roleLabel}
              </span>
            </div>
            <h1
              className="text-xl uppercase tracking-wider"
              style={{ color: "var(--color-gold)" }}
            >
              Welcome, {displayFirstName}
            </h1>
            <p
              className="text-xs mt-1"
              style={{ color: "var(--muted-foreground)" }}
            >
              ► {openJobs.length} open roles · {myApplicants.length} total
              candidates
            </p>
          </div>
          <Button onClick={() => router.push("/recruiter/jobs/new")}>
            <Plus size={16} />
            Post New Quest
          </Button>
        </div>
      </div>

      <div className="px-6 py-6 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: "Open Roles",
              value: openJobs.length,
              icon: <Briefcase size={16} />,
              color: company?.color || "var(--color-orange)",
            },
            {
              label: "Active Candidates",
              value: myApplicants.length,
              icon: <Users size={16} />,
              color: "#4caf50",
            },
            {
              label: "Avg. Time to Hire",
              value: "29 days",
              icon: <Clock size={16} />,
              color: "var(--color-gold)",
            },
            {
              label: "Offer Rate",
              value: "67%",
              icon: <TrendingUp size={16} />,
              color: "var(--color-orange)",
            },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card style={{ borderColor: `${stat.color}40` }}>
                <CardContent className="pt-4">
                  <div
                    className="flex items-center gap-2 mb-2"
                    style={{ color: stat.color }}
                  >
                    {stat.icon}
                    <span className="text-[10px] uppercase tracking-widest">
                      {stat.label}
                    </span>
                  </div>
                  <div
                    className="text-2xl"
                    style={{ color: "var(--foreground)" }}
                  >
                    {stat.value}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Candidate Pipeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 lg:grid-cols-6 gap-3">
              {stageDisplay.map(({ stage, color }) => (
                <div
                  key={stage}
                  className="text-center p-3"
                  style={{
                    background: `${color}15`,
                    border: `1px solid ${color}30`,
                  }}
                >
                  <div
                    className="text-xl mb-1"
                    style={{ color }}
                  >
                    {stageCounts[stage]}
                  </div>
                  <div
                    className="text-[10px] uppercase tracking-wider"
                    style={{ color: "var(--muted-foreground)" }}
                  >
                    {stageLabels[stage]}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle>Open Roles</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/recruiter/jobs")}
              >
                View all →
              </Button>
            </CardHeader>
            <CardContent>
              {openJobs.length === 0 ? (
                <div className="text-center py-8">
                  <AlertCircle
                    size={24}
                    style={{
                      color: "var(--muted-foreground)",
                      margin: "0 auto 8px",
                    }}
                  />
                  <p
                    className="text-xs"
                    style={{ color: "var(--muted-foreground)" }}
                  >
                    No open roles. Post your first job!
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {openJobs.map((job) => {
                    const candidateCount = job.applicantIds.length;
                    return (
                      <button
                        key={job.id}
                        onClick={() => router.push(`/recruiter/jobs/${job.id}`)}
                        className="w-full flex items-center gap-3 p-3 text-left transition-all"
                        style={{
                          background: "rgba(247,127,0,0.04)",
                          border: "1px solid var(--border)",
                        }}
                      >
                        <div className="flex-1">
                          <div
                            className="text-xs"
                            style={{ color: "var(--foreground)" }}
                          >
                            {job.title}
                          </div>
                          <div
                            className="text-[10px]"
                            style={{ color: "var(--muted-foreground)" }}
                          >
                            {job.team} · Posted {job.postedDate}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1">
                            <Users
                              size={12}
                              style={{ color: "var(--muted-foreground)" }}
                            />
                            <span
                              className="text-[10px]"
                              style={{ color: "var(--foreground)" }}
                            >
                              {candidateCount}
                            </span>
                          </div>
                          <ChevronRight
                            size={14}
                            style={{ color: "var(--color-gold)" }}
                          />
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
              {draftJobs.length > 0 && (
                <div
                  className="mt-3 pt-3 border-t-2"
                  style={{ borderColor: "var(--border)" }}
                >
                  <span
                    className="text-[10px]"
                    style={{ color: "var(--muted-foreground)" }}
                  >
                    {draftJobs.length} draft{draftJobs.length > 1 ? "s" : ""} in
                    progress
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Star size={14} style={{ color: "var(--color-gold)" }} />
                Top Candidates
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentApplicants.length === 0 ? (
                <div className="text-center py-8">
                  <Users
                    size={24}
                    style={{
                      color: "var(--muted-foreground)",
                      margin: "0 auto 8px",
                    }}
                  />
                  <p
                    className="text-xs"
                    style={{ color: "var(--muted-foreground)" }}
                  >
                    No applicants yet.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {recentApplicants.map(({ applicant, application, job }, i) => {
                    if (!application || !job) return null;
                    return (
                      <button
                        key={applicant.id}
                        onClick={() => router.push(`/recruiter/jobs/${job.id}`)}
                        className="w-full flex items-center gap-3 p-3 text-left transition-all"
                        style={{
                          background: "rgba(252,191,73,0.04)",
                          border: "1px solid var(--border)",
                        }}
                      >
                        <div
                          className="flex items-center justify-center shrink-0 text-[10px]"
                          style={{
                            width: 24,
                            height: 24,
                            background: "var(--color-gold)",
                            color: "var(--primary-foreground)",
                          }}
                        >
                          #{i + 1}
                        </div>
                        <div
                          className="flex items-center justify-center shrink-0"
                          style={{
                            width: 32,
                            height: 32,
                            background:
                              "linear-gradient(135deg, var(--color-gold), var(--color-orange))",
                            fontSize: 10,
                            color: "var(--primary-foreground)",
                          }}
                        >
                          {applicant.avatar}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div
                            className="text-xs truncate"
                            style={{ color: "var(--foreground)" }}
                          >
                            {applicant.firstName} {applicant.lastName}
                          </div>
                          <div
                            className="text-[10px] truncate"
                            style={{ color: "var(--muted-foreground)" }}
                          >
                            {job.title}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          <Badge
                            variant={
                              application.stage === "hired"
                                ? "success"
                                : application.stage === "rejected"
                                  ? "danger"
                                  : "stage"
                            }
                          >
                            {stageLabels[application.stage]}
                          </Badge>
                          <Badge variant="level">LV.{applicant.level}</Badge>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
