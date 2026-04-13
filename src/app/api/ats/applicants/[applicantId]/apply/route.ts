import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import type { Document, WithId } from 'mongodb';
import { getDb } from '@/lib/mongodb';
import { ATS_COLLECTIONS, docToApplicant, docToJob, ensureAtsSeeded } from '@/lib/ats/mongo';
import type { Application, Applicant, Job } from '@/data/ats/mockData';

export async function POST(
  req: Request,
  ctx: { params: Promise<{ applicantId: string }> },
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { applicantId } = await ctx.params;
    const body = (await req.json()) as { jobId?: string; companyId?: string; source?: string };
    if (!body.jobId || !body.companyId) {
      return NextResponse.json({ error: 'jobId and companyId required' }, { status: 400 });
    }

    const db = await getDb();
    const jobsCol = db.collection(ATS_COLLECTIONS.jobs);
    const applicantsCol = db.collection(ATS_COLLECTIONS.applicants);
    const scoreCol = db.collection(ATS_COLLECTIONS.scorecards);
    await ensureAtsSeeded(jobsCol, applicantsCol, scoreCol);

    const rawApp = await applicantsCol.findOne({ _id: applicantId });
    const rawJob = await jobsCol.findOne({ _id: body.jobId });
    if (!rawApp || !rawJob) {
      return NextResponse.json({ error: 'Applicant or job not found' }, { status: 404 });
    }

    const applicant = docToApplicant(rawApp as WithId<Document>);
    const job = docToJob(rawJob as WithId<Document>);

    if (applicant.applications.some((a) => a.jobId === body.jobId)) {
      return NextResponse.json({ applicant, job });
    }

    const newApp: Application = {
      id: `appl-new-${Date.now()}`,
      jobId: body.jobId,
      companyId: body.companyId,
      stage: 'applied',
      dateApplied: new Date().toISOString().split('T')[0],
      completedTasks: [],
      assignedInterviewerIds: [],
      source: body.source ?? 'Direct',
    };

    const updatedApplicant: Applicant = {
      ...applicant,
      applications: [...applicant.applications, newApp],
    };

    const updatedJob: Job =
      job.applicantIds.includes(applicantId)
        ? job
        : { ...job, applicantIds: [...job.applicantIds, applicantId] };

    await applicantsCol.replaceOne({ _id: applicantId }, { ...updatedApplicant, _id: applicantId });
    await jobsCol.replaceOne({ _id: job.id }, { ...updatedJob, _id: job.id });

    const [nextApp, nextJob] = await Promise.all([
      applicantsCol.findOne({ _id: applicantId }),
      jobsCol.findOne({ _id: body.jobId }),
    ]);

    return NextResponse.json({
      applicant: docToApplicant(nextApp as WithId<Document>),
      job: docToJob(nextJob as WithId<Document>),
    });
  } catch (err) {
    console.error(err);
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
