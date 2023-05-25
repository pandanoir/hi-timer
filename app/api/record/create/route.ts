import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { getSession } from '../../getSession';

export const POST = async (req: Request) => {
  const session = await getSession();
  if (!session?.user) {
    throw new Error('authorization required');
  }

  const body = JSON.parse(
    await new Promise<string>((resolve) => {
      let text = '';
      const decoder = new TextDecoder();
      const reader = req.body?.getReader();

      reader?.read().then(function readChunk({ done, value }) {
        if (done) {
          resolve(text);
          return;
        }

        text += decoder.decode(value);
        reader?.read().then(readChunk);
      });
    })
  );

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
