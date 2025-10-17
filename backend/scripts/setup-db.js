import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function setupDatabase() {
  try {
    console.log('🔍 Verificando conexão com o banco...');
    
    // Testa a conexão
    await prisma.$connect();
    console.log('✅ Conexão com banco estabelecida');
    
    // Verifica se as tabelas existem
    const userCount = await prisma.user.count();
    console.log(`📊 Tabela User existe com ${userCount} registros`);
    
    const boardCount = await prisma.board.count();
    console.log(`📊 Tabela Board existe com ${boardCount} registros`);
    
    console.log('✅ Banco de dados configurado corretamente');
    
  } catch (error) {
    console.error('❌ Erro ao verificar banco:', error);
    
    if (error.code === 'P2021') {
      console.log('🔧 Aplicando migrações...');
      const { execSync } = await import('child_process');
      
      try {
        execSync('npx prisma migrate deploy', { stdio: 'inherit' });
        console.log('✅ Migrações aplicadas com sucesso');
      } catch (migrationError) {
        console.error('❌ Erro ao aplicar migrações:', migrationError);
        
        try {
          console.log('🔧 Tentando db push...');
          execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit' });
          console.log('✅ Schema aplicado com sucesso');
        } catch (pushError) {
          console.error('❌ Erro ao aplicar schema:', pushError);
          throw pushError;
        }
      }
    } else {
      throw error;
    }
  } finally {
    await prisma.$disconnect();
  }
}

setupDatabase()
  .then(() => {
    console.log('🎉 Setup do banco concluído');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Falha no setup do banco:', error);
    process.exit(1);
  });
