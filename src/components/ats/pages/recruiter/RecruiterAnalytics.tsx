"use client";

import { useAts } from "@/context/AtsContext";
import {
  getCompanyById,
  hiringMetrics,
  stageLabels,
  ApplicationStage,
  allTasks,
} from "@/data/ats/mockData";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ats/ui/card";
import { Badge } from "@/components/ats/ui/badge";
import { Progress } from "@/components/ats/ui/progress";
import {
  BarChart3,
  TrendingUp,
  Users,
  Clock,
  Target,
  Sparkles,
  CheckCircle2,
  ArrowUpRight,
  Star,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from "recharts";
import { motion } from "motion/react";

const TOOLTIP_STYLE = {
  background: "var(--surface)",
  border: "2px solid var(--color-gold)",
  borderRadius: 0,
  color: "var(--foreground)",
  fontSize: 10,
  fontFamily: "var(--font-pixel)",
};

export default function RecruiterAnalytics() {
  const { currentTeamMember, allJobs, allApplicants } = useAts();
  const company = getCompanyById(currentTeamMember.companyId);

  const myJobs = allJobs.filter(
    (j) => j.companyId === currentTeamMember.companyId
  );

  const stageCounts: Record<string, number> = {};
  const pipelineStages: ApplicationStage[] = [
    "applied",
    "screening",
    "interview",
    "final_round",
    "offered",
    "hired",
  ];
  pipelineStages.forEach((s) => (stageCounts[s] = 0));
  allApplicants.forEach((a) => {
    a.applications.forEach((app) => {
      if (myJobs.find((j) => j.id === app.jobId)) {
        stageCounts[app.stage] = (stageCounts[app.stage] || 0) + 1;
      }
    });
  });

  const funnelData = pipelineStages.map((s, i) => ({
    name: stageLabels[s],
    value: stageCounts[s],
    fill: [
      "var(--muted-foreground)",
      "var(--color-gold)",
      "var(--color-orange)",
      "#f472b6",
      "#4caf50",
      "var(--color-gold)",
    ][i],
  }));

  const sourceData = hiringMetrics.sourceOfHire.map((s, i) => ({
    name: s.source,
    value: s.count,
    percentage: s.percentage,
    fill: [
      "var(--color-orange)",
      "var(--color-gold)",
      "#f472b6",
      "var(--color-flag)",
      "#4caf50",
    ][i],
  }));

  const tasksByDiff = { easy: 0, medium: 0, hard: 0 };
  allApplicants.forEach((a) => {
    a.completedTasks.forEach((ct) => {
      const task = allTasks.find((t) => t.id === ct.taskId);
      if (task) tasksByDiff[task.difficulty]++;
    });
  });

  const taskDiffData = [
    { name: "Easy", value: tasksByDiff.easy, fill: "#4caf50" },
    { name: "Medium", value: tasksByDiff.medium, fill: "var(--color-gold)" },
    { name: "Hard", value: tasksByDiff.hard, fill: "var(--color-flag)" },
  ];

  const timeToHireData = myJobs
    .filter((j) => j.status === "open")
    .map((j, i) => ({
      name: j.title.split(" ").slice(0, 2).join(" "),
      days: [28, 42, 29, 35][i] || 30,
    }));

  const totalApplicants = new Set(myJobs.flatMap((j) => j.applicantIds)).size;
  const hiredCount = allApplicants.reduce(
    (c, a) =>
      c +
      a.applications.filter(
        (app) =>
          app.stage === "hired" && myJobs.find((j) => j.id === app.jobId)
      ).length,
    0
  );
  const offeredCount = allApplicants.reduce(
    (c, a) =>
      c +
      a.applications.filter(
        (app) =>
          (app.stage === "offered" || app.stage === "hired") &&
          myJobs.find((j) => j.id === app.jobId)
      ).length,
    0
  );

  const kpis = [
    {
      label: "Avg. Time to Fill",
      value: "33 days",
      icon: <Clock size={16} />,
      color: "var(--color-gold)",
      delta: "-4 days",
    },
    {
      label: "Avg. Time to Hire",
      value: "29 days",
      icon: <TrendingUp size={16} />,
      color: "var(--color-orange)",
      delta: "-6 days",
    },
    {
      label: "Offer Rate",
      value: `${offeredCount > 0 ? Math.round((hiredCount / offeredCount) * 100) : 100}%`,
      icon: <Target size={16} />,
      color: "#4caf50",
      delta: "+5%",
    },
    {
      label: "Avg. XP/Candidate",
      value: Math.round(
        allApplicants.reduce((s, a) => s + a.xp, 0) /
        (allApplicants.length || 1)
      ).toLocaleString(),
      icon: <Sparkles size={16} />,
      color: "var(--color-gold)",
      delta: "+320 XP",
    },
    {
      label: "Avg. Tasks Done",
      value: hiringMetrics.avgTasksCompleted.toString(),
      icon: <CheckCircle2 size={16} />,
      color: "var(--color-orange)",
      delta: "+1.2",
    },
    {
      label: "Total Candidates",
      value: totalApplicants.toString(),
      icon: <Users size={16} />,
      color: "var(--color-gold)",
      delta: `${myJobs.filter((j) => j.status === "open").length} roles`,
    },
  ];

  return (
    <div className="min-h-screen" style={{ background: "var(--background)" }}>
      <div
        className="px-6 pt-8 pb-6 border-b-2"
        style={{ borderColor: "var(--border)" }}
      >
        <div className="flex items-center gap-2 mb-1">
          <BarChart3
            size={16}
            style={{ color: company?.color || "var(--color-orange)" }}
          />
          <span
            className="text-[10px] uppercase tracking-widest"
            style={{ color: company?.color || "var(--color-orange)" }}
          >
            {company?.name?.toUpperCase()} · Quest Analytics
          </span>
        </div>
        <h1
          className="text-xl uppercase tracking-wider"
          style={{ color: "var(--color-gold)" }}
        >
          Hiring Analytics
        </h1>
        <p
          className="text-xs mt-1"
          style={{ color: "var(--muted-foreground)" }}
        >
          ► Data-driven insights across all quests · Q1 2026
        </p>
      </div>

      <div className="px-6 py-6 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {kpis.map((kpi, i) => (
            <motion.div
              key={kpi.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card style={{ borderColor: `${kpi.color}40` }}>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className="flex items-center gap-2"
                      style={{ color: kpi.color }}
                    >
                      {kpi.icon}
                      <span
                        className="text-[10px] uppercase tracking-widest"
                        style={{ color: "var(--muted-foreground)" }}
                      >
                        {kpi.label}
                      </span>
                    </div>
                    <ArrowUpRight size={12} style={{ color: "#4caf50" }} />
                  </div>
                  <div
                    className="text-2xl"
                    style={{ color: "var(--foreground)" }}
                  >
                    {kpi.value}
                  </div>
                  <div
                    className="text-[10px] mt-1"
                    style={{ color: "#4caf50" }}
                  >
                    {kpi.delta}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Hiring Pipeline Funnel</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart
                  data={funnelData}
                  layout="vertical"
                  margin={{ left: 10, right: 10 }}
                >
                  <XAxis
                    type="number"
                    tick={{ fill: "var(--muted-foreground)", fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    dataKey="name"
                    type="category"
                    tick={{ fill: "var(--foreground)", fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    width={70}
                  />
                  <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: "rgba(252,191,73,0.06)" }} />
                  <Bar dataKey="value" radius={[0, 0, 0, 0]}>
                    {funnelData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Source of Hire</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <ResponsiveContainer width={140} height={140}>
                  <PieChart>
                    <Pie
                      data={sourceData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={65}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {sourceData.map((entry, i) => (
                        <Cell key={i} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={TOOLTIP_STYLE} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 flex-1">
                  {sourceData.map((s) => (
                    <div
                      key={s.name}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2 h-2"
                          style={{ background: s.fill }}
                        />
                        <span
                          className="text-[10px]"
                          style={{ color: "var(--foreground)" }}
                        >
                          {s.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className="text-[10px]"
                          style={{ color: "var(--foreground)" }}
                        >
                          {s.value}
                        </span>
                        <span
                          className="text-[10px]"
                          style={{ color: "var(--muted-foreground)" }}
                        >
                          {s.percentage}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Time to Fill by Role (Days)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={timeToHireData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--border)"
                  />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: "var(--foreground)", fontSize: 9 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: "var(--muted-foreground)", fontSize: 9 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: "rgba(252,191,73,0.06)" }} />
                  <Bar
                    dataKey="days"
                    fill="var(--color-orange)"
                    radius={[0, 0, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Challenges by Difficulty</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={taskDiffData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--border)"
                  />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: "var(--foreground)", fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: "var(--muted-foreground)", fontSize: 9 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: "rgba(252,191,73,0.06)" }} />
                  <Bar dataKey="value" radius={[0, 0, 0, 0]}>
                    {taskDiffData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Star size={14} style={{ color: "var(--color-gold)" }} />
              Candidate XP Leaderboard
            </CardTitle>
            <span
              className="text-[10px]"
              style={{ color: "var(--muted-foreground)" }}
            >
              Gamified ranking across all applicants
            </span>
          </CardHeader>
          <CardContent className="space-y-2">
            {allApplicants
              .filter((a) =>
                a.applications.some((app) =>
                  myJobs.find((j) => j.id === app.jobId)
                )
              )
              .sort((a, b) => b.xp - a.xp)
              .slice(0, 5)
              .map((applicant, i) => {
                const application = applicant.applications.find((app) =>
                  myJobs.find((j) => j.id === app.jobId)
                );
                const jobForApp = myJobs.find(
                  (j) => j.id === application?.jobId
                );
                const maxXP = 8000;
                return (
                  <div
                    key={applicant.id}
                    className="flex items-center gap-3 p-3"
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
                        background:
                          i === 0
                            ? "var(--color-gold)"
                            : i === 1
                              ? "var(--muted-foreground)"
                              : i === 2
                                ? "#cd7f32"
                                : "var(--surface)",
                        color:
                          i < 3
                            ? "var(--primary-foreground)"
                            : "var(--muted-foreground)",
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
                      <div className="flex items-center gap-2">
                        <span
                          className="text-xs"
                          style={{ color: "var(--foreground)" }}
                        >
                          {applicant.firstName} {applicant.lastName}
                        </span>
                        <Badge variant="level">LV.{applicant.level}</Badge>
                        {jobForApp && (
                          <span
                            className="text-[10px] truncate"
                            style={{ color: "var(--muted-foreground)" }}
                          >
                            · {jobForApp.title}
                          </span>
                        )}
                      </div>
                      <div className="mt-1">
                        <Progress
                          value={(applicant.xp / maxXP) * 100}
                          variant="xp"
                          animated={false}
                          className="h-1"
                        />
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="flex items-center gap-1">
                        <span style={{ color: "var(--color-gold)" }}>★</span>
                        <span
                          className="text-sm"
                          style={{ color: "var(--color-gold)" }}
                        >
                          {applicant.xp.toLocaleString()}
                        </span>
                      </div>
                      <div
                        className="text-[10px]"
                        style={{ color: "var(--muted-foreground)" }}
                      >
                        {applicant.completedTasks.length} tasks
                      </div>
                    </div>
                  </div>
                );
              })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
