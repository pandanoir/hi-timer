import { getSession, withApiAuthRequired } from '@auth0/nextjs-auth0';
import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';

export default withApiAuthRequired(
  async (req: NextApiRequest, res: NextApiResponse) => {
    const session = await getSession(req, res);
    if (!session) {
      throw new Error('authorization required');
    }
    const posts = await prisma.todo.findMany({
      where: { userId: session.user.sub },
      orderBy: { createdAt: 'desc' },
    });
    res.json(posts);
  }
);
