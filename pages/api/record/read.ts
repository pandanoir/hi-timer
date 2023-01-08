import { getSession, withApiAuthRequired } from '@auth0/nextjs-auth0';
import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';

const normalizeQuery = (query: string | string[] | undefined) =>
  Array.isArray(query) ? query[0] : query;
export default withApiAuthRequired(
  async (req: NextApiRequest, res: NextApiResponse) => {
    const session = await getSession(req, res);
    if (!session) {
      throw new Error('authorization required');
    }

    const cursor = normalizeQuery(req.query.cursor);
    const limit = Number(normalizeQuery(req.query.limit) ?? 50);
    const event = normalizeQuery(req.query.event) ?? '3x3x3';

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

    res.json({ data: posts, hasNextPage });
  }
);
