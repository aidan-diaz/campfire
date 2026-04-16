"use client";

import { useState } from "react";
import { useAts } from "@/context/AtsContext";
import { TaskCard } from "@/components/ats/shared/TaskCard";
import { NewQuestApplyModal } from "@/components/ats/shared/NewQuestApplyModal";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ats/ui/card";
import { Badge } from "@/components/ats/ui/badge";
import { Button } from "@/components/ats/ui/button";
import { Progress } from "@/components/ats/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ats/ui/tabs";
import {
  allTasks,
  Task,
  getDifficultyConfig,
  getCompanyById,
  type Job,
} from "@/data/ats/mockData";
import { Swords, Trophy, Plus, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { retro } from "@/lib/animations";

type FilterType = "all" | "general" | "company" | "role" | "completed";
type DiffFilter = "all" | "easy" | "medium" | "hard";

export default function TasksHub() {
  const { currentApplicant, completeTask, allJobs } = useAts();
  const [typeFilter, setTypeFilter] = useState<FilterType>("all");
  const [diffFilter, setDiffFilter] = useState<DiffFilter>("all");
  const [taskComplete, setTaskComplete] = useState<Task | null>(null);
  const [applyModal, setApplyModal] = useState(false);
  const [applyModalJobId, setApplyModalJobId] = useState<string | null>(null);

  const completedTaskIds = new Set(
    currentApplicant.completedTasks.map((ct) => ct.taskId)
  );

  const handleComplete = async (task: Task) => {
    try {
      await completeTask(task.id, task.points);
      setTaskComplete(task);
    } catch {
      /* error handling */
    }
  };

  const filtered = allTasks.filter((t) => {
    if (typeFilter === "completed") return completedTaskIds.has(t.id);
    if (typeFilter !== "all" && t.type !== typeFilter) return false;
    if (diffFilter !== "all" && t.difficulty !== diffFilter) return false;
    return true;
  });

  const totalXP = currentApplicant.completedTasks.reduce(
    (s, ct) => s + ct.pointsEarned,
    0
  );
  const totalPossible = allTasks.reduce((s, t) => s + t.points, 0);

  const byType = {
    general: allTasks.filter((t) => t.type === "general"),
    company: allTasks.filter((t) => t.type === "company"),
    role: allTasks.filter((t) => t.type === "role"),
  };

  const completedByType = {
    general: byType.general.filter((t) => completedTaskIds.has(t.id)).length,
    company: byType.company.filter((t) => completedTaskIds.has(t.id)).length,
    role: byType.role.filter((t) => completedTaskIds.has(t.id)).length,
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
    <div className="min-h-screen" style={{ background: "var(--background)" }}>
      <div
        className="px-6 pt-8 pb-6 border-b-2"
        style={{ borderColor: "var(--border)" }}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Swords size={16} style={{ color: "var(--color-orange)" }} />
              <span
                className="text-[10px] uppercase tracking-widest"
                style={{ color: "var(--color-orange)" }}
              >
                Challenges
              </span>
            </div>
            <h1
              className="text-xl uppercase tracking-wider"
              style={{ color: "var(--color-gold)" }}
            >
              Quest Board
            </h1>
            <p
              className="text-xs mt-1"
              style={{ color: "var(--muted-foreground)" }}
            >
              Complete challenges to prove your skills and advance
            </p>
          </div>
          <Button onClick={() => openApplyModal()}>
            <Plus size={16} />
            New Quest
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-6">
          {[
            {
              label: "Universal",
              count: completedByType.general,
              total: byType.general.length,
              color: "var(--color-gold)",
            },
            {
              label: "Company",
              count: completedByType.company,
              total: byType.company.length,
              color: "#f472b6",
            },
            {
              label: "Role",
              count: completedByType.role,
              total: byType.role.length,
              color: "var(--color-orange)",
            },
          ].map((s) => (
            <Card
              key={s.label}
              style={{ borderColor: `${s.color}40` }}
            >
              <CardContent className="pt-4">
                <div
                  className="text-[10px] uppercase tracking-widest mb-2"
                  style={{ color: s.color }}
                >
                  {s.label}
                </div>
                <div className="text-lg" style={{ color: "var(--foreground)" }}>
                  {s.count}
                  <span
                    className="text-xs ml-1"
                    style={{ color: "var(--muted-foreground)" }}
                  >
                    /{s.total}
                  </span>
                </div>
                <Progress
                  value={(s.count / s.total) * 100}
                  className="mt-2 h-1"
                  variant="xp"
                  animated={false}
                />
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mt-4">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <span style={{ color: "var(--color-gold)" }}>★</span>
              <span
                className="text-xs"
                style={{ color: "var(--color-gold)" }}
              >
                {totalXP.toLocaleString()} XP earned
              </span>
              <span
                className="text-xs"
                style={{ color: "var(--muted-foreground)" }}
              >
                of {totalPossible.toLocaleString()} possible
              </span>
              <div className="flex-1 ml-2">
                <Progress
                  value={(totalXP / totalPossible) * 100}
                  variant="xp"
                  animated={false}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div
        className="px-6 py-4 flex flex-wrap gap-2 border-b-2"
        style={{ borderColor: "var(--border)" }}
      >
        <span
          className="text-[10px] uppercase tracking-wider py-2 pr-2"
          style={{ color: "var(--muted-foreground)" }}
        >
          Type:
        </span>
        {(
          ["all", "general", "company", "role", "completed"] as FilterType[]
        ).map((f) => (
          <Button
            key={f}
            variant={typeFilter === f ? "default" : "ghost"}
            size="sm"
            onClick={() => setTypeFilter(f)}
          >
            {f === "general"
              ? "Universal"
              : f.charAt(0).toUpperCase() + f.slice(1)}
          </Button>
        ))}

        <span
          className="text-[10px] uppercase tracking-wider py-2 px-2 ml-2"
          style={{ color: "var(--muted-foreground)" }}
        >
          Difficulty:
        </span>
        {(["all", "easy", "medium", "hard"] as DiffFilter[]).map((d) => (
          <Button
            key={d}
            variant={diffFilter === d ? "gold" : "ghost"}
            size="sm"
            onClick={() => setDiffFilter(d)}
          >
            {d.charAt(0).toUpperCase() + d.slice(1)}
          </Button>
        ))}
      </div>

      <div className="px-6 py-6">
        {filtered.length === 0 ? (
          <Card className="text-center py-16">
            <CardContent>
              <CheckCircle2
                size={40}
                style={{ color: "#4caf50", margin: "0 auto 12px" }}
              />
              <p
                className="text-sm"
                style={{ color: "var(--foreground)" }}
              >
                All challenges complete!
              </p>
              <p
                className="text-xs mt-2"
                style={{ color: "var(--muted-foreground)" }}
              >
                You've conquered every quest in this category.
              </p>
            </CardContent>
          </Card>
        ) : typeFilter === "all" ? (
          <div className="space-y-8">
            <TaskGroup
              title="Universal Challenges"
              subtitle="Complete once — transfers to every company & role"
              tasks={filtered.filter((t) => t.type === "general")}
              completedIds={completedTaskIds}
              onComplete={handleComplete}
              color="var(--color-gold)"
              allJobs={allJobs}
            />
            <TaskGroup
              title="Company Challenges"
              subtitle="Show genuine interest in specific companies"
              tasks={filtered.filter((t) => t.type === "company")}
              completedIds={completedTaskIds}
              onComplete={handleComplete}
              color="#f472b6"
              showCompany
              allJobs={allJobs}
            />
            <TaskGroup
              title="Role Challenges"
              subtitle="Prove role-specific skills that matter most"
              tasks={filtered.filter((t) => t.type === "role")}
              completedIds={completedTaskIds}
              onComplete={handleComplete}
              color="var(--color-orange)"
              showRole
              allJobs={allJobs}
            />
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((task) => {
              const completed = completedTaskIds.has(task.id);
              const ct = currentApplicant.completedTasks.find(
                (x) => x.taskId === task.id
              );
              return (
                <TaskCard
                  key={task.id}
                  task={task}
                  completed={completed}
                  completedDate={ct?.dateCompleted}
                  onComplete={!completed ? handleComplete : undefined}
                />
              );
            })}
          </div>
        )}
      </div>

      <NewQuestApplyModal
        open={applyModal}
        onClose={closeApplyModal}
        initialJobId={applyModalJobId}
      />

      <AnimatePresence>
        {taskComplete && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,24,36,0.9)" }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={retro.spring}
              className="w-full max-w-xs pixel-border text-center p-8 scanlines"
              style={{ background: "var(--surface)" }}
            >
              <div
                className="flex items-center justify-center mx-auto mb-4"
                style={{
                  width: 72,
                  height: 72,
                  background:
                    "linear-gradient(135deg, var(--color-gold), var(--color-orange))",
                  boxShadow:
                    "3px 3px 0 rgba(0,0,0,0.4), 0 0 32px rgba(252,191,73,0.5)",
                }}
              >
                <Trophy
                  size={32}
                  style={{ color: "var(--primary-foreground)" }}
                />
              </div>
              <p
                className="text-[10px] uppercase tracking-widest mb-2"
                style={{ color: "var(--color-orange)" }}
              >
                Challenge Complete
              </p>
              <h3
                className="text-sm uppercase tracking-wider mb-2"
                style={{ color: "var(--foreground)" }}
              >
                {taskComplete.name}
              </h3>
              <p
                className="text-xs italic mb-4"
                style={{ color: "var(--muted-foreground)" }}
              >
                {taskComplete.questLabel}
              </p>
              <div className="flex items-center justify-center gap-2 mb-6">
                <span style={{ color: "var(--color-gold)" }}>★</span>
                <span
                  className="text-3xl"
                  style={{ color: "var(--color-gold)" }}
                >
                  +{taskComplete.points}
                </span>
                <span
                  className="text-sm"
                  style={{ color: "var(--color-orange)" }}
                >
                  XP
                </span>
              </div>
              <Button
                onClick={() => setTaskComplete(null)}
                className="w-full"
                variant="gold"
              >
                Claim Reward
              </Button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function TaskGroup({
  title,
  subtitle,
  tasks,
  completedIds,
  onComplete,
  color,
  showCompany = false,
  showRole = false,
  allJobs,
}: {
  title: string;
  subtitle: string;
  tasks: Task[];
  completedIds: Set<string>;
  onComplete: (t: Task) => void;
  color: string;
  showCompany?: boolean;
  showRole?: boolean;
  allJobs: Job[];
}) {
  const { currentApplicant } = useAts();
  if (tasks.length === 0) return null;
  return (
    <div>
      <div className="flex items-center gap-3 mb-3">
        <div
          style={{
            width: 4,
            height: 24,
            background: color,
          }}
        />
        <div>
          <h3
            className="text-sm uppercase tracking-wider"
            style={{ color: "var(--foreground)" }}
          >
            {title}
          </h3>
          <p
            className="text-[10px]"
            style={{ color: "var(--muted-foreground)" }}
          >
            {subtitle}
          </p>
        </div>
        <Badge variant="xp" className="ml-auto">
          {tasks.filter((t) => completedIds.has(t.id)).length}/{tasks.length}
        </Badge>
      </div>
      <div className="space-y-2">
        {tasks.map((task) => {
          const completed = completedIds.has(task.id);
          const ct = currentApplicant.completedTasks.find(
            (x) => x.taskId === task.id
          );
          const company =
            showCompany && task.companyId
              ? getCompanyById(task.companyId)
              : null;
          const job =
            showRole && task.jobId
              ? allJobs.find((j) => j.id === task.jobId)
              : null;
          return (
            <div key={task.id}>
              {(company || job) && (
                <div className="flex items-center gap-2 mb-1 ml-1">
                  {company && (
                    <span
                      className="text-[10px] uppercase tracking-wider"
                      style={{ color: company.color }}
                    >
                      {company.name}
                    </span>
                  )}
                  {job && (
                    <span
                      className="text-[10px]"
                      style={{ color: "var(--muted-foreground)" }}
                    >
                      · {job.title}
                    </span>
                  )}
                </div>
              )}
              <TaskCard
                task={task}
                completed={completed}
                completedDate={ct?.dateCompleted}
                onComplete={!completed ? onComplete : undefined}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
