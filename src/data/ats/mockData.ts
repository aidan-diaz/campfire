export type Difficulty = 'easy' | 'medium' | 'hard';
export type TaskType = 'general' | 'company' | 'role';
export type ApplicationStage =
  | 'applied'
  | 'screening'
  | 'interview'
  | 'final_round'
  | 'offered'
  | 'hired'
  | 'rejected';

export interface Task {
  id: string;
  type: TaskType;
  name: string;
  description: string;
  why: string;
  difficulty: Difficulty;
  points: number;
  companyId?: string;
  jobId?: string;
  estimatedTime: string;
  skills: string[];
  questLabel?: string; // Story label
}

export interface CompletedTask {
  taskId: string;
  dateCompleted: string;
  pointsEarned: number;
}

export interface Application {
  id: string;
  jobId: string;
  companyId: string;
  stage: ApplicationStage;
  dateApplied: string;
  dateScreened?: string;
  dateInterviewed?: string;
  dateOffered?: string;
  dateHired?: string;
  dateRejected?: string;
  completedTasks: CompletedTask[];
  assignedInterviewerIds: string[];
  feedbackForApplicant?: string;
  source: string;
  resumeFileName?: string;
  resumeUrl?: string;
  resumeUploadedAt?: string;
}

export interface Applicant {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  jobGoal: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
  completedTasks: CompletedTask[];
  applications: Application[];
  skills: string[];
  location: string;
  experience: number;
  resumeSnippet: string;
  resumeFileName?: string;
  resumeUrl?: string;
  resumeUploadedAt?: string;
  avatar: string;
}

export interface RubricItem {
  id: string;
  category: string;
  description: string;
  maxScore: number;
}

export interface HiringStage {
  id: string;
  name: string;
  storyName: string;
  order: number;
  passCriteria: string[];
  requiredTaskIds: string[];
  suggestedTaskIds: string[];
  rubric: RubricItem[];
}

export interface TeamMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  team: string;
  role: 'recruiter' | 'hiring_manager' | 'team_member';
  companyId: string;
  avatar: string;
  guideArchetype: string;
}

export interface Job {
  id: string;
  companyId: string;
  title: string;
  team: string;
  hiringManagerId: string;
  teamMemberIds: string[];
  overview: string;
  responsibilities: string[];
  qualifications: string[];
  workEnvironment: string;
  applicationProcess: string;
  stages: HiringStage[];
  postedDate: string;
  status: 'open' | 'closed' | 'draft';
  applicantIds: string[];
  requiredTaskIds: string[];
}

export interface Company {
  id: string;
  name: string;
  industry: string;
  color: string;
  accentColor: string;
  description: string;
  teamFocus: string;
  logo: string;
}

export interface ScoreCard {
  id: string;
  applicantId: string;
  jobId: string;
  stageId: string;
  interviewerId: string;
  scores: { rubricItemId: string; score: number; notes: string }[];
  feedbackForRecruiter: string;
  feedbackForApplicant: string;
  recommendation: 'advance' | 'reject' | 'hold';
  completedAt: string;
}

// ─────────────────────────────────────────────
// COMPANIES
// ─────────────────────────────────────────────
export const companies: Company[] = [
  {
    id: 'nexacloud',
    name: 'NexaCloud',
    industry: 'SaaS Platform',
    color: '#7c3aed',
    accentColor: '#a78bfa',
    description: 'Building the next generation of cloud-based productivity tools.',
    teamFocus: 'Shipping features, scaling infra, growing product',
    logo: '⬡',
  },
  {
    id: 'synapseai',
    name: 'Synapse AI',
    industry: 'Data & AI',
    color: '#2563eb',
    accentColor: '#60a5fa',
    description: 'Transforming raw data into intelligent, predictive systems.',
    teamFocus: 'Analytics, predictive modeling, AI-driven features',
    logo: '◈',
  },
  {
    id: 'momentumgtm',
    name: 'Momentum GTM',
    industry: 'Go-To-Market',
    color: '#db2777',
    accentColor: '#f472b6',
    description: 'Driving customer acquisition and explosive revenue growth.',
    teamFocus: 'Lead gen, closing deals, retention, expansion',
    logo: '▲',
  },
];

