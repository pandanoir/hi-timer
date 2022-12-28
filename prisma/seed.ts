import { prisma } from '../lib/prisma';

const userId = 'auth0|000000000000000000000000';
const main = async () => {
  for (let i = 0; i < 100; i++)
    await prisma.timerRecord.create({
      data: { time: Math.trunc(Math.random() * 10000), userId },
    });
};

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
