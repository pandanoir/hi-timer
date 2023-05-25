import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { getSession } from '../../getSession';
import { readBody } from '../../readBody';

export const POST = async (req: Request) => {
  const session = await getSession();
  if (!session?.user) {
    throw new Error('authorization required');
  }
  const body = JSON.parse(await readBody(req));
  const post = await prisma.timerRecord.create({
    data: {
      time: body.time,
      penalty: body.penalty,
      dnf: body.dnf,
      scramble: body.scramble,
      event: body.event,
      createdAt: new Date(body.createdAt),
      userId: session.user.sub,
    },
  });
  return NextResponse.json(post);
};