// ─────────────────────────────────────────────
// TASKS — General
// ─────────────────────────────────────────────
export const generalTasks: Task[] = [
  {
    id: 'gt-001',
    type: 'general',
    name: 'Professional Bio Challenge',
    description: 'Write a compelling 150-word professional bio that tells your story beyond your resume.',
    why: 'Demonstrates self-awareness, communication, and personal branding — skills every employer values.',
    difficulty: 'easy',
    points: 75,
    estimatedTime: '20 min',
    skills: ['Communication', 'Self-awareness', 'Branding'],
    questLabel: 'The Scrolls of Identity',
  },
  {
    id: 'gt-002',
    type: 'general',
    name: 'Skills Assessment Quiz',
    description: 'Complete a multi-domain skills assessment covering logic, problem-solving, and domain expertise.',
    why: 'Provides verified, standardized proof of capability that transfers across all applications.',
    difficulty: 'medium',
    points: 175,
    estimatedTime: '45 min',
    skills: ['Critical Thinking', 'Logic', 'Domain Knowledge'],
    questLabel: 'Trial of Aptitude',
  },
  {
    id: 'gt-003',
    type: 'general',
    name: '90-Second Intro Video',
    description: 'Record a 90-second video introducing yourself, your experience, and your career goals.',
    why: 'Showcases communication presence and authenticity — giving recruiters a real sense of who you are.',
    difficulty: 'medium',
    points: 200,
    estimatedTime: '30 min',
    skills: ['Presentation', 'Confidence', 'Storytelling'],
    questLabel: 'The First Beacon',
  },
  {
    id: 'gt-004',
    type: 'general',
    name: 'Career Goals Manifesto',
    description: 'Write a structured 1-page document detailing your 1-year, 3-year, and 5-year career vision.',
    why: 'Signals ambition, clarity of purpose, and long-term potential to every hiring team.',
    difficulty: 'easy',
    points: 100,
    estimatedTime: '25 min',
    skills: ['Planning', 'Vision', 'Written Communication'],
    questLabel: 'The Oracle\'s Path',
  },
  {
    id: 'gt-005',
    type: 'general',
    name: 'Portfolio Deep Dive',
    description: 'Submit 2–3 work samples or projects with context on your role, impact, and lessons learned.',
    why: 'Work samples are the strongest signal of capability — proven impact over claimed skills.',
    difficulty: 'hard',
    points: 375,
    estimatedTime: '90 min',
    skills: ['Impact Measurement', 'Project Work', 'Reflection'],
    questLabel: 'Relics of Mastery',
  },
];

// ─────────────────────────────────────────────
// TASKS — Company-Specific
// ─────────────────────────────────────────────
export const companyTasks: Task[] = [
  // NexaCloud
  {
    id: 'ct-nexacloud-001',
    type: 'company',
    name: 'NexaCloud Product Review',
    description: 'Use NexaCloud\'s platform for 30 minutes and write a 1-page UX/product analysis.',
    why: 'Shows genuine curiosity and customer empathy — key for any product-driven company.',
    difficulty: 'medium',
    points: 225,
    companyId: 'nexacloud',
    estimatedTime: '60 min',
    skills: ['Product Thinking', 'UX Analysis', 'Written Communication'],
    questLabel: 'Scouting the Kingdom',
  },
  {
    id: 'ct-nexacloud-002',
    type: 'company',
    name: 'NexaCloud Culture Quiz',
    description: 'Complete NexaCloud\'s culture and values alignment quiz.',
    why: 'Demonstrates culture awareness and self-selection — reducing mis-hires on both sides.',
    difficulty: 'easy',
    points: 80,
    companyId: 'nexacloud',
    estimatedTime: '15 min',
    skills: ['Culture Fit', 'Self-Awareness'],
    questLabel: 'The Code of the Realm',
  },
  {
    id: 'ct-nexacloud-003',
    type: 'company',
    name: 'Sprint Planning Simulation',
    description: 'You\'re given a backlog of 12 tickets. Prioritize them for a 2-week sprint with justification.',
    why: 'Tests real-world prioritization under constraints — directly relevant to any NexaCloud role.',
    difficulty: 'hard',
    points: 400,
    companyId: 'nexacloud',
    estimatedTime: '90 min',
    skills: ['Prioritization', 'Agile', 'Product Judgment'],
    questLabel: 'Command the Vanguard',
  },
  // Synapse AI
  {
    id: 'ct-synapseai-001',
    type: 'company',
    name: 'Data Story Challenge',
    description: 'Analyze a provided dataset and create a 5-slide narrative about what you found.',
    why: 'Showcases data literacy and storytelling — Synapse AI\'s core competency combination.',
    difficulty: 'hard',
    points: 425,
    companyId: 'synapseai',
    estimatedTime: '120 min',
    skills: ['Data Analysis', 'Storytelling', 'Visualization'],
    questLabel: 'The Oracle\'s Lens',
  },
  {
    id: 'ct-synapseai-002',
    type: 'company',
    name: 'AI Ethics Scenario Quiz',
    description: 'Work through 5 AI ethics dilemmas and explain your decision-making process.',
    why: 'Synapse AI prioritizes responsible AI — this signals value alignment from day one.',
    difficulty: 'medium',
    points: 200,
    companyId: 'synapseai',
    estimatedTime: '40 min',
    skills: ['Ethics', 'Critical Thinking', 'AI Literacy'],
    questLabel: 'The Philosopher\'s Stone',
  },
  // Momentum GTM
  {
    id: 'ct-momentumgtm-001',
    type: 'company',
    name: 'Cold Outreach Campaign',
    description: 'Write 3 cold outreach sequences (email + LinkedIn) for a fictional B2B SaaS product.',
    why: 'Real-world GTM writing demonstrates you can generate pipeline — not just talk about it.',
    difficulty: 'medium',
    points: 250,
    companyId: 'momentumgtm',
    estimatedTime: '60 min',
    skills: ['Copywriting', 'Sales Strategy', 'Persuasion'],
    questLabel: 'The Merchant\'s Gambit',
  },
  {
    id: 'ct-momentumgtm-002',
    type: 'company',
    name: 'Market Expansion Pitch',
    description: 'Identify a new market segment for Momentum GTM and pitch a 90-day go-to-market strategy.',
    why: 'Tests strategic thinking and business acumen — directly tied to Momentum\'s growth mission.',
    difficulty: 'hard',
    points: 450,
    companyId: 'momentumgtm',
    estimatedTime: '120 min',
    skills: ['Strategy', 'Market Research', 'Presentation'],
    questLabel: 'The Conqueror\'s Map',
  },
];

