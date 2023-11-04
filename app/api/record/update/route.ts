import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { getSession } from '../../getSession';
import { readBody } from '../../readBody';
import {
  $boolean,
  $intersection,
  $number,
  $object,
  $string,
  $undefined,
  $union,
  Infer,
} from 'lizod';

const validate = $intersection([
  $object(
    {
      time: $union([$number, $undefined]),
      penalty: $union([$boolean, $undefined]),
      dnf: $union([$boolean, $undefined]),
      createdAt: $union([$string, $undefined]),
      scramble: $union([$string, $undefined]),
      event: $union([$string, $undefined]),
    },
    false,
  ),
  $union([
    $object({ id: $string }, false),
    $object(
      { compositeKey: $object({ time: $number, scramble: $string }) },
      false,
    ),
  ]),
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

  const targetRecord = await prisma.timerRecord.findUnique({
    where:
      'id' in body ? { id: body.id } : { record_identifier: body.compositeKey },
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
