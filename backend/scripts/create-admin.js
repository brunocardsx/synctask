import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createAdminUser() {
    try {
        // Verificar se o usuário admin já existe
        const existingAdmin = await prisma.user.findUnique({
            where: { email: 'admin@exemplo.com' }
        });

        if (existingAdmin) {
            console.log('✅ Usuário admin já existe:', existingAdmin.email);
            return;
        }

        // Criar usuário admin
        const hashedPassword = await bcrypt.hash('123456', 12);

        const admin = await prisma.user.create({
            data: {
                name: 'Administrador',
                email: 'admin@exemplo.com',
                password: hashedPassword,
                tokenVersion: 0
            }
        });

        console.log('✅ Usuário admin criado com sucesso:', admin.email);

    } catch (error) {
        console.error('❌ Erro ao criar usuário admin:', error);
    } finally {
        await prisma.$disconnect();
    }
}

createAdminUser();