// ─────────────────────────────────────────────
// TASKS — Role-Specific
// ─────────────────────────────────────────────
export const roleTasks: Task[] = [
  // Frontend Engineer @ NexaCloud
  {
    id: 'rt-fe-001',
    type: 'role',
    name: 'React Component Challenge',
    description: 'Build a fully functional data table component with sort, filter, and pagination in React + TypeScript.',
    why: 'Directly demonstrates production-level React skill — far stronger than any resume line.',
    difficulty: 'hard',
    points: 450,
    companyId: 'nexacloud',
    jobId: 'job-001',
    estimatedTime: '120 min',
    skills: ['React', 'TypeScript', 'Component Design'],
    questLabel: 'The Architect\'s Trial',
  },
  {
    id: 'rt-fe-002',
    type: 'role',
    name: 'Design System Audit',
    description: 'Review a provided design system and document 3 accessibility issues + propose fixes.',
    why: 'Shows you think beyond code — accessibility and design empathy are valued differentiators.',
    difficulty: 'medium',
    points: 200,
    companyId: 'nexacloud',
    jobId: 'job-001',
    estimatedTime: '45 min',
    skills: ['Accessibility', 'CSS', 'Design Systems'],
    questLabel: 'The Artisan\'s Eye',
  },
  // Product Manager @ NexaCloud
  {
    id: 'rt-pm-001',
    type: 'role',
    name: 'PRD Writing Challenge',
    description: 'Write a Product Requirements Document for a "smart notification" feature for NexaCloud.',
    why: 'PRD quality is the single best predictor of PM effectiveness — this separates top candidates.',
    difficulty: 'hard',
    points: 500,
    companyId: 'nexacloud',
    jobId: 'job-002',
    estimatedTime: '150 min',
    skills: ['Product Management', 'Requirements Writing', 'Strategic Thinking'],
    questLabel: 'The Architect\'s Blueprint',
  },
  // Data Scientist @ Synapse AI
  {
    id: 'rt-ds-001',
    type: 'role',
    name: 'Model Evaluation Exercise',
    description: 'Given a pre-built ML model and evaluation results, identify 3 issues and propose improvements.',
    why: 'Critical evaluation skill is what separates junior from senior data scientists.',
    difficulty: 'hard',
    points: 475,
    companyId: 'synapseai',
    jobId: 'job-003',
    estimatedTime: '120 min',
    skills: ['Machine Learning', 'Model Evaluation', 'Statistical Thinking'],
    questLabel: 'The Sage\'s Scrutiny',
  },
  {
    id: 'rt-ds-002',
    type: 'role',
    name: 'SQL Challenge',
    description: 'Complete 5 increasingly complex SQL queries on a provided schema with business context.',
    why: 'Data scientists who can SQL well move 5x faster — this is table stakes.',
    difficulty: 'medium',
    points: 225,
    companyId: 'synapseai',
    jobId: 'job-003',
    estimatedTime: '60 min',
    skills: ['SQL', 'Data Engineering', 'Analytical Thinking'],
    questLabel: 'The Data Labyrinth',
  },
  // Account Executive @ Momentum GTM
  {
    id: 'rt-ae-001',
    type: 'role',
    name: 'Discovery Call Simulation',
    description: 'Write the script + questions for a 30-minute discovery call with a fictional SaaS prospect.',
    why: 'Discovery quality is the top predictor of AE performance — this shows you can listen and qualify.',
    difficulty: 'medium',
    points: 275,
    companyId: 'momentumgtm',
    jobId: 'job-005',
    estimatedTime: '60 min',
    skills: ['Sales', 'Discovery', 'Qualification'],
    questLabel: 'The Scout\'s Parley',
  },
  {
    id: 'rt-ae-002',
    type: 'role',
    name: 'Deal Negotiation Scenario',
    description: 'Handle a provided objection-heavy negotiation transcript. Document your strategy and responses.',
    why: 'Shows how you handle pressure and think about value over price — critical for closing.',
    difficulty: 'hard',
    points: 450,
    companyId: 'momentumgtm',
    jobId: 'job-005',
    estimatedTime: '90 min',
    skills: ['Negotiation', 'Objection Handling', 'Closing'],
    questLabel: 'The Dragon\'s Bargain',
  },
];

export const allTasks: Task[] = [...generalTasks, ...companyTasks, ...roleTasks];

