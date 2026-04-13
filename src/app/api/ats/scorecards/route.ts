import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import type { Document, WithId } from 'mongodb';
import { getDb } from '@/lib/mongodb';
import { ATS_COLLECTIONS, docToScorecard, ensureAtsSeeded } from '@/lib/ats/mongo';
import type { ScoreCard } from '@/data/ats/mockData';

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = (await req.json()) as ScoreCard;
    if (!body?.id || !body.applicantId || !body.jobId) {
      return NextResponse.json({ error: 'Invalid scorecard' }, { status: 400 });
    }

    const db = await getDb();
    const jobsCol = db.collection(ATS_COLLECTIONS.jobs);
    const applicantsCol = db.collection(ATS_COLLECTIONS.applicants);
    const scoreCol = db.collection(ATS_COLLECTIONS.scorecards);
    await ensureAtsSeeded(jobsCol, applicantsCol, scoreCol);

    await scoreCol.replaceOne({ _id: body.id }, { ...body, _id: body.id }, { upsert: true });

    const doc = await scoreCol.findOne({ _id: body.id });
    if (!doc) {
      return NextResponse.json({ error: 'Scorecard not persisted' }, { status: 500 });
    }
    return NextResponse.json({ scorecard: docToScorecard(doc as WithId<Document>) });
  } catch (err) {
    console.error(err);
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
