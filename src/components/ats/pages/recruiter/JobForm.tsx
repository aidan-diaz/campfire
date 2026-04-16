"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAts } from "@/context/AtsContext";
import { teamMembers, getCompanyById, Job, HiringStage } from "@/data/ats/mockData";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ats/ui/card";
import { Button } from "@/components/ats/ui/button";
import { Input } from "@/components/ats/ui/input";
import { Textarea } from "@/components/ats/ui/textarea";
import { Badge } from "@/components/ats/ui/badge";
import { QuestStepper } from "@/components/ats/shared/QuestStepper";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ats/ui/select";
import { Plus, Trash2, CheckCircle2, ChevronLeft, Briefcase } from "lucide-react";
import { motion } from "motion/react";
import { retro } from "@/lib/animations";

const defaultStages: HiringStage[] = [
  {
    id: "s-applied",
    name: "Applied",
    storyName: "Quest Begun",
    order: 1,
    passCriteria: [],
    requiredTaskIds: [],
    suggestedTaskIds: [],
    rubric: [],
  },
  {
    id: "s-screen",
    name: "Phone Screen",
    storyName: "First Encounter",
    order: 2,
    passCriteria: ["Communication clarity", "Role understanding"],
    requiredTaskIds: [],
    suggestedTaskIds: [],
    rubric: [
      {
        id: "r1",
        category: "Communication",
        description: "Clear, structured responses",
        maxScore: 5,
      },
      {
        id: "r2",
        category: "Motivation",
        description: "Genuine interest in role",
        maxScore: 5,
      },
    ],
  },
  {
    id: "s-interview",
    name: "Interview",
    storyName: "The Gauntlet",
    order: 3,
    passCriteria: ["Technical competency", "Problem-solving", "Culture fit"],
    requiredTaskIds: [],
    suggestedTaskIds: [],
    rubric: [
      {
        id: "r3",
        category: "Technical Skill",
        description: "Domain expertise",
        maxScore: 10,
      },
      {
        id: "r4",
        category: "Problem Solving",
        description: "Structured approach",
        maxScore: 10,
      },
      {
        id: "r5",
        category: "Culture Fit",
        description: "Values alignment",
        maxScore: 10,
      },
    ],
  },
  {
    id: "s-final",
    name: "Final Round",
    storyName: "Summit Approach",
    order: 4,
    passCriteria: ["Strategic thinking", "Leadership potential"],
    requiredTaskIds: [],
    suggestedTaskIds: [],
    rubric: [
      {
        id: "r6",
        category: "Vision",
        description: "Long-term strategic thinking",
        maxScore: 10,
      },
      {
        id: "r7",
        category: "Leadership",
        description: "Evidence of leading others",
        maxScore: 10,
      },
    ],
  },
];