// ─────────────────────────────────────────────
// TEAM MEMBERS
// ─────────────────────────────────────────────
export const teamMembers: TeamMember[] = [
  {
    id: 'tm-001',
    firstName: 'Sarah',
    lastName: 'Chen',
    email: 'sarah.chen@nexacloud.com',
    team: 'Product Engineering',
    role: 'hiring_manager',
    companyId: 'nexacloud',
    avatar: 'SC',
    guideArchetype: 'The Keeper',
  },
  {
    id: 'tm-002',
    firstName: 'Marcus',
    lastName: 'Johnson',
    email: 'marcus.j@nexacloud.com',
    team: 'Talent Acquisition',
    role: 'recruiter',
    companyId: 'nexacloud',
    avatar: 'MJ',
    guideArchetype: 'The Herald',
  },
  {
    id: 'tm-003',
    firstName: 'Priya',
    lastName: 'Patel',
    email: 'priya.p@nexacloud.com',
    team: 'Product Engineering',
    role: 'team_member',
    companyId: 'nexacloud',
    avatar: 'PP',
    guideArchetype: 'The Scout',
  },
  {
    id: 'tm-004',
    firstName: 'David',
    lastName: 'Kim',
    email: 'david.kim@synapseai.com',
    team: 'Data & AI',
    role: 'hiring_manager',
    companyId: 'synapseai',
    avatar: 'DK',
    guideArchetype: 'The Keeper',
  },
  {
    id: 'tm-005',
    firstName: 'Rachel',
    lastName: 'Torres',
    email: 'rachel.t@momentumgtm.com',
    team: 'Go-To-Market',
    role: 'hiring_manager',
    companyId: 'momentumgtm',
    avatar: 'RT',
    guideArchetype: 'The Keeper',
  },
  {
    id: 'tm-006',
    firstName: 'James',
    lastName: 'Wright',
    email: 'james.w@nexacloud.com',
    team: 'Product Engineering',
    role: 'team_member',
    companyId: 'nexacloud',
    avatar: 'JW',
    guideArchetype: 'The Scout',
  },
  {
    id: 'tm-007',
    firstName: 'Elena',
    lastName: 'Vasquez',
    email: 'elena.v@synapseai.com',
    team: 'Data & AI',
    role: 'recruiter',
    companyId: 'synapseai',
    avatar: 'EV',
    guideArchetype: 'The Herald',
  },
  {
    id: 'tm-008',
    firstName: 'Tyler',
    lastName: 'Brooks',
    email: 'tyler.b@momentumgtm.com',
    team: 'Go-To-Market',
    role: 'recruiter',
    companyId: 'momentumgtm',
    avatar: 'TB',
    guideArchetype: 'The Herald',
  },
];

// ─────────────────────────────────────────────
// HIRING STAGES
// ─────────────────────────────────────────────
const defaultHiringStages = (
  requiredTaskId: string,
  suggestedGeneralIds: string[]
): HiringStage[] => [
  {
    id: 'stage-applied',
    name: 'Applied',
    storyName: 'Quest Begun',
    order: 1,
    passCriteria: ['Resume reviewed', 'Basic qualifications met'],
    requiredTaskIds: [requiredTaskId],
    suggestedTaskIds: suggestedGeneralIds,
    rubric: [],
  },
  {
    id: 'stage-screening',
    name: 'Phone Screen',
    storyName: 'First Encounter',
    order: 2,
    passCriteria: ['Communication clarity', 'Role understanding', 'Motivation alignment'],
    requiredTaskIds: [],
    suggestedTaskIds: ['gt-003', 'gt-004'],
    rubric: [
      { id: 'scr-r1', category: 'Communication', description: 'Clear and concise communication', maxScore: 5 },
      { id: 'scr-r2', category: 'Role Fit', description: 'Understanding of role and company', maxScore: 5 },
      { id: 'scr-r3', category: 'Motivation', description: 'Genuine interest and drive', maxScore: 5 },
    ],
  },
  {
    id: 'stage-interview',
    name: 'Interview',
    storyName: 'The Gauntlet',
    order: 3,
    passCriteria: ['Technical competency', 'Problem-solving approach', 'Culture fit'],
    requiredTaskIds: [],
    suggestedTaskIds: ['gt-005'],
    rubric: [
      { id: 'int-r1', category: 'Technical Skill', description: 'Depth and accuracy of technical knowledge', maxScore: 10 },
      { id: 'int-r2', category: 'Problem Solving', description: 'Structured approach to ambiguous problems', maxScore: 10 },
      { id: 'int-r3', category: 'Collaboration', description: 'Team dynamics and communication style', maxScore: 10 },
      { id: 'int-r4', category: 'Culture Alignment', description: 'Alignment with company values', maxScore: 10 },
    ],
  },
  {
    id: 'stage-final',
    name: 'Final Round',
    storyName: 'Summit Approach',
    order: 4,
    passCriteria: ['Strategic vision', 'Leadership potential', 'Executive presence'],
    requiredTaskIds: [],
    suggestedTaskIds: [],
    rubric: [
      { id: 'fin-r1', category: 'Vision', description: 'Long-term thinking and strategic framing', maxScore: 10 },
      { id: 'fin-r2', category: 'Leadership', description: 'Evidence of leading through influence', maxScore: 10 },
      { id: 'fin-r3', category: 'Overall Fit', description: 'Holistic evaluation across all signals', maxScore: 10 },
    ],
  },
];

