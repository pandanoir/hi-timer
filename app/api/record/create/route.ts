import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { getSession } from '../../getSession';
import { readBody } from '../../readBody';
import { $boolean, $number, $object, $string, Infer } from 'lizod';

const validate = $object({
  time: $number,
  penalty: $boolean,
  dnf: $boolean,
  scramble: $string,
  event: $string,
  createdAt: $number,
});
export type RequestBody = Infer<typeof validate>;

export const POST = async (req: Request) => {
  const session = await getSession();
  if (!session?.user) {
    throw new Error('authorization required');
  }
  const body = JSON.parse(await readBody(req));
  if (!validate(body)) {
    throw new Error('request body is invalid');
  }

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
