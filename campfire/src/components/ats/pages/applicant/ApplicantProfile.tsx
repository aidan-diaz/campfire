"use client";

import { useState } from "react";
import { useAts } from "@/context/AtsContext";
import { XPBar } from "@/components/ats/shared/XPBar";
import { TaskCard } from "@/components/ats/shared/TaskCard";
import { JourneyPath } from "@/components/ats/shared/JourneyPath";
import { ResumeUpload } from "@/components/ats/shared/ResumeUpload";
import { QuestStepper } from "@/components/ats/shared/QuestStepper";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ats/ui/card";
import { Badge } from "@/components/ats/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ats/ui/tabs";
import { getTaskById, getCompanyById, stageStoryLabels } from "@/data/ats/mockData";
import { User, MapPin, Briefcase, Star, Award } from "lucide-react";

function toDisplayEmail(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed.includes("@")) return null;
  if (trimmed.length > 120) return null;
  if (trimmed.endsWith("@users.clerk.local")) return null;
  const localPart = trimmed.split("@")[0] ?? "";
  if (localPart.length > 24) return null;
  return trimmed;
}

function toDisplayName(value: string, fallback: string): string {
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > 24) return fallback;
  return trimmed;
}

function toDisplayAvatar(
  avatar: string,
  firstName: string,
  lastName: string
): string {
  const trimmed = avatar.trim();
  if (trimmed.length > 0 && trimmed.length <= 3) return trimmed;
  const initials =
    `${firstName[0] ?? ""}${lastName[0] ?? ""}`.toUpperCase();
  return initials || "U";
}