// ─────────────────────────────────────────────
// JOBS
// ─────────────────────────────────────────────
export const jobs: Job[] = [
  {
    id: 'job-001',
    companyId: 'nexacloud',
    title: 'Frontend Engineer',
    team: 'Product Engineering',
    hiringManagerId: 'tm-001',
    teamMemberIds: ['tm-002', 'tm-003', 'tm-006'],
    overview: 'Join our Product Engineering team to build beautiful, performant UI experiences for 500K+ users.',
    responsibilities: [
      'Build and maintain high-quality React components in TypeScript',
      'Collaborate with designers on design system implementation',
      'Write unit and integration tests for all new features',
      'Participate in architecture decisions and code reviews',
      'Optimize for performance, accessibility, and scalability',
    ],
    qualifications: [
      '3+ years of React/TypeScript experience',
      'Strong understanding of web performance optimization',
      'Experience with component-driven design systems',
      'Proficiency in testing (Jest, React Testing Library)',
      'Excellent communication and collaboration skills',
    ],
    workEnvironment: 'Hybrid (3 days in-office). San Francisco, CA. Competitive comp + equity.',
    applicationProcess: 'Phone screen → Technical Interview → System Design → Final Panel',
    stages: defaultHiringStages('rt-fe-001', ['gt-001', 'gt-002']),
    postedDate: '2026-03-15',
    status: 'open',
    applicantIds: ['app-001', 'app-002', 'app-003'],
    requiredTaskIds: ['rt-fe-001'],
  },
  {
    id: 'job-002',
    companyId: 'nexacloud',
    title: 'Product Manager',
    team: 'Product Engineering',
    hiringManagerId: 'tm-001',
    teamMemberIds: ['tm-002', 'tm-006'],
    overview: 'Lead product strategy and roadmap for NexaCloud\'s core collaboration suite.',
    responsibilities: [
      'Define and prioritize the product roadmap with engineering and design',
      'Write clear PRDs and user stories',
      'Partner with data teams on success metrics and experimentation',
      'Represent the voice of the customer in every decision',
    ],
    qualifications: [
      '4+ years of product management at a B2B SaaS company',
      'Proven track record of shipping 0→1 features at scale',
      'Strong data-driven decision making skills',
      'Experience with agile methodologies',
    ],
    workEnvironment: 'Remote-first. Flexible hours. Unlimited PTO.',
    applicationProcess: 'Phone screen → Case Study → Product Interview → Executive Review',
    stages: defaultHiringStages('rt-pm-001', ['gt-001', 'gt-004']),
    postedDate: '2026-03-20',
    status: 'open',
    applicantIds: ['app-003'],
    requiredTaskIds: ['rt-pm-001'],
  },
  {
    id: 'job-003',
    companyId: 'synapseai',
    title: 'Data Scientist',
    team: 'Data & AI',
    hiringManagerId: 'tm-004',
    teamMemberIds: ['tm-007'],
    overview: 'Build predictive models and data pipelines powering Synapse AI\'s core recommendation engine.',
    responsibilities: [
      'Design and deploy ML models for personalization and prediction',
      'Partner with engineering to productionize models at scale',
      'Develop experiment frameworks and A/B testing infrastructure',
      'Communicate findings to non-technical stakeholders',
    ],
    qualifications: [
      '3+ years of data science / ML engineering experience',
      'Proficiency in Python, SQL, and ML frameworks (scikit-learn, PyTorch)',
      'Experience with experiment design and causal inference',
      'Strong statistical foundations',
    ],
    workEnvironment: 'Full remote. Async-first culture. Annual offsites.',
    applicationProcess: 'Screen → SQL/Python Take-home → Technical Panel → Culture Interview',
    stages: defaultHiringStages('rt-ds-001', ['gt-002', 'gt-005']),
    postedDate: '2026-02-28',
    status: 'open',
    applicantIds: ['app-001', 'app-002'],
    requiredTaskIds: ['rt-ds-001'],
  },
  {
    id: 'job-004',
    companyId: 'synapseai',
    title: 'ML Engineer',
    team: 'Data & AI',
    hiringManagerId: 'tm-004',
    teamMemberIds: ['tm-007'],
    overview: 'Own the training, deployment, and monitoring of Synapse AI\'s production ML infrastructure.',
    responsibilities: [
      'Build scalable model training pipelines using distributed compute',
      'Design model serving infrastructure (low-latency, high-throughput)',
      'Implement monitoring and alerting for model drift',
      'Collaborate with data scientists to productionize research models',
    ],
    qualifications: [
      '4+ years ML engineering experience',
      'Strong Python, Spark/Flink, and Kubernetes skills',
      'Experience with MLOps tooling (MLflow, Kubeflow, or similar)',
    ],
    workEnvironment: 'Hybrid. New York, NY.',
    applicationProcess: 'Screen → System Design → Coding → Culture',
    stages: defaultHiringStages('gt-005', ['gt-002']),
    postedDate: '2026-03-01',
    status: 'open',
    applicantIds: [],
    requiredTaskIds: ['gt-005'],
  },
  {
    id: 'job-005',
    companyId: 'momentumgtm',
    title: 'Account Executive',
    team: 'Go-To-Market',
    hiringManagerId: 'tm-005',
    teamMemberIds: ['tm-008'],
    overview: 'Own a full sales cycle for mid-market accounts and help Momentum GTM reach $50M ARR.',
    responsibilities: [
      'Run discovery, demo, and negotiation for 50-500 employee prospects',
      'Achieve quarterly quota of $1.2M ARR',
      'Collaborate with SDRs on outbound sequencing',
      'Contribute to sales playbook and process improvement',
    ],
    qualifications: [
      '3+ years full-cycle B2B SaaS sales experience',
      'Proven track record of meeting or exceeding quota',
      'Experience selling to RevOps, Sales, or Marketing buyers',
      'MEDDIC/MEDDPICC or similar methodology experience a plus',
    ],
    workEnvironment: 'In-office (Chicago, IL). High-energy, performance culture.',
    applicationProcess: 'Recruiter Screen → Sales Assessment → Panel Interview → Reference Check',
    stages: defaultHiringStages('rt-ae-001', ['gt-001', 'gt-003']),
    postedDate: '2026-03-10',
    status: 'open',
    applicantIds: ['app-002', 'app-003'],
    requiredTaskIds: ['rt-ae-001'],
  },
  {
    id: 'job-006',
    companyId: 'momentumgtm',
    title: 'Marketing Manager (Growth)',
    team: 'Go-To-Market',
    hiringManagerId: 'tm-005',
    teamMemberIds: ['tm-008'],
    overview: 'Own growth marketing channels and pipeline generation for Momentum GTM\'s mid-market segment.',
    responsibilities: [
      'Manage paid, organic, and partner channels to hit MQL targets',
      'Run and analyze multivariate experiments across the funnel',
      'Build automated nurture sequences in HubSpot',
      'Report weekly to the CMO on channel ROI',
    ],
    qualifications: [
      '3+ years B2B demand generation or growth marketing experience',
      'Proficient in HubSpot, Google Analytics, and SQL (basic)',
      'Proven ability to hit pipeline targets',
    ],
    workEnvironment: 'Remote. Chicago-area preferred.',
    applicationProcess: 'Screen → Marketing Assessment → Case Study → Final Panel',
    stages: defaultHiringStages('ct-momentumgtm-001', ['gt-001', 'gt-004']),
    postedDate: '2026-04-01',
    status: 'draft',
    applicantIds: [],
    requiredTaskIds: ['ct-momentumgtm-001'],
  },
];

