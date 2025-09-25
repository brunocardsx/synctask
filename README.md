# 🚀 SyncTask - Collaborative Task Management

Um sistema moderno de gerenciamento de tarefas colaborativo com tempo real, construído com React, Node.js, TypeScript e PostgreSQL.

## ✨ Funcionalidades

- 🔐 **Autenticação JWT** - Sistema seguro de login/registro
- 📋 **Boards Colaborativos** - Crie e gerencie quadros de tarefas
- 🎯 **Drag & Drop** - Interface intuitiva para mover cards
- ⚡ **Tempo Real** - WebSockets para colaboração instantânea
- 🎨 **UI Moderna** - Interface responsiva com Tailwind CSS
- 🔒 **Segurança** - Validação robusta com Zod

## 🛠️ Tech Stack

### Frontend
- **React 19** - Framework moderno
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização utilitária
- **Vite** - Build tool rápido
- **@dnd-kit** - Drag & Drop acessível
- **Socket.IO Client** - Comunicação em tempo real

### Backend
- **Node.js** - Runtime JavaScript
- **Express** - Framework web
- **TypeScript** - Tipagem estática
- **Prisma** - ORM moderno
- **PostgreSQL** - Banco de dados relacional
- **Socket.IO** - WebSockets
- **JWT** - Autenticação
- **Zod** - Validação de dados

## 🚀 Início Rápido

### Pré-requisitos
- Node.js 18+
- Docker e Docker Compose
- npm ou yarn

### Instalação e Execução

#### Opção 1: Script Automatizado (Recomendado)
```bash
# Clonar o repositório
git clone <seu-repo>
cd synctask

# Executar setup completo
npm run setup

# Iniciar desenvolvimento
npm run dev
```

#### Opção 2: Script Shell
```bash
# Tornar scripts executáveis
chmod +x start-dev.sh stop-dev.sh

# Iniciar ambiente de desenvolvimento
./start-dev.sh

# Para parar (em outro terminal)
./stop-dev.sh
```

#### Opção 3: Manual
```bash
# 1. Instalar dependências
npm install
cd backend && npm install && cd ..
cd frontend && npm install && cd ..

# 2. Iniciar banco de dados
cd backend && docker-compose up -d && cd ..

# 3. Compilar backend
cd backend && npm run build && cd ..

# 4. Executar migrações
cd backend && npx prisma migrate deploy && cd ..

# 5. Iniciar serviços
npm run dev
```

## 📱 Acessos

Após iniciar o ambiente de desenvolvimento:

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/health

## 🗄️ Banco de Dados

O projeto usa PostgreSQL com Prisma ORM. As configurações estão em:
- `backend/.env` - Variáveis de ambiente
- `backend/prisma/schema.prisma` - Schema do banco
- `backend/docker-compose.yml` - Configuração do Docker

### Comandos Úteis do Banco
```bash
# Ver status do banco
cd backend && docker-compose ps

# Parar banco
cd backend && docker-compose down

# Resetar banco (CUIDADO!)
cd backend && docker-compose down -v
```

## 🧪 Testes

```bash
# Testes do backend
cd backend && npm test

# Testes do frontend
cd frontend && npm test
```

## 📦 Scripts Disponíveis

### Root (Projeto Principal)
- `npm run dev` - Inicia backend e frontend
- `npm run setup` - Setup completo do projeto
- `npm run clean` - Limpa dependências e builds

### Backend
- `npm run dev` - Desenvolvimento com watch
- `npm run dev:single` - Execução única
- `npm run build` - Compilação TypeScript
- `npm run start` - Execução em produção
- `npm test` - Executar testes

### Frontend
- `npm run dev` - Servidor de desenvolvimento
- `npm run build` - Build para produção
- `npm run preview` - Preview do build
- `npm run lint` - Linter

## 🏗️ Estrutura do Projeto

```
synctask/
├── backend/                 # API Node.js
│   ├── src/
│   │   ├── api/            # Rotas da API
│   │   ├── config/         # Configurações
│   │   ├── middlewares/    # Middlewares
│   │   ├── schemas/        # Validações Zod
│   │   └── utils/          # Utilitários
│   ├── prisma/            # Schema e migrações
│   └── docker-compose.yml # Banco de dados
├── frontend/               # React App
│   ├── src/
│   │   ├── components/    # Componentes
│   │   ├── pages/         # Páginas
│   │   ├── services/      # APIs
│   │   └── context/       # Context API
└── scripts/               # Scripts de automação
```

## 🔧 Configuração de Desenvolvimento

### Variáveis de Ambiente
Crie um arquivo `.env` no diretório `backend/`:

```env
DATABASE_URL="postgresql://synctask:postgres@localhost:5432/synctask_db?schema=public&client_encoding=utf8"
JWT_SECRET="your-super-secret-jwt-key-here"
PORT=3001
```

### Banco de Dados
```bash
# Iniciar banco
cd backend && docker-compose up -d

# Executar migrações
cd backend && npx prisma migrate deploy

# Resetar banco (se necessário)
cd backend && npx prisma migrate reset
```

## 🚀 Deploy

### Frontend (Vercel/Netlify)
```bash
cd frontend
npm run build
# Deploy da pasta dist/
```

### Backend (Railway/Heroku)
```bash
cd backend
npm run build
# Deploy da pasta dist/
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 🎯 Roadmap

- [ ] Sistema de notificações
- [ ] Upload de arquivos
- [ ] Comentários em cards
- [ ] Templates de boards
- [ ] App mobile (React Native)
- [ ] Integração com Slack/GitHub
- [ ] Analytics e relatórios

---

**Desenvolvido com ❤️ para demonstrar habilidades em desenvolvimento full-stack moderno.**
