import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { getSession } from '../../getSession';
import { readBody } from '../../readBody';
import { $object, $string, Infer } from 'lizod';

const validate = $object({ id: $string });
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
  if (
    (
      await prisma.timerRecord.findFirst({
        where: { id: body.id },
      })
    )?.userId !== session.user.sub
  ) {
    throw new Error('permission denied');
  }
  const post = await prisma.timerRecord.delete({
    where: { id: body.id },
  });
  return NextResponse.json(post);
};