// ─────────────────────────────────────────────
// APPLICANTS (Seed Data — 3)
// ─────────────────────────────────────────────
export const applicants: Applicant[] = [
  // App 1: Alex Chen — Frontend Eng @ NexaCloud (Interview stage) + Data Sci @ SynapseAI (Applied)
  {
    id: 'app-001',
    firstName: 'Alex',
    lastName: 'Chen',
    email: 'alex.chen@gmail.com',
    jobGoal: 'Senior Frontend Engineer at a high-growth SaaS company',
    level: 7,
    xp: 3650,
    xpToNextLevel: 4200,
    skills: ['React', 'TypeScript', 'GraphQL', 'CSS', 'Testing', 'Node.js'],
    location: 'San Francisco, CA',
    experience: 5,
    resumeSnippet:
      'Senior-level frontend engineer with 5 years experience at Series A–C startups. Led a design system rewrite reducing UI inconsistencies by 78%. Strong React/TypeScript fundamentals with a design sensibility.',
    avatar: 'AC',
    completedTasks: [
      { taskId: 'gt-001', dateCompleted: '2026-03-05', pointsEarned: 75 },
      { taskId: 'gt-002', dateCompleted: '2026-03-07', pointsEarned: 175 },
      { taskId: 'gt-003', dateCompleted: '2026-03-09', pointsEarned: 200 },
      { taskId: 'gt-004', dateCompleted: '2026-03-10', pointsEarned: 100 },
      { taskId: 'ct-nexacloud-001', dateCompleted: '2026-03-18', pointsEarned: 225 },
      { taskId: 'ct-nexacloud-002', dateCompleted: '2026-03-19', pointsEarned: 80 },
      { taskId: 'rt-fe-001', dateCompleted: '2026-03-20', pointsEarned: 450 },
      { taskId: 'rt-fe-002', dateCompleted: '2026-03-21', pointsEarned: 200 },
    ],
    applications: [
      {
        id: 'appl-001',
        jobId: 'job-001',
        companyId: 'nexacloud',
        stage: 'interview',
        dateApplied: '2026-03-16',
        dateScreened: '2026-03-22',
        dateInterviewed: '2026-04-01',
        completedTasks: [
          { taskId: 'rt-fe-001', dateCompleted: '2026-03-20', pointsEarned: 450 },
          { taskId: 'rt-fe-002', dateCompleted: '2026-03-21', pointsEarned: 200 },
          { taskId: 'ct-nexacloud-001', dateCompleted: '2026-03-18', pointsEarned: 225 },
        ],
        assignedInterviewerIds: ['tm-001', 'tm-003'],
        feedbackForApplicant:
          'Great technical depth on the React challenge. Your component API design was particularly impressive. Focus on articulating your decision-making process more clearly in the next round.',
        source: 'Company Website',
      },
      {
        id: 'appl-002',
        jobId: 'job-003',
        companyId: 'synapseai',
        stage: 'applied',
        dateApplied: '2026-04-02',
        completedTasks: [],
        assignedInterviewerIds: [],
        source: 'LinkedIn',
      },
    ],
  },
  // App 2: Jordan Lee — AE @ Momentum (Offered)
  {
    id: 'app-002',
    firstName: 'Jordan',
    lastName: 'Lee',
    email: 'jordan.lee@yahoo.com',
    jobGoal: 'Enterprise Account Executive at a category-defining GTM company',
    level: 5,
    xp: 2100,
    xpToNextLevel: 2500,
    skills: ['B2B Sales', 'Negotiation', 'MEDDIC', 'Salesforce', 'Outbound'],
    location: 'Chicago, IL',
    experience: 4,
    resumeSnippet:
      '4 years of B2B SaaS sales. Consistent quota attainment (127% avg). Expertise in mid-market RevOps and Sales tooling. Top performer at 2 Series B companies.',
    avatar: 'JL',
    completedTasks: [
      { taskId: 'gt-001', dateCompleted: '2026-02-10', pointsEarned: 75 },
      { taskId: 'gt-003', dateCompleted: '2026-02-12', pointsEarned: 200 },
      { taskId: 'ct-momentumgtm-001', dateCompleted: '2026-03-12', pointsEarned: 250 },
      { taskId: 'rt-ae-001', dateCompleted: '2026-03-14', pointsEarned: 275 },
      { taskId: 'rt-ae-002', dateCompleted: '2026-03-20', pointsEarned: 450 },
    ],
    applications: [
      {
        id: 'appl-003',
        jobId: 'job-005',
        companyId: 'momentumgtm',
        stage: 'offered',
        dateApplied: '2026-03-11',
        dateScreened: '2026-03-15',
        dateInterviewed: '2026-03-25',
        dateOffered: '2026-04-08',
        completedTasks: [
          { taskId: 'ct-momentumgtm-001', dateCompleted: '2026-03-12', pointsEarned: 250 },
          { taskId: 'rt-ae-001', dateCompleted: '2026-03-14', pointsEarned: 275 },
          { taskId: 'rt-ae-002', dateCompleted: '2026-03-20', pointsEarned: 450 },
        ],
        assignedInterviewerIds: ['tm-005', 'tm-008'],
        feedbackForApplicant:
          'Outstanding discovery call simulation. Your deal negotiation showed real maturity. We\'re excited to move forward with an offer!',
        source: 'Referral',
      },
      {
        id: 'appl-004',
        jobId: 'job-001',
        companyId: 'nexacloud',
        stage: 'rejected',
        dateApplied: '2026-02-01',
        dateRejected: '2026-02-10',
        completedTasks: [],
        assignedInterviewerIds: [],
        feedbackForApplicant: 'Skills profile didn\'t match the frontend engineering requirements.',
        source: 'Indeed',
      },
    ],
  },
  // App 3: Sam Rivera — PM @ NexaCloud (Final Round)
  {
    id: 'app-003',
    firstName: 'Sam',
    lastName: 'Rivera',
    email: 'sam.rivera@outlook.com',
    jobGoal: 'Head of Product at a mission-driven B2B SaaS company',
    level: 10,
    xp: 6800,
    xpToNextLevel: 7500,
    skills: ['Product Strategy', 'Roadmapping', 'A/B Testing', 'SQL', 'User Research', 'Agile'],
    location: 'New York, NY',
    experience: 8,
    resumeSnippet:
      '8 years of product leadership from Series A to post-IPO. Launched 3 products crossing $10M ARR. Deep expertise in B2B collaboration and workflow tools.',
    avatar: 'SR',
    completedTasks: [
      { taskId: 'gt-001', dateCompleted: '2026-01-15', pointsEarned: 75 },
      { taskId: 'gt-002', dateCompleted: '2026-01-18', pointsEarned: 175 },
      { taskId: 'gt-003', dateCompleted: '2026-01-20', pointsEarned: 200 },
      { taskId: 'gt-004', dateCompleted: '2026-01-22', pointsEarned: 100 },
      { taskId: 'gt-005', dateCompleted: '2026-01-28', pointsEarned: 375 },
      { taskId: 'ct-nexacloud-001', dateCompleted: '2026-03-22', pointsEarned: 225 },
      { taskId: 'ct-nexacloud-002', dateCompleted: '2026-03-23', pointsEarned: 80 },
      { taskId: 'ct-nexacloud-003', dateCompleted: '2026-03-25', pointsEarned: 400 },
      { taskId: 'rt-pm-001', dateCompleted: '2026-03-26', pointsEarned: 500 },
    ],
    applications: [
      {
        id: 'appl-005',
        jobId: 'job-002',
        companyId: 'nexacloud',
        stage: 'final_round',
        dateApplied: '2026-03-21',
        dateScreened: '2026-03-26',
        dateInterviewed: '2026-04-03',
        completedTasks: [
          { taskId: 'ct-nexacloud-003', dateCompleted: '2026-03-25', pointsEarned: 400 },
          { taskId: 'rt-pm-001', dateCompleted: '2026-03-26', pointsEarned: 500 },
        ],
        assignedInterviewerIds: ['tm-001', 'tm-002', 'tm-006'],
        feedbackForApplicant:
          'Exceptional PRD. The feature framing and success metrics were production-ready. Your sprint planning simulation showed real-world PM maturity. Team is excited.',
        source: 'LinkedIn',
      },
      {
        id: 'appl-006',
        jobId: 'job-005',
        companyId: 'momentumgtm',
        stage: 'screening',
        dateApplied: '2026-04-01',
        dateScreened: '2026-04-10',
        completedTasks: [],
        assignedInterviewerIds: ['tm-008'],
        source: 'Referral',
      },
    ],
  },
];

