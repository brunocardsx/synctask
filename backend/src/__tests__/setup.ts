// Configuração para testes - detecta se é teste de integração ou schema
import { PrismaClient } from '@prisma/client';

// Detecta se é teste de integração baseado no nome do arquivo
const isIntegrationTest = process.env.JEST_WORKER_ID && 
  (process.env.npm_lifecycle_event?.includes('integration') || 
   process.argv.some(arg => arg.includes('api') || arg.includes('auth')));

console.log('🧪 Executando testes de schema (sem banco de dados)');

// Mock básico do Prisma para testes de schema
const mockPrisma = {
  user: {
    create: () => Promise.resolve({}),
    findUnique: () => Promise.resolve({}),
    findMany: () => Promise.resolve([]),
    update: () => Promise.resolve({}),
    delete: () => Promise.resolve({}),
  },
  board: {
    create: () => Promise.resolve({}),
    findUnique: () => Promise.resolve({}),
    findMany: () => Promise.resolve([]),
    update: () => Promise.resolve({}),
    delete: () => Promise.resolve({}),
  },
  column: {
    create: () => Promise.resolve({}),
    findUnique: () => Promise.resolve({}),
    findMany: () => Promise.resolve([]),
    update: () => Promise.resolve({}),
    delete: () => Promise.resolve({}),
  },
  card: {
    create: () => Promise.resolve({}),
    findUnique: () => Promise.resolve({}),
    findMany: () => Promise.resolve([]),
    update: () => Promise.resolve({}),
    delete: () => Promise.resolve({}),
  },
  $connect: () => Promise.resolve(),
  $disconnect: () => Promise.resolve(),
};

// Usa Prisma real para testes de integração, mock para testes de schema
const prisma = isIntegrationTest ? new PrismaClient() : mockPrisma;

beforeAll(async () => {
  if (isIntegrationTest) {
    console.log('🔗 Conectando ao banco de dados para testes de integração');
    await prisma.$connect();
  } else {
    console.log('✅ Testes de schema configurados');
  }
});

afterAll(async () => {
  if (isIntegrationTest) {
    console.log('🔌 Desconectando do banco de dados');
    await prisma.$disconnect();
  }
});

beforeEach(async () => {
  if (isIntegrationTest) {
    // Limpar dados entre testes de integração
    await prisma.user.deleteMany();
  }
});

export { prisma };