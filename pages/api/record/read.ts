import { getSession, withApiAuthRequired } from '@auth0/nextjs-auth0';
import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';

export default withApiAuthRequired(
  async (req: NextApiRequest, res: NextApiResponse) => {
    const session = await getSession(req, res);
    if (!session) {
      throw new Error('authorization required');
    }

    const cursor = Array.isArray(req.query.cursor)
      ? req.query.cursor[0]
      : req.query.cursor;
    const limit = Array.isArray(req.query.limit)
      ? req.query.limit[0]
      : req.query.limit;

    const posts = await prisma.timerRecord.findMany({
      take: Number(limit ?? 50),
      ...(cursor && { cursor: { id: cursor }, skip: 1 }),
      where: { userId: session.user.sub },
      orderBy: { createdAt: 'desc' },
    });
    res.json(posts);
  }
);
