import { NextResponse } from 'next/server';
import { TimerRecord } from '@prisma/client';
import { kv } from '@vercel/kv';
import { getSession } from '../../getSession';

type Response = {
  data: TimerRecord | null;
};
export const GET = async () => {
  const session = await getSession();
  if (!session?.user) {
    throw new Error('authorization required');
  }
  return NextResponse.json({
    data: await kv.get<TimerRecord>(`${session.user}--latest-record`),
  } satisfies Response);
};
