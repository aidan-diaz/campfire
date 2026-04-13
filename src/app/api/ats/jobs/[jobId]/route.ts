import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import type { Document, WithId } from 'mongodb';
import { getDb } from '@/lib/mongodb';
import { ATS_COLLECTIONS, docToJob, ensureAtsSeeded } from '@/lib/ats/mongo';
import type { Job } from '@/data/ats/mockData';

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ jobId: string }> },
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { jobId } = await ctx.params;
    const patch = (await req.json()) as Partial<Job>;

    const db = await getDb();
    const jobsCol = db.collection(ATS_COLLECTIONS.jobs);
    const applicantsCol = db.collection(ATS_COLLECTIONS.applicants);
    const scoreCol = db.collection(ATS_COLLECTIONS.scorecards);
    await ensureAtsSeeded(jobsCol, applicantsCol, scoreCol);

    const raw = await jobsCol.findOne({ _id: jobId });
    if (!raw) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    const existing = docToJob(raw as WithId<Document>);
    const merged: Job = { ...existing, ...patch, id: existing.id };
    await jobsCol.replaceOne({ _id: jobId }, { ...merged, _id: jobId });

    const doc = await jobsCol.findOne({ _id: jobId });
    if (!doc) {
      return NextResponse.json({ error: 'Job not updated' }, { status: 500 });
    }
    return NextResponse.json({ job: docToJob(doc as WithId<Document>) });
  } catch (err) {
    console.error(err);
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
