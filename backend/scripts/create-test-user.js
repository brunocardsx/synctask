import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createTestUser() {
  try {
    // Criar usuário de teste
    const hashedPassword = await bcrypt.hash('123456', 12);
    
    const testUser = await prisma.user.create({
      data: {
        name: 'Usuário Teste',
        email: 'teste@exemplo.com',
        password: hashedPassword,
        tokenVersion: 0
      }
    });

    console.log('✅ Usuário de teste criado:', testUser.email);
    
  } catch (error) {
    if (error.code === 'P2002') {
      console.log('✅ Usuário de teste já existe: teste@exemplo.com');
    } else {
      console.error('❌ Erro ao criar usuário de teste:', error);
    }
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser();