// ─────────────────────────────────────────────
// SCORE CARDS
// ─────────────────────────────────────────────
export const scorecards: ScoreCard[] = [
  {
    id: 'sc-001',
    applicantId: 'app-001',
    jobId: 'job-001',
    stageId: 'stage-screening',
    interviewerId: 'tm-002',
    scores: [
      { rubricItemId: 'scr-r1', score: 5, notes: 'Clear, confident, and structured communication.' },
      { rubricItemId: 'scr-r2', score: 4, notes: 'Strong understanding of role. Could deepen knowledge of NexaCloud\'s stack.' },
      { rubricItemId: 'scr-r3', score: 5, notes: 'Genuine passion for frontend craft. Referenced personal projects unprompted.' },
    ],
    feedbackForRecruiter: 'Strong advance. Alex is clearly above the bar for this role. Book the technical round ASAP.',
    feedbackForApplicant: 'Excellent screen. Your communication was crisp and your motivation came through clearly. Next: technical interview.',
    recommendation: 'advance',
    completedAt: '2026-03-22',
  },
  {
    id: 'sc-002',
    applicantId: 'app-003',
    jobId: 'job-002',
    stageId: 'stage-interview',
    interviewerId: 'tm-001',
    scores: [
      { rubricItemId: 'int-r1', score: 10, notes: 'Exceptional product instincts. Every answer was backed by data and evidence.' },
      { rubricItemId: 'int-r2', score: 9, notes: 'Structured problem-solving with minimal hand-holding needed.' },
      { rubricItemId: 'int-r3', score: 9, notes: 'Collaborative mindset. Asked great clarifying questions.' },
      { rubricItemId: 'int-r4', score: 8, notes: 'Values alignment is strong. Slightly different pacing preference noted.' },
    ],
    feedbackForRecruiter: 'Best PM candidate we\'ve seen in 6 months. Push to final round immediately.',
    feedbackForApplicant: 'Outstanding interview, Sam. Your product thinking is exceptional. See you in the final round.',
    recommendation: 'advance',
    completedAt: '2026-04-03',
  },
];

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────
export function getTaskById(id: string): Task | undefined {
  return allTasks.find((t) => t.id === id);
}

