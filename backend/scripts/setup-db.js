import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function setupDatabase() {
  try {
    console.log('🔍 Verificando conexão com o banco...');

    // Testa a conexão
    await prisma.$connect();
    console.log('✅ Conexão com banco estabelecida');

    // Verifica se as tabelas principais existem
    const userCount = await prisma.user.count();
    console.log(`📊 Tabela User existe com ${userCount} registros`);

    const boardCount = await prisma.board.count();
    console.log(`📊 Tabela Board existe com ${boardCount} registros`);

    // Verifica se todas as tabelas necessárias existem
    const tablesToCheck = [
      'user', 'board', 'boardMember', 'column', 'card', 'boardInvite', 'chatMessage', 'notification'
    ];

    let allTablesExist = true;
    for (const table of tablesToCheck) {
      try {
        await prisma.$queryRaw`SELECT 1 FROM ${table} LIMIT 1`;
        console.log(`✅ Tabela ${table} existe`);
      } catch (error) {
        if (error.code === 'P2021' || error.message.includes('does not exist')) {
          console.log(`❌ Tabela ${table} não existe`);
          allTablesExist = false;
        }
      }
    }

    if (!allTablesExist) {
      throw new Error('Algumas tabelas não existem');
    }

    console.log('✅ Banco de dados configurado corretamente');
  } catch (error) {
    console.error('❌ Erro ao verificar banco:', error);

    if (error.code === 'P2021' || error.message.includes('does not exist') || error.message.includes('Algumas tabelas não existem')) {
      console.log('🔧 Aplicando schema completo...');
      const { execSync } = await import('child_process');

      try {
        console.log('🔧 Tentando db push para sincronizar schema...');
        execSync('npx prisma db push --accept-data-loss', {
          stdio: 'inherit',
        });
        console.log('✅ Schema sincronizado com sucesso');
        
        // Verifica novamente se tudo está funcionando
        console.log('🔍 Verificando tabelas após sincronização...');
        await prisma.$connect();
        const userCount = await prisma.user.count();
        console.log(`📊 Tabela User agora tem ${userCount} registros`);
        
      } catch (pushError) {
        console.error('❌ Erro ao aplicar schema:', pushError);
        throw pushError;
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
  .catch(error => {
    console.error('💥 Falha no setup do banco:', error);
    process.exit(1);
  });
