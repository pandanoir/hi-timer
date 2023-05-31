import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { getSession } from '../../getSession';
import { TimerRecord } from '@prisma/client';

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

  return NextResponse.json({ data: posts, hasNextPage } satisfies Response);
};
export const fetchRecordInServerSide = () =>
  GET(new Request('http://localhost/api/record/read?event=3x3x3&limit=100'))
    .then((res) => res.json() as Promise<Response>)
    .catch(() => undefined);
