import { getSession, withApiAuthRequired } from '@auth0/nextjs-auth0';
import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';

export default withApiAuthRequired(
  async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Method not allowed' });
      return;
    }
    const session = await getSession(req, res);
    if (!session) {
      throw new Error('authorization required');
    }
    const post = await prisma.timerRecord.create({
      data: {
        time: req.body.time,
        penalty: req.body.penalty,
        dnf: req.body.dnf,
        scramble: req.body.scramble,
        event: req.body.event,
        createdAt: new Date(req.body.createdAt),
        userId: session.user.sub,
      },
    });
    res.json(post);
  }
);
