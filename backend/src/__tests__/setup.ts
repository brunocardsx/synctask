// Configuração para testes - detecta se é teste de integração ou schema
import { PrismaClient } from '@prisma/client';

// Detecta se é teste de integração baseado no nome do arquivo
const isIntegrationTest =
  process.env.JEST_WORKER_ID &&
  (process.env.npm_lifecycle_event?.includes('integration') ||
    process.argv.some(
      arg =>
        arg.includes('api') ||
        arg.includes('auth') ||
        arg.includes('controller')
    ));

// Detecta automaticamente o tipo de teste
const testFile = process.argv.find(arg => arg.includes('.test.')) || '';
const isControllerTest = testFile.includes('controller');
const isServiceTest =
  testFile.includes('auth.service') || testFile.includes('auth/');

if (isControllerTest || isServiceTest) {
  console.log('🔗 Executando testes de integração (com banco de dados)');
} else {
  console.log('🧪 Executando testes de schema (sem banco de dados)');
}

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
const prisma =
  isIntegrationTest || isControllerTest || isServiceTest
    ? new PrismaClient()
    : mockPrisma;

beforeAll(async () => {
  if (isIntegrationTest || isControllerTest || isServiceTest) {
    console.log('🔗 Conectando ao banco de dados para testes de integração');
    await prisma.$connect();
  } else {
    console.log('✅ Testes de schema configurados');
  }
});

afterAll(async () => {
  if (isIntegrationTest || isControllerTest || isServiceTest) {
    console.log('🔌 Desconectando do banco de dados');
    await prisma.$disconnect();
  }
});

beforeEach(async () => {
  if (isIntegrationTest || isControllerTest || isServiceTest) {
    // Limpar dados entre testes de integração (ordem respeitando foreign keys)
    await prisma.card.deleteMany();
    await prisma.column.deleteMany();
    await prisma.board.deleteMany();
    await prisma.user.deleteMany();
  }
});

export { prisma };
