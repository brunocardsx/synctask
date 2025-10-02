import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.TEST_DATABASE_URL || 'postgresql://synctask:postgres@localhost:5433/synctask_test_db',
    },
  },
});

beforeAll(async () => {
  await prisma.$connect();
});

afterAll(async () => {
  await prisma.$disconnect();
});

beforeEach(async () => {
  // Clean database before each test (in correct order to respect foreign keys)
  try {
    await prisma.activity.deleteMany();
    await prisma.comment.deleteMany();
    await prisma.cardAssignee.deleteMany();
    await prisma.card.deleteMany();
    await prisma.column.deleteMany();
    await prisma.boardMember.deleteMany();
    await prisma.board.deleteMany();
    await prisma.user.deleteMany();
  } catch (error) {
    // Ignore errors if tables don't exist yet
    console.warn('Some tables may not exist yet:', error);
  }
});

export { prisma };
