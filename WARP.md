# WARP.md

Este arquivo fornece orientações para o WARP (warp.dev) ao trabalhar com código neste repositório.

## Comandos Essenciais

### Backend (Node.js + TypeScript + Express)
```bash
# Desenvolvimento
npm run dev          # Servidor com hot reload (porta 3001)
npm test            # Executar todos os testes
npm run build       # Compilar TypeScript

# Banco de dados
docker-compose up -d        # Subir PostgreSQL
npx prisma migrate dev      # Aplicar migrações
npx prisma studio          # Interface visual do banco
```

### Frontend (React + TypeScript + Vite)
```bash
cd frontend
npm run dev         # Servidor de desenvolvimento (porta 5173)
npm run build       # Build para produção
npm run lint        # Linter ESLint
```

## Arquitetura do Projeto

### Estrutura Geral
- **Backend**: API REST com Express, Prisma ORM e PostgreSQL
- **Frontend**: SPA React com Vite, TypeScript e Tailwind CSS
- **Autenticação**: JWT tokens com middleware `isAuthenticated`
- **Banco**: PostgreSQL com Docker, schema Prisma

### Backend (src/)
```
api/
├── auth/          # Registro e login de usuários
├── boards/        # CRUD de quadros Kanban
├── cards/         # Movimentação de cartões
└── columns/       # Colunas dos quadros

middlewares/       # isAuthenticated (JWT validation)
schemas/          # Validação Zod (authSchema, boardSchema, etc)
config/           # prisma.ts (client instance)
```

### Fluxo de Dados Principal
1. **Usuário** se registra/faz login → **JWT token**
2. **Board** criado pelo owner → **Colunas** adicionadas
3. **Cards** criados nas colunas → **Movimentação** entre colunas
4. **Atividades** registradas para auditoria

### Banco de Dados (Prisma Schema)
- **User**: Autenticação e relacionamentos
- **Board**: Quadros Kanban com owner
- **BoardMember**: Permissões (ADMIN/MEMBER)
- **Column**: Colunas ordenadas por quadro
- **Card**: Cartões com ordem e responsáveis
- **Activity**: Log de ações para auditoria

## Tecnologias Principais
- **Backend**: Express + TypeScript + Prisma + PostgreSQL + Jest
- **Frontend**: React + TypeScript + Vite + Tailwind + React Router
- **Auth**: JWT + bcrypt
- **Validation**: Zod schemas
- **Dev Tools**: tsx, ESLint, Docker

## Configuração ES Modules
- Projeto usa ES modules (`"type": "module"`)
- Imports devem usar extensão `.js` nos arquivos TypeScript
- Jest configurado com `ts-jest/presets/default-esm`
