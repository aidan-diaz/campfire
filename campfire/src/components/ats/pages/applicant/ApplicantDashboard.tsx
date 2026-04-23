"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAts } from "@/context/AtsContext";
import { XPBar } from "@/components/ats/shared/XPBar";
import { JourneyPath } from "@/components/ats/shared/JourneyPath";
import { TaskCard } from "@/components/ats/shared/TaskCard";
import { ResumeUpload } from "@/components/ats/shared/ResumeUpload";
import { NewQuestApplyModal } from "@/components/ats/shared/NewQuestApplyModal";
import { Badge } from "@/components/ats/ui/badge";
import { Button } from "@/components/ats/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ats/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ats/ui/tabs";
import {
  getCompanyById,
  allTasks,
  Task,
  stageStoryLabels,
  Application,
  getTeamMemberById,
  type Job,
} from "@/data/ats/mockData";
import {
  Map,
  MessageSquare,
  Trophy,
  Building2,
  Swords,
  ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { retro } from "@/lib/animations";

function toDisplayFirstName(value: string): string {
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > 24) return "Adventurer";
  return trimmed;
}

export default function ApplicantDashboard() {
  const { currentApplicant, allJobs, completeTask, uploadApplicantResume } =
    useAts();
  const jobById = (id: string) => allJobs.find((j) => j.id === id);
  const router = useRouter();
  const [applyModal, setApplyModal] = useState(false);
  const [applyModalJobId, setApplyModalJobId] = useState<string | null>(null);
  const [taskCompleteModal, setTaskCompleteModal] = useState<Task | null>(null);
  const displayFirstName = toDisplayFirstName(currentApplicant.firstName);

  const activeApplications = currentApplicant.applications.filter(
    (a) => a.stage !== "hired" && a.stage !== "rejected"
  );
  const completedApplications = currentApplicant.applications.filter(
    (a) => a.stage === "hired" || a.stage === "rejected"
  );

  const completedTaskIds = new Set(
    currentApplicant.completedTasks.map((ct) => ct.taskId)
  );
  const suggestedTasks = allTasks
    .filter((t) => !completedTaskIds.has(t.id) && t.type === "general")
    .slice(0, 3);

  const openJobs = allJobs.filter(
    (j) =>
      j.status === "open" &&
      !currentApplicant.applications.some((a) => a.jobId === j.id)
  );

  const handleCompleteTask = async (task: Task) => {
    try {
      await completeTask(task.id, task.points);
      setTaskCompleteModal(task);
    } catch {
      /* error handling */
    }
  };

  const openApplyModal = (jobId?: string) => {
    setApplyModalJobId(jobId ?? null);
    setApplyModal(true);
  };

  const closeApplyModal = () => {
    setApplyModal(false);
    setApplyModalJobId(null);
  };

  return (
    <div
      className="min-h-screen"
      style={{ background: "var(--background)" }}
    >
      <div
        className="px-6 pt-8 pb-6 border-b-2"
        style={{ borderColor: "var(--border)" }}
      >
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <Map size={16} style={{ color: "var(--color-orange)" }} />
            <span
              className="text-[10px] uppercase tracking-widest"
              style={{ color: "var(--color-orange)" }}
            >
              Your Journey
            </span>
          </div>
          <h1
            className="text-xl uppercase tracking-wider"
            style={{ color: "var(--color-gold)" }}
          >
            Welcome Back, {displayFirstName}
          </h1>
          <p
            className="text-xs mt-1"
            style={{ color: "var(--muted-foreground)" }}
          >
            ► {activeApplications.length} active quest
            {activeApplications.length !== 1 ? "s" : ""} ·{" "}
            {currentApplicant.completedTasks.length} challenges completed
          </p>
        </div>
        <XPBar
          level={currentApplicant.level}
          xp={currentApplicant.xp}
          xpToNextLevel={currentApplicant.xpToNextLevel}
        />
      </div>

      <div className="px-6 py-6 space-y-6">
        {!currentApplicant.resumeUrl && (
          <ResumeUpload
            onUpload={uploadApplicantResume}
            currentResumeUrl={currentApplicant.resumeUrl}
            currentResumeFileName={currentApplicant.resumeFileName}
          />
        )}

        {currentApplicant.resumeUrl && (
          <ResumeUpload
            onUpload={uploadApplicantResume}
            currentResumeUrl={currentApplicant.resumeUrl}
            currentResumeFileName={currentApplicant.resumeFileName}
            compact
          />
        )}

        <Tabs defaultValue="active" className="w-full">
          <TabsList>
            <TabsTrigger value="active">
              {activeApplications.length === 1
                ? "1 Active Quest"
                : `${activeApplications.length} Active Quests`}
            </TabsTrigger>
            <TabsTrigger value="strengthen">Strengthen Skills</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-4 pt-4">
            {activeApplications.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <Map
                    size={32}
                    style={{ color: "var(--muted-foreground)", margin: "0 auto 12px" }}
                  />
                  <p
                    className="text-sm"
                    style={{ color: "var(--muted-foreground)" }}
                  >
                    No active quests yet.
                  </p>
                  <Button
                    variant="ghost"
                    className="mt-4"
                    onClick={() => openApplyModal()}
                  >
                    Start your first journey →
                  </Button>
                </CardContent>
              </Card>
            ) : (
              activeApplications.map((app) => (
                <ApplicationCard
                  key={app.id}
                  app={app}
                  onCompleteTask={handleCompleteTask}
                  completedTaskIds={completedTaskIds}
                  jobById={jobById}
                />
              ))
            )}

            {completedApplications.length > 0 && (
              <div className="pt-4">
                <div className="pixel-divider mb-4" />
                <h2
                  className="text-sm uppercase tracking-wider mb-4"
                  style={{ color: "var(--color-gold)" }}
                >
                  Past Quests
                </h2>
                {completedApplications.map((app) => (
                  <ApplicationCard
                    key={app.id}
                    app={app}
                    onCompleteTask={handleCompleteTask}
                    completedTaskIds={completedTaskIds}
                    jobById={jobById}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="strengthen" className="pt-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span style={{ color: "var(--color-gold)" }}>★</span>
                    Suggested Challenges
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {suggestedTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onComplete={handleCompleteTask}
                    />
                  ))}
                  {suggestedTasks.length === 0 && (
                    <div className="py-6 text-center">
                      <Trophy
                        size={24}
                        style={{ color: "var(--color-gold)", margin: "0 auto 8px" }}
                      />
                      <p
                        className="text-xs"
                        style={{ color: "var(--muted-foreground)" }}
                      >
                        All general challenges complete!
                      </p>
                    </div>
                  )}
                  <Button
                    variant="ghost"
                    className="w-full"
                    onClick={() => router.push("/applicant/tasks")}
                  >
                    <Swords size={14} />
                    View All Challenges
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 size={14} style={{ color: "var(--color-gold)" }} />
                    New Quests Available
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {openJobs.slice(0, 3).map((job) => {
                    const company = getCompanyById(job.companyId);
                    return (
                      <div
                        key={job.id}
                        className="flex items-center justify-between gap-2 p-3"
                        style={{
                          background: "rgba(247,127,0,0.06)",
                          border: "1px solid var(--border)",
                        }}
                      >
                        <div>
                          <div
                            className="text-xs"
                            style={{ color: "var(--foreground)" }}
                          >
                            {job.title}
                          </div>
                          <div
                            className="text-[10px] uppercase tracking-wider"
                            style={{ color: company?.color || "var(--color-orange)" }}
                          >
                            {company?.name}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => openApplyModal(job.id)}
                        >
                          Apply
                        </Button>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <NewQuestApplyModal
        open={applyModal}
        onClose={closeApplyModal}
        initialJobId={applyModalJobId}
      />

      <AnimatePresence>
        {taskCompleteModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,24,36,0.9)" }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={retro.spring}
              className="w-full max-w-sm pixel-border text-center p-8 scanlines"
              style={{ background: "var(--surface)" }}
            >
              <div
                className="flex items-center justify-center mx-auto mb-4"
                style={{
                  width: 64,
                  height: 64,
                  background: "linear-gradient(135deg, var(--color-gold), var(--color-orange))",
                  boxShadow: "3px 3px 0 rgba(0,0,0,0.4), 0 0 24px rgba(252,191,73,0.4)",
                }}
              >
                <Trophy size={28} style={{ color: "var(--primary-foreground)" }} />
              </div>
              <h3
                className="text-sm uppercase tracking-wider mb-2"
                style={{ color: "var(--color-gold)" }}
              >
                Challenge Complete!
              </h3>
              <p
                className="text-xs mb-4"
                style={{ color: "var(--foreground)" }}
              >
                {taskCompleteModal.name}
              </p>
              <div className="flex items-center justify-center gap-2 mb-6">
                <span style={{ color: "var(--color-gold)" }}>★</span>
                <span
                  className="text-2xl"
                  style={{ color: "var(--color-gold)", fontWeight: 700 }}
                >
                  +{taskCompleteModal.points} XP
                </span>
              </div>
              <Button
                onClick={() => setTaskCompleteModal(null)}
                className="w-full"
                variant="gold"
              >
                Awesome!
              </Button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ApplicationCard({
  app,
  onCompleteTask,
  completedTaskIds,
  jobById,
}: {
  app: Application;
  onCompleteTask: (t: Task) => void;
  completedTaskIds: Set<string>;
  jobById: (id: string) => Job | undefined;
}) {
  const [expanded, setExpanded] = useState(false);
  const job = jobById(app.jobId);
  const company = getCompanyById(app.companyId);
  if (!job || !company) return null;

  const guides = app.assignedInterviewerIds.map(getTeamMemberById).filter(Boolean);
  const isTerminal = app.stage === "hired" || app.stage === "rejected";

  const availableTasks = allTasks.filter(
    (t) =>
      !completedTaskIds.has(t.id) &&
      (t.type === "general" ||
        (t.type === "company" && t.companyId === app.companyId) ||
        (t.type === "role" && t.jobId === app.jobId))
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="pixel-border overflow-hidden"
      style={{
        background: "var(--surface)",
        borderLeftWidth: 4,
        borderLeftColor: isTerminal
          ? app.stage === "hired"
            ? "#4caf50"
            : "var(--color-flag)"
          : company.color,
      }}
    >
      <div className="flex items-start gap-4 p-4">
        <div
          className="flex items-center justify-center shrink-0 text-lg"
          style={{
            width: 44,
            height: 44,
            background: `${company.color}20`,
            border: `2px solid ${company.color}40`,
          }}
        >
          {company.logo}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3
                className="text-sm"
                style={{ color: "var(--foreground)" }}
              >
                {job.title}
              </h3>
              <div
                className="text-[10px] uppercase tracking-wider"
                style={{ color: company.color }}
              >
                {company.name}
              </div>
            </div>
            <Badge
              variant={
                app.stage === "hired"
                  ? "success"
                  : app.stage === "rejected"
                    ? "danger"
                    : "stage"
              }
            >
              {stageStoryLabels[app.stage]}
            </Badge>
          </div>

          <div className="mt-3">
            <JourneyPath currentStage={app.stage} />
          </div>
        </div>
      </div>

      {guides.length > 0 && (
        <div
          className="px-4 pb-3 flex items-center gap-2 flex-wrap border-t-2"
          style={{ borderColor: "var(--border)" }}
        >
          <span
            className="text-[10px] uppercase tracking-wider py-2"
            style={{ color: "var(--muted-foreground)" }}
          >
            Guides:
          </span>
          {guides.map(
            (g) =>
              g && (
                <div
                  key={g.id}
                  className="flex items-center gap-1.5 px-2 py-1"
                  style={{
                    background: "rgba(247,127,0,0.08)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <div
                    className="flex items-center justify-center"
                    style={{
                      width: 18,
                      height: 18,
                      background: `${company.color}30`,
                      fontSize: 8,
                      color: company.color,
                    }}
                  >
                    {g.avatar}
                  </div>
                  <span
                    className="text-[10px]"
                    style={{ color: "var(--muted-foreground)" }}
                  >
                    {g.firstName} · {g.guideArchetype}
                  </span>
                </div>
              )
          )}
        </div>
      )}

      {app.feedbackForApplicant && (
        <div
          className="mx-4 mb-3 p-3 pixel-border"
          style={{ background: "rgba(252,191,73,0.06)" }}
        >
          <div className="flex items-center gap-2 mb-1.5">
            <MessageSquare size={12} style={{ color: "var(--color-gold)" }} />
            <span
              className="text-[10px] uppercase tracking-wider"
              style={{ color: "var(--color-gold)" }}
            >
              Guide Message
            </span>
          </div>
          <p
            className="text-xs italic"
            style={{ color: "var(--foreground)", lineHeight: 1.5 }}
          >
            "{app.feedbackForApplicant}"
          </p>
        </div>
      )}

      {!isTerminal && (
        <>
          <div
            className="flex items-center justify-between px-4 py-2 cursor-pointer border-t-2"
            style={{ borderColor: "var(--border)" }}
            onClick={() => setExpanded(!expanded)}
          >
            <div className="flex items-center gap-2">
              <Swords size={12} style={{ color: "var(--color-orange)" }} />
              <span
                className="text-[10px] uppercase tracking-wider"
                style={{ color: "var(--color-orange)" }}
              >
                {availableTasks.length} challenges available
              </span>
            </div>
            <motion.span
              style={{ color: "var(--color-gold)" }}
              animate={{ rotate: expanded ? 90 : 0 }}
              transition={retro.snap}
            >
              <ChevronRight size={14} />
            </motion.span>
          </div>

          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={retro.snap}
                className="overflow-hidden"
              >
                <div className="px-4 pb-4 space-y-2">
                  {availableTasks.slice(0, 3).map((t) => (
                    <TaskCard
                      key={t.id}
                      task={t}
                      onComplete={onCompleteTask}
                      compact
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </motion.div>
  );
}