export function getJobById(id: string): Job | undefined {
  return jobs.find((j) => j.id === id);
}

export function getCompanyById(id: string): Company | undefined {
  return companies.find((c) => c.id === id);
}

export function getApplicantById(id: string): Applicant | undefined {
  return applicants.find((a) => a.id === id);
}

export function getTeamMemberById(id: string): TeamMember | undefined {
  return teamMembers.find((m) => m.id === id);
}

export function getXPLevelThreshold(level: number): number {
  const thresholds = [0, 300, 700, 1200, 1800, 2500, 3300, 4200, 5200, 6300, 7500, 8800, 10200, 11700, 13300, 15000];
  return thresholds[level] ?? thresholds[thresholds.length - 1];
}

export const stageOrder: ApplicationStage[] = [
  'applied', 'screening', 'interview', 'final_round', 'offered', 'hired', 'rejected',
];

export const stageLabels: Record<ApplicationStage, string> = {
  applied: 'Applied',
  screening: 'Phone Screen',
  interview: 'Interview',
  final_round: 'Final Round',
  offered: 'Offered',
  hired: 'Hired',
  rejected: 'Rejected',
};

export const stageStoryLabels: Record<ApplicationStage, string> = {
  applied: 'Quest Begun',
  screening: 'First Encounter',
  interview: 'The Gauntlet',
  final_round: 'Summit Approach',
  offered: 'Victory Awaits',
  hired: 'Legend Born',
  rejected: 'Path Diverted',
};

export function getDifficultyConfig(difficulty: Difficulty) {
  return {
    easy: { label: 'Easy', color: '#10b981', bg: 'rgba(16,185,129,0.1)', icon: '⚡' },
    medium: { label: 'Medium', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', icon: '🔥' },
    hard: { label: 'Hard', color: '#ef4444', bg: 'rgba(239,68,68,0.1)', icon: '💎' },
  }[difficulty];
}

export function getTotalXP(completedTasks: CompletedTask[]): number {
  return completedTasks.reduce((sum, ct) => sum + ct.pointsEarned, 0);
}

// Analytics helpers
export const hiringMetrics = {
  timeToFill: {
    'job-001': 28,
    'job-003': 42,
    'job-005': 29,
  },
  timeToHire: {
    'app-002': 29,
  },
  sourceOfHire: [
    { source: 'LinkedIn', count: 2, percentage: 40 },
    { source: 'Referral', count: 2, percentage: 40 },
    { source: 'Company Website', count: 1, percentage: 20 },
  ],
  offerAcceptanceRate: 100,
  avgTasksCompleted: 5.3,
  avgXPEarned: 1650,
};
