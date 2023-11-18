import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { getSession } from '../../getSession';
import { TimerRecord } from '@prisma/client';
import { kv } from '@vercel/kv';

type Response = {
  data: TimerRecord[];
  hasNextPage: boolean;
};
export const GET = async (req: Request) => {
  const session = await getSession();
  if (!session?.user) {
    throw new Error('authorization required');
  }

  const query = new URL(req.url).searchParams;

  const cursor = query.get('cursor') ?? undefined,
    limit = Number(query.get('limit') ?? 50),
    event = query.get('event') ?? '3x3x3';

  const posts = await prisma.timerRecord.findMany({
    take: limit + 1,
    ...(cursor && { cursor: { id: cursor }, skip: 1 }),
    where: { userId: session.user.sub, event },
    orderBy: { createdAt: 'desc' },
  });
  const hasNextPage = posts.length === limit + 1;
  if (hasNextPage) {
    // hasNextPage の判定用に1つ多く取ってきているぶんを消す
    posts.pop();
  }
  if (typeof cursor === 'undefined') {
    kv.set(`${session.user}--latest-record`, posts[0]);
  }
  return NextResponse.json({ data: posts, hasNextPage } satisfies Response);
};