export default function JobForm() {
  const { currentTeamMember, createJob } = useAts();
  const router = useRouter();
  const company = getCompanyById(currentTeamMember.companyId);

  const [form, setForm] = useState({
    title: "",
    team: "",
    hiringManagerId: currentTeamMember.id,
    teamMemberIds: [] as string[],
    overview: "",
    responsibilities: [""],
    qualifications: [""],
    workEnvironment: "",
    applicationProcess: "",
    stages: defaultStages,
  });
  const [submitted, setSubmitted] = useState(false);
  const [step, setStep] = useState(0);

  const myTeamMembers = teamMembers.filter(
    (m) => m.companyId === currentTeamMember.companyId && m.id !== currentTeamMember.id
  );

  const handleSubmit = async (status: "open" | "draft") => {
    const newJob: Job = {
      id: `job-new-${Date.now()}`,
      companyId: currentTeamMember.companyId,
      title: form.title,
      team: form.team,
      hiringManagerId: form.hiringManagerId,
      teamMemberIds: form.teamMemberIds,
      overview: form.overview,
      responsibilities: form.responsibilities.filter(Boolean),
      qualifications: form.qualifications.filter(Boolean),
      workEnvironment: form.workEnvironment,
      applicationProcess: form.applicationProcess,
      stages: form.stages,
      postedDate: new Date().toISOString().split("T")[0],
      status,
      applicantIds: [],
      requiredTaskIds: [],
    };
    try {
      await createJob(newJob);
    } catch {
      return;
    }
    setSubmitted(true);
    setTimeout(() => router.push("/recruiter/jobs"), 1500);
  };

  const addListItem = (field: "responsibilities" | "qualifications") => {
    setForm((f) => ({ ...f, [field]: [...f[field], ""] }));
  };

  const updateListItem = (
    field: "responsibilities" | "qualifications",
    i: number,
    val: string
  ) => {
    setForm((f) => {
      const list = [...f[field]];
      list[i] = val;
      return { ...f, [field]: list };
    });
  };

  const removeListItem = (
    field: "responsibilities" | "qualifications",
    i: number
  ) => {
    setForm((f) => ({
      ...f,
      [field]: f[field].filter((_, idx) => idx !== i),
    }));
  };

  const toggleTeamMember = (id: string) => {
    setForm((f) => ({
      ...f,
      teamMemberIds: f.teamMemberIds.includes(id)
        ? f.teamMemberIds.filter((x) => x !== id)
        : [...f.teamMemberIds, id],
    }));
  };

  const formSteps = ["Details", "Team", "Stages"];

  if (submitted) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "var(--background)" }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={retro.spring}
          className="text-center pixel-border p-8 scanlines"
          style={{ background: "var(--surface)" }}
        >
          <div
            className="flex items-center justify-center mx-auto mb-4"
            style={{
              width: 64,
              height: 64,
              background:
                "linear-gradient(135deg, #4caf50, var(--color-gold))",
              boxShadow: "3px 3px 0 rgba(0,0,0,0.4)",
            }}
          >
            <CheckCircle2
              size={32}
              style={{ color: "var(--primary-foreground)" }}
            />
          </div>
          <h2
            className="text-sm uppercase tracking-wider mb-2"
            style={{ color: "var(--color-gold)" }}
          >
            Quest Posted!
          </h2>
          <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
            Redirecting to your jobs...
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--background)" }}>
      <div
        className="px-6 pt-8 pb-6 border-b-2"
        style={{ borderColor: "var(--border)" }}
      >
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/recruiter")}
          className="mb-4"
        >
          <ChevronLeft size={14} /> Back to Dashboard
        </Button>
        <div className="flex items-center gap-2 mb-1">
          <Briefcase
            size={16}
            style={{ color: company?.color || "var(--color-orange)" }}
          />
          <span
            className="text-[10px] uppercase tracking-widest"
            style={{ color: company?.color || "var(--color-orange)" }}
          >
            Post a Job · {company?.name?.toUpperCase()}
          </span>
        </div>
        <h1
          className="text-xl uppercase tracking-wider"
          style={{ color: "var(--color-gold)" }}
        >
          Create New Quest
        </h1>

        <div className="mt-4">
          <QuestStepper steps={formSteps} currentIndex={step} />
        </div>
      </div>

      <div className="px-6 py-6 max-w-2xl">
        {step === 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Quest Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <Input
                label="Quest Title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Senior Frontend Engineer"
              />

              <Select
                value={form.team}
                onValueChange={(val) => setForm({ ...form, team: val })}
              >
                <SelectTrigger label="Guild (Team)">
                  <SelectValue placeholder="Select team..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Product Engineering">
                    Product Engineering
                  </SelectItem>
                  <SelectItem value="Data & AI">Data & AI</SelectItem>
                  <SelectItem value="Go-To-Market (GTM)">
                    Go-To-Market (GTM)
                  </SelectItem>
                  <SelectItem value="Design">Design</SelectItem>
                  <SelectItem value="Operations">Operations</SelectItem>
                </SelectContent>
              </Select>

              <Textarea
                label="Quest Description"
                value={form.overview}
                onChange={(e) => setForm({ ...form, overview: e.target.value })}
                placeholder="Describe the role and what makes it exciting..."
              />

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="stat-label">Responsibilities</label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => addListItem("responsibilities")}
                  >
                    <Plus size={12} /> Add
                  </Button>
                </div>
                <div className="space-y-2">
                  {form.responsibilities.map((r, i) => (
                    <div key={i} className="flex gap-2">
                      <input
                        className="stat-input flex-1"
                        value={r}
                        onChange={(e) =>
                          updateListItem("responsibilities", i, e.target.value)
                        }
                        placeholder={`Responsibility ${i + 1}`}
                      />
                      {form.responsibilities.length > 1 && (
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => removeListItem("responsibilities", i)}
                        >
                          <Trash2 size={14} />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="stat-label">Requirements</label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => addListItem("qualifications")}
                  >
                    <Plus size={12} /> Add
                  </Button>
                </div>
                <div className="space-y-2">
                  {form.qualifications.map((q, i) => (
                    <div key={i} className="flex gap-2">
                      <input
                        className="stat-input flex-1"
                        value={q}
                        onChange={(e) =>
                          updateListItem("qualifications", i, e.target.value)
                        }
                        placeholder={`Requirement ${i + 1}`}
                      />
                      {form.qualifications.length > 1 && (
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => removeListItem("qualifications", i)}
                        >
                          <Trash2 size={14} />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <Input
                label="Work Environment"
                value={form.workEnvironment}
                onChange={(e) =>
                  setForm({ ...form, workEnvironment: e.target.value })
                }
                placeholder="e.g. Hybrid, San Francisco, CA"
              />
            </CardContent>
          </Card>
        )}

        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Team Setup</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <Select
                value={form.hiringManagerId}
                onValueChange={(val) =>
                  setForm({ ...form, hiringManagerId: val })
                }
              >
                <SelectTrigger label="Hiring Manager">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {teamMembers
                    .filter((m) => m.companyId === currentTeamMember.companyId)
                    .map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.firstName} {m.lastName} ·{" "}
                        {m.role === "hiring_manager"
                          ? "Hiring Manager"
                          : m.role === "recruiter"
                            ? "Recruiter"
                            : "Team Member"}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>

              <div>
                <label className="stat-label">Team Members (Interviewers)</label>
                <div className="space-y-2 mt-2">
                  {myTeamMembers.map((m) => {
                    const selected = form.teamMemberIds.includes(m.id);
                    return (
                      <button
                        key={m.id}
                        onClick={() => toggleTeamMember(m.id)}
                        className="w-full flex items-center gap-3 p-3 text-left transition-all"
                        style={{
                          border: selected
                            ? "2px solid var(--color-orange)"
                            : "2px solid var(--border)",
                          background: selected
                            ? "rgba(247,127,0,0.08)"
                            : "var(--surface)",
                        }}
                      >
                        <div
                          className="flex items-center justify-center"
                          style={{
                            width: 32,
                            height: 32,
                            background: "rgba(247,127,0,0.2)",
                            fontSize: 10,
                            color: "var(--color-orange)",
                          }}
                        >
                          {m.avatar}
                        </div>
                        <div className="flex-1">
                          <div
                            className="text-xs"
                            style={{ color: "var(--foreground)" }}
                          >
                            {m.firstName} {m.lastName}
                          </div>
                          <div
                            className="text-[10px]"
                            style={{ color: "var(--muted-foreground)" }}
                          >
                            {m.team}
                          </div>
                        </div>
                        {selected && (
                          <CheckCircle2
                            size={16}
                            style={{ color: "var(--color-orange)" }}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Quest Stages</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p
                className="text-xs"
                style={{ color: "var(--muted-foreground)" }}
              >
                Review and customize the hiring stages for this role.
              </p>
              {form.stages.map((stage, i) => (
                <div
                  key={stage.id}
                  className="p-4"
                  style={{
                    border: "2px solid var(--border)",
                    background: "var(--surface)",
                  }}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className="flex items-center justify-center text-[10px]"
                      style={{
                        width: 24,
                        height: 24,
                        background: "var(--color-orange)",
                        color: "var(--primary-foreground)",
                      }}
                    >
                      {i + 1}
                    </div>
                    <input
                      className="stat-input flex-1"
                      value={stage.name}
                      onChange={(e) => {
                        const updated = [...form.stages];
                        updated[i] = { ...stage, name: e.target.value };
                        setForm({ ...form, stages: updated });
                      }}
                    />
                    <Badge variant="stage">{stage.storyName}</Badge>
                  </div>
                  {stage.passCriteria.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {stage.passCriteria.map((c) => (
                        <Badge key={c} variant="xp">
                          {c}
                        </Badge>
                      ))}
                    </div>
                  )}
                  {stage.rubric.length > 0 && (
                    <div className="mt-2">
                      <div
                        className="text-[10px] mb-1"
                        style={{ color: "var(--muted-foreground)" }}
                      >
                        Rubric ({stage.rubric.length} criteria)
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {stage.rubric.map((r) => (
                          <span
                            key={r.id}
                            className="text-[10px]"
                            style={{ color: "var(--muted-foreground)" }}
                          >
                            {r.category} (/{r.maxScore})
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        <div
          className="flex gap-3 mt-8 pt-6 border-t-2"
          style={{ borderColor: "var(--border)" }}
        >
          {step > 0 && (
            <Button variant="ghost" className="flex-1" onClick={() => setStep(step - 1)}>
              Back
            </Button>
          )}
          {step < 2 ? (
            <Button className="flex-1" onClick={() => setStep(step + 1)}>
              Continue
            </Button>
          ) : (
            <div className="flex gap-2 flex-1">
              <Button
                variant="ghost"
                className="flex-1"
                onClick={() => handleSubmit("draft")}
              >
                Save Draft
              </Button>
              <Button
                className="flex-1"
                disabled={!form.title || !form.team}
                onClick={() => handleSubmit("open")}
              >
                Publish Quest
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
