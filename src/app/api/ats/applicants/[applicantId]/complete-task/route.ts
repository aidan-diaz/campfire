import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import type { Document, WithId } from 'mongodb';
import { getDb } from '@/lib/mongodb';
import {
  ATS_COLLECTIONS,
  computeLevel,
  docToApplicant,
  ensureAtsSeeded,
} from '@/lib/ats/mongo';
import type { Applicant, CompletedTask } from '@/data/ats/mockData';

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
    const body = (await req.json()) as { taskId?: string; points?: number; jobId?: string };
    if (!body.taskId || typeof body.points !== 'number') {
      return NextResponse.json({ error: 'taskId and points required' }, { status: 400 });
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
    const alreadyDone = applicant.completedTasks.some((ct) => ct.taskId === body.taskId);
    if (alreadyDone) {
      return NextResponse.json({ applicant });
    }

    const dateCompleted = new Date().toISOString().split('T')[0];
    const newCompleted: CompletedTask = {
      taskId: body.taskId,
      dateCompleted,
      pointsEarned: body.points,
    };
    const newXP = applicant.xp + body.points;
    const newLevel = computeLevel(newXP);

    const updated: Applicant = {
      ...applicant,
      completedTasks: [...applicant.completedTasks, newCompleted],
      xp: newXP,
      level: newLevel,
    };

    await applicantsCol.replaceOne({ _id: applicantId }, { ...updated, _id: applicantId });

    const after = await applicantsCol.findOne({ _id: applicantId });
    return NextResponse.json({ applicant: docToApplicant(after as WithId<Document>) });
  } catch (err) {
    console.error(err);
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
