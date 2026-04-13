import type { Collection, Document, WithId } from 'mongodb';
import { getDb } from '@/lib/mongodb';
import {
  jobs as seedJobs,
  applicants as seedApplicants,
  scorecards as seedScorecards,
} from '@/data/ats/mockData';
import type { Applicant, Job, ScoreCard } from '@/data/ats/mockData';

export const ATS_COLLECTIONS = {
  jobs: 'ats_jobs',
  applicants: 'ats_applicants',
  scorecards: 'ats_scorecards',
} as const;

function stripMongoId(doc: WithId<Document>): Record<string, unknown> {
  const { _id, ...rest } = doc as Record<string, unknown> & { _id: unknown };
  const id = typeof rest.id === 'string' ? rest.id : String(_id);
  return { ...rest, id };
}

export function docToJob(doc: WithId<Document>): Job {
  return stripMongoId(doc) as unknown as Job;
}

export function docToApplicant(doc: WithId<Document>): Applicant {
  return stripMongoId(doc) as unknown as Applicant;
}

export function docToScorecard(doc: WithId<Document>): ScoreCard {
  return stripMongoId(doc) as unknown as ScoreCard;
}

export async function ensureAtsSeeded(jobsCol: Collection<Document>, applicantsCol: Collection<Document>, scoreCol: Collection<Document>) {
  const n = await jobsCol.countDocuments();
  if (n > 0) return;
  if (seedJobs.length) {
    await jobsCol.insertMany(
      seedJobs.map((j) => ({ ...j, _id: j.id })) as unknown as Document[],
    );
  }
  if (seedApplicants.length) {
    await applicantsCol.insertMany(
      seedApplicants.map((a) => ({ ...a, _id: a.id })) as unknown as Document[],
    );
  }
  if (seedScorecards.length) {
    await scoreCol.insertMany(
      seedScorecards.map((s) => ({ ...s, _id: s.id })) as unknown as Document[],
    );
  }
}

export async function loadAtsState(): Promise<{ jobs: Job[]; applicants: Applicant[]; scorecards: ScoreCard[] }> {
  const db = await getDb();
  const jobsCol = db.collection(ATS_COLLECTIONS.jobs);
  const applicantsCol = db.collection(ATS_COLLECTIONS.applicants);
  const scoreCol = db.collection(ATS_COLLECTIONS.scorecards);

  await ensureAtsSeeded(jobsCol, applicantsCol, scoreCol);

  const [jobDocs, applicantDocs, scoreDocs] = await Promise.all([
    jobsCol.find({}).toArray(),
    applicantsCol.find({}).toArray(),
    scoreCol.find({}).toArray(),
  ]);

  return {
    jobs: jobDocs.map((d: WithId<Document>) => docToJob(d)),
    applicants: applicantDocs.map((d: WithId<Document>) => docToApplicant(d)),
    scorecards: scoreDocs.map((d: WithId<Document>) => docToScorecard(d)),
  };
}

export function computeLevel(xp: number): number {
  const thresholds = [0, 300, 700, 1200, 1800, 2500, 3300, 4200, 5200, 6300, 7500, 8800, 10200, 11700, 13300, 15000];
  let level = 1;
  for (let i = 0; i < thresholds.length; i++) {
    if (xp >= thresholds[i]) level = i + 1;
    else break;
  }
  return level;
}
