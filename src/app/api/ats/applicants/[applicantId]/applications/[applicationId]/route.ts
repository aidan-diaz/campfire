import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import type { Document, WithId } from 'mongodb';
import { getDb } from '@/lib/mongodb';
import { ATS_COLLECTIONS, docToApplicant, ensureAtsSeeded } from '@/lib/ats/mongo';
import type { ApplicationStage, Applicant } from '@/data/ats/mockData';

const STAGES: ApplicationStage[] = [
  'applied',
  'screening',
  'interview',
  'final_round',
  'offered',
  'hired',
  'rejected',
];

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ applicantId: string; applicationId: string }> },
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { applicantId, applicationId } = await ctx.params;
    const body = (await req.json()) as {
      stage?: ApplicationStage;
      feedbackForApplicant?: string;
    };

    if (body.stage !== undefined && !STAGES.includes(body.stage)) {
      return NextResponse.json({ error: 'Invalid stage' }, { status: 400 });
    }
    if (body.stage === undefined && body.feedbackForApplicant === undefined) {
      return NextResponse.json({ error: 'No updates' }, { status: 400 });
    }

    const db = await getDb();
    const jobsCol = db.collection(ATS_COLLECTIONS.jobs);
    const applicantsCol = db.collection(ATS_COLLECTIONS.applicants);
    const scoreCol = db.collection(ATS_COLLECTIONS.scorecards);
    await ensureAtsSeeded(jobsCol, applicantsCol, scoreCol);

    const raw = await applicantsCol.findOne({ _id: applicantId });
    if (!raw) {
      return NextResponse.json({ error: 'Applicant not found' }, { status: 404 });
    }

    const applicant = docToApplicant(raw as WithId<Document>);
    const appIdx = applicant.applications.findIndex((a) => a.id === applicationId);
    if (appIdx < 0) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    const nextApps = applicant.applications.map((a) => {
      if (a.id !== applicationId) return a;
      return {
        ...a,
        ...(body.stage !== undefined ? { stage: body.stage } : {}),
        ...(body.feedbackForApplicant !== undefined
          ? { feedbackForApplicant: body.feedbackForApplicant }
          : {}),
      };
    });

    const updated: Applicant = { ...applicant, applications: nextApps };
    await applicantsCol.replaceOne({ _id: applicantId }, { ...updated, _id: applicantId });

    const after = await applicantsCol.findOne({ _id: applicantId });
    return NextResponse.json({ applicant: docToApplicant(after as WithId<Document>) });
  } catch (err) {
    console.error(err);
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
