import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { getSession } from '../../getSession';
import { readBody } from '../../readBody';
import {
  $boolean,
  $number,
  $object,
  $string,
  $undefined,
  $union,
  Infer,
} from 'lizod';

const record = {
  time: $union([$number, $undefined]),
  penalty: $union([$boolean, $undefined]),
  dnf: $union([$boolean, $undefined]),
  createdAt: $union([$string, $undefined]),
  scramble: $union([$string, $undefined]),
  event: $union([$string, $undefined]),
};
const validate = $union([
  $object({
    ...record,
    id: $string,
  }),
  $object({
    ...record,
    compositeKey: $object({ time: $number, scramble: $string }),
  }),
]);
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
  const targetRecord = await prisma.timerRecord.findFirst({
    where:
      'id' in body
        ? { id: body.id }
        : { time: body.time, scramble: body.scramble },
  });
  if (!targetRecord) {
    throw new Error(`record doesn't exist`);
  }
  if (targetRecord.userId !== session.user.sub) {
    throw new Error('permission denied');
  }
  const post = await prisma.timerRecord.update({
    where:
      'id' in body ? { id: body.id } : { record_identifier: body.compositeKey },
    data: {
      time: body.time,
      penalty: body.penalty,
      dnf: body.dnf,
    },
  });
  return NextResponse.json(post);
};
