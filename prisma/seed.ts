import { prisma } from '../lib/prisma';
import { Scrambow } from 'scrambow';

const userId = 'auth0|000000000000000000000000';
const scrambler = new Scrambow();
const main = async () => {
  for (let i = 0; i < 100; i++)
    await prisma.timerRecord.create({
      data: {
        time: Math.trunc(Math.random() * 10000),
        penalty: false,
        dnf: false,
        scramble: scrambler.get()[0].scramble_string,
        event: '3x3x3',
        userId,
      },
    });
};

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
