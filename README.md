# 🚀 SyncTask - Sistema de Gerenciamento de Projetos

Um sistema completo de gerenciamento de projetos com chat em tempo real, sistema de convites e colaboração em equipe.

## 📋 Visão Geral

O SyncTask é uma aplicação full-stack que permite:

- ✅ Criação e gerenciamento de boards de projetos
- ✅ Sistema de colunas e cards (Kanban)
- ✅ Chat em tempo real com WebSocket
- ✅ Sistema de convites e membros
- ✅ Autenticação segura com JWT
- ✅ Interface moderna e responsiva

## 🏗️ Arquitetura

```
SyncTask/
├── 📁 backend/          # API Node.js + TypeScript
├── 📁 frontend/         # React + TypeScript + Tailwind
├── 📁 docs/             # Documentação organizada
├── 📁 scripts/          # Scripts de automação
└── 📄 README.md         # Este arquivo
```

## 🚀 Tecnologias

### Backend

- **Node.js** + **TypeScript**
- **Express.js** - Framework web
- **Socket.IO** - WebSocket em tempo real
- **Prisma** - ORM para banco de dados
- **PostgreSQL** - Banco de dados
- **JWT** - Autenticação
- **Jest** - Testes unitários

### Frontend

- **React** + **TypeScript**
- **Tailwind CSS** - Estilização
- **React Router** - Roteamento
- **Socket.IO Client** - WebSocket
- **Axios** - Cliente HTTP
- **Vitest** - Testes unitários

## 📚 Documentação

A documentação está organizada nas seguintes pastas:

- 📁 [`docs/analysis/`](docs/analysis/) - Análises e relatórios
- 📁 [`docs/implementation/`](docs/implementation/) - Guias de implementação
- 📁 [`docs/security/`](docs/security/) - Análises de segurança
- 📁 [`backend/docs/`](backend/docs/) - Documentação técnica do backend
- 📁 [`frontend/README.md`](frontend/README.md) - Documentação do frontend

## 🔧 Configuração e Instalação

### Pré-requisitos

- Node.js 18+
- PostgreSQL 14+
- npm ou yarn

### Instalação

1. **Clone o repositório**

```bash
git clone <repository-url>
cd synctask
```

2. **Instale as dependências**

```bash
npm install
```

3. **Configure o banco de dados**

```bash
# Configure as variáveis de ambiente
cp backend/env.example backend/.env
# Edite backend/.env com suas configurações
```

4. **Execute as migrações**

```bash
cd backend
npx prisma migrate dev
npx prisma generate
```

5. **Inicie o desenvolvimento**

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

## 🧪 Testes

### Backend

```bash
cd backend
npm test
```

### Frontend

```bash
cd frontend
npm test
```

## 🔒 Segurança

O sistema implementa várias camadas de segurança:

- ✅ **Autenticação JWT** com refresh tokens
- ✅ **Rate limiting** em todas as rotas
- ✅ **Validação robusta** com Zod schemas
- ✅ **Criptografia** de mensagens sensíveis
- ✅ **Headers de segurança** (CSP, HSTS, etc.)
- ✅ **Logs de segurança** estruturados

Veja mais detalhes em [`docs/security/`](docs/security/).

## 📊 Performance

O sistema foi otimizado para alta performance:

- ✅ **Cache inteligente** para mensagens
- ✅ **WebSocket otimizado** com rooms
- ✅ **Queries otimizadas** no banco
- ✅ **Paginação** em todas as listagens
- ✅ **Compressão** de respostas

Veja mais detalhes em [`docs/analysis/BUILD_STATUS_FINAL.md`](docs/analysis/BUILD_STATUS_FINAL.md).

## 🛠️ Scripts Disponíveis

### Desenvolvimento

```bash
# Iniciar desenvolvimento
npm run dev

# Build para produção
npm run build

# Executar testes
npm test
```

### Banco de Dados

```bash
# Scripts organizados em backend/scripts/database/
- create_tables.js          # Criar tabelas
- setup-db.js              # Configurar banco
- create-admin.js          # Criar usuário admin
```

## 📈 Status do Projeto

- ✅ **Backend**: 100% funcional
- ✅ **Frontend**: 100% funcional
- ✅ **Chat em tempo real**: Implementado
- ✅ **Sistema de convites**: Implementado
- ✅ **Testes**: 83% de cobertura
- ✅ **Segurança**: Enterprise-grade
- ✅ **Performance**: Otimizada

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para detalhes.

## 📞 Suporte

Para suporte ou dúvidas:

- 📧 Email: suporte@synctask.com
- 📱 Discord: [Servidor do SyncTask]
- 🐛 Issues: [GitHub Issues]

---

**Desenvolvido com ❤️ pela equipe SyncTask**
