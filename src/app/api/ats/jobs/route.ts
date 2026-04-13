import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import type { Document, WithId } from 'mongodb';
import { getDb } from '@/lib/mongodb';
import { ATS_COLLECTIONS, docToJob, ensureAtsSeeded } from '@/lib/ats/mongo';
import type { Job } from '@/data/ats/mockData';

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = (await req.json()) as Job;
    if (!body?.id || !body.companyId || !body.title) {
      return NextResponse.json({ error: 'Invalid job payload' }, { status: 400 });
    }

    const db = await getDb();
    const jobsCol = db.collection(ATS_COLLECTIONS.jobs);
    const applicantsCol = db.collection(ATS_COLLECTIONS.applicants);
    const scoreCol = db.collection(ATS_COLLECTIONS.scorecards);
    await ensureAtsSeeded(jobsCol, applicantsCol, scoreCol);

    await jobsCol.replaceOne({ _id: body.id }, { ...body, _id: body.id }, { upsert: true });

    const doc = await jobsCol.findOne({ _id: body.id });
    if (!doc) {
      return NextResponse.json({ error: 'Job not persisted' }, { status: 500 });
    }
    return NextResponse.json({ job: docToJob(doc as WithId<Document>) });
  } catch (err) {
    console.error(err);
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