export default function ApplicantProfile() {
  const { currentApplicant, allJobs, uploadApplicantResume } = useAts();
  const jobById = (id: string) => allJobs.find((j) => j.id === id);
  const a = currentApplicant;

  const totalXP = a.completedTasks.reduce((s, ct) => s + ct.pointsEarned, 0);
  const displayEmail = toDisplayEmail(a.email);
  const displayFirstName = toDisplayName(a.firstName, "Adventurer");
  const displayLastName = toDisplayName(a.lastName, "");
  const displayAvatar = toDisplayAvatar(a.avatar, a.firstName, a.lastName);

  const profileSteps = ["Resume", "Skills", "Profile", "First Quest"];
  const profileProgress = (() => {
    if (a.applications.length > 0) return 4;
    if (a.skills.length > 0) return 2;
    if (a.resumeUrl) return 1;
    return 0;
  })();

  return (
    <div className="min-h-screen" style={{ background: "var(--background)" }}>
      <div
        className="px-6 pt-8 pb-6 border-b-2"
        style={{ borderColor: "var(--border)" }}
      >
        <div className="flex items-center gap-2 mb-1">
          <User size={16} style={{ color: "var(--color-orange)" }} />
          <span
            className="text-[10px] uppercase tracking-widest"
            style={{ color: "var(--color-orange)" }}
          >
            Career Profile
          </span>
        </div>
        <h1
          className="text-xl uppercase tracking-wider"
          style={{ color: "var(--color-gold)" }}
        >
          {displayFirstName} {displayLastName}
        </h1>
        <p
          className="text-xs mt-1"
          style={{ color: "var(--muted-foreground)" }}
        >
          {a.jobGoal}
        </p>
      </div>

      <div className="px-6 pt-6 space-y-5">
        <Card>
          <CardContent className="pt-4">
            <div className="flex flex-col sm:flex-row sm:items-start gap-6">
              <div
                className="flex items-center justify-center shrink-0 mx-auto sm:mx-0 text-xl"
                style={{
                  width: 72,
                  height: 72,
                  background:
                    "linear-gradient(135deg, var(--color-gold), var(--color-orange))",
                  border: "2px solid var(--color-gold)",
                  boxShadow:
                    "3px 3px 0 rgba(0,0,0,0.4), 0 0 16px rgba(252,191,73,0.3)",
                  color: "var(--primary-foreground)",
                }}
              >
                {displayAvatar}
              </div>
              <div className="flex-1 min-w-0 text-center sm:text-left">
                <h2
                  className="text-sm uppercase tracking-wider"
                  style={{ color: "var(--foreground)" }}
                >
                  {displayFirstName} {displayLastName}
                </h2>
                {displayEmail ? (
                  <p
                    className="text-xs mt-1"
                    style={{ color: "var(--muted-foreground)" }}
                  >
                    {displayEmail}
                  </p>
                ) : (
                  <p
                    className="text-xs mt-1"
                    style={{ color: "var(--muted-foreground)" }}
                  >
                    Email hidden
                  </p>
                )}
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-6 mt-4">
                  <div className="text-center">
                    <div
                      className="text-lg"
                      style={{ color: "var(--color-gold)" }}
                    >
                      {a.level}
                    </div>
                    <div
                      className="text-[10px] uppercase tracking-wider"
                      style={{ color: "var(--muted-foreground)" }}
                    >
                      Level
                    </div>
                  </div>
                  <div
                    className="hidden sm:block"
                    style={{
                      width: 2,
                      height: 30,
                      background: "var(--border)",
                    }}
                  />
                  <div className="text-center">
                    <div
                      className="text-lg"
                      style={{ color: "var(--color-orange)" }}
                    >
                      {a.completedTasks.length}
                    </div>
                    <div
                      className="text-[10px] uppercase tracking-wider"
                      style={{ color: "var(--muted-foreground)" }}
                    >
                      Tasks
                    </div>
                  </div>
                  <div
                    className="hidden sm:block"
                    style={{
                      width: 2,
                      height: 30,
                      background: "var(--border)",
                    }}
                  />
                  <div className="text-center">
                    <div className="text-lg" style={{ color: "#4caf50" }}>
                      {a.applications.length}
                    </div>
                    <div
                      className="text-[10px] uppercase tracking-wider"
                      style={{ color: "var(--muted-foreground)" }}
                    >
                      Quests
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <XPBar level={a.level} xp={a.xp} xpToNextLevel={a.xpToNextLevel} />

        <Card>
          <CardHeader>
            <CardTitle>Profile Completion</CardTitle>
          </CardHeader>
          <CardContent>
            <QuestStepper steps={profileSteps} currentIndex={profileProgress} />
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardContent className="pt-4 space-y-3">
              <div className="flex items-center gap-3">
                <MapPin size={14} style={{ color: "var(--muted-foreground)" }} />
                <span
                  className="text-xs"
                  style={{ color: "var(--foreground)" }}
                >
                  {a.location}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Briefcase
                  size={14}
                  style={{ color: "var(--muted-foreground)" }}
                />
                <span
                  className="text-xs"
                  style={{ color: "var(--foreground)" }}
                >
                  {a.experience} years experience
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Star size={14} style={{ color: "var(--color-gold)" }} />
                <span
                  className="text-xs"
                  style={{ color: "var(--color-gold)" }}
                >
                  {totalXP.toLocaleString()} total XP earned
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Skills</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {a.skills.map((skill) => (
                  <Badge key={skill} variant="xp">
                    {skill}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Resume</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p
              className="text-xs italic"
              style={{ color: "var(--foreground)", lineHeight: 1.6 }}
            >
              {a.resumeSnippet}
            </p>
            <ResumeUpload
              onUpload={uploadApplicantResume}
              currentResumeUrl={a.resumeUrl}
              currentResumeFileName={a.resumeFileName}
            />
          </CardContent>
        </Card>

        <Tabs defaultValue="quests">
          <TabsList>
            <TabsTrigger value="quests">Quest History</TabsTrigger>
            <TabsTrigger value="challenges">Completed Challenges</TabsTrigger>
          </TabsList>

          <TabsContent value="quests" className="space-y-4 pt-4">
            {a.applications.map((app) => {
              const job = jobById(app.jobId);
              const company = getCompanyById(app.companyId);
              if (!job || !company) return null;
              return (
                <Card
                  key={app.id}
                  style={{
                    borderLeftWidth: 4,
                    borderLeftColor: company.color,
                  }}
                >
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className="text-lg flex items-center justify-center"
                        style={{
                          width: 36,
                          height: 36,
                          background: `${company.color}20`,
                        }}
                      >
                        {company.logo}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div
                          className="text-sm"
                          style={{ color: "var(--foreground)" }}
                        >
                          {job.title}
                        </div>
                        <div
                          className="text-[10px] uppercase tracking-wider"
                          style={{ color: company.color }}
                        >
                          {company.name}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
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
                        <div
                          className="text-[10px] mt-1"
                          style={{ color: "var(--muted-foreground)" }}
                        >
                          Applied {app.dateApplied}
                        </div>
                      </div>
                    </div>
                    <JourneyPath currentStage={app.stage} />
                    {app.completedTasks.length > 0 && (
                      <div
                        className="mt-3 pt-3 border-t-2"
                        style={{ borderColor: "var(--border)" }}
                      >
                        <div
                          className="text-[10px] uppercase tracking-wider mb-2"
                          style={{ color: "var(--muted-foreground)" }}
                        >
                          Challenges completed:
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {app.completedTasks.map((ct) => {
                            const task = getTaskById(ct.taskId);
                            return task ? (
                              <Badge key={ct.taskId} variant="success">
                                ✓ {task.name} (+{ct.pointsEarned} XP)
                              </Badge>
                            ) : null;
                          })}
                        </div>
                      </div>
                    )}
                    {app.feedbackForApplicant && (
                      <div
                        className="mt-3 pt-3 border-t-2"
                        style={{ borderColor: "var(--border)" }}
                      >
                        <div
                          className="text-[10px] uppercase tracking-wider mb-2"
                          style={{ color: "var(--color-gold)" }}
                        >
                          Guide Feedback:
                        </div>
                        <p
                          className="text-xs italic"
                          style={{
                            color: "var(--foreground)",
                            lineHeight: 1.5,
                          }}
                        >
                          "{app.feedbackForApplicant}"
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>

          <TabsContent value="challenges" className="pt-4">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
              <h2
                className="text-sm uppercase tracking-wider"
                style={{ color: "var(--color-gold)" }}
              >
                Completed Challenges
              </h2>
              <div className="flex items-center gap-2">
                <Award size={14} style={{ color: "var(--color-gold)" }} />
                <span
                  className="text-xs"
                  style={{ color: "var(--color-gold)" }}
                >
                  {a.completedTasks.length} challenges ·{" "}
                  {totalXP.toLocaleString()} XP
                </span>
              </div>
            </div>
            <div className="space-y-3">
              {a.completedTasks.map((ct) => {
                const task = getTaskById(ct.taskId);
                return task ? (
                  <TaskCard
                    key={ct.taskId}
                    task={task}
                    completed
                    completedDate={ct.dateCompleted}
                  />
                ) : null;
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
