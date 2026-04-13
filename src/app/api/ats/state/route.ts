import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { loadAtsState } from '@/lib/ats/mongo';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const state = await loadAtsState();
    return NextResponse.json(state);
  } catch (err) {
    console.error(err);
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
