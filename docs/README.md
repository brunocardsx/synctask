# SyncTask

Sistema de gerenciamento de tarefas colaborativo desenvolvido com React, Node.js e WebSockets. Permite criar boards estilo Kanban com sincronização em tempo real entre usuários.

![SyncTask Demo](images/demo.gif)

**[🚀 Ver Demo](https://synctask-demo.vercel.app)** | **[📚 Documentação](https://github.com/brunocardsx/synctask/wiki)** | **[🐛 Reportar Bug](https://github.com/brunocardsx/synctask/issues)**

---

## Por que criei o SyncTask?

Durante meus estudos de desenvolvimento full-stack, senti falta de uma ferramenta simples para organizar meus projetos pessoais. Ferramentas como Trello são ótimas, mas queria construir algo do zero para entender como funciona e praticar com tecnologias modernas.

O resultado foi o SyncTask - um projeto que me ensinou muito sobre WebSockets, arquitetura de APIs REST, gerenciamento de estado no React e deploy de aplicações full-stack.

## O que o SyncTask faz

- **Boards Kanban**: Crie quadros para organizar suas tarefas em colunas (To Do, Doing, Done)
- **Drag & Drop**: Arraste cards entre colunas de forma intuitiva
- **Tempo Real**: Veja as mudanças de outros usuários instantaneamente via WebSocket
- **Autenticação**: Sistema de login seguro com JWT
- **Responsivo**: Funciona bem tanto no desktop quanto no mobile

## Stack Tecnológica

**Frontend**
- React 18 + TypeScript
- Tailwind CSS (ainda estou aprendendo algumas funcionalidades avançadas)
- Vite para development server
- @dnd-kit para drag and drop
- Socket.IO client

**Backend**
- Node.js + Express
- TypeScript (tem me ajudado muito com bugs)
- Prisma ORM + PostgreSQL
- Socket.IO para WebSocket
- JWT para autenticação

**Deploy & Ferramentas**
- Docker Compose para o banco local
- Vercel (frontend) e Railway (backend)
- ESLint e Prettier

## Diretrizes de Código

Este projeto segue diretrizes específicas de código para manter consistência e qualidade. Consulte o arquivo [CODING_GUIDELINES.md](./CODING_GUIDELINES.md) para detalhes completos.

**Principais práticas:**
- TypeScript com type-safety end-to-end
- Named exports ao invés de default exports
- Early returns para evitar aninhamento
- Nomes descritivos e específicos
- Testes focados em comportamento
- Código limpo e legível

## Instalação

### Requisitos
- Node.js 18+
- Docker (para o PostgreSQL)
- npm

### Rodando localmente

1. **Clone o projeto**
```bash
git clone https://github.com/brunocardsx/synctask.git
cd synctask
```

2. **Backend primeiro**
```bash
cd backend
npm install

# Configure o .env (copie do .env.example)
cp .env.example .env

# Suba o banco
docker-compose up -d

# Rode as migrations
npx prisma migrate dev
npx prisma generate

# Inicie o servidor
npm run dev
```

3. **Frontend**
```bash
cd frontend
npm install
npm run dev
```

4. **Acesse**
- App: http://localhost:5173
- API: http://localhost:3001

### Script automatizado

Se preferir, tem um script que faz tudo automaticamente:
```bash
chmod +x start.sh
./start.sh
```

## Estrutura dos arquivos

```
synctask/
├── backend/
│   ├── src/
│   │   ├── api/           # Controllers e rotas
│   │   ├── config/        # Config do banco e Socket.IO
│   │   ├── middlewares/   # Auth, CORS, etc
│   │   └── schemas/       # Validações com Zod
│   ├── prisma/           # Schema do banco
│   └── docker-compose.yml
├── frontend/
│   ├── src/
│   │   ├── components/   # Componentes React
│   │   ├── pages/        # Páginas da app
│   │   ├── hooks/        # Custom hooks
│   │   ├── context/      # Context API
│   │   └── services/     # Chamadas para API
└── scripts/              # Scripts de setup
```

## Funcionalidades implementadas

✅ **Autenticação**
- [x] Registro de usuário
- [x] Login/logout
- [x] Proteção de rotas

✅ **Gerenciamento de Boards**
- [x] Criar/editar/deletar boards
- [x] Adicionar/editar/remover cards
- [x] Drag and drop entre colunas

✅ **Tempo Real**
- [x] Sincronização via WebSocket
- [x] Múltiplos usuários no mesmo board
- [x] Updates instantâneos

✅ **Interface**
- [x] Design responsivo
- [x] Loading states
- [x] Feedback visual para ações

## Próximos passos

Tem algumas coisas que quero implementar quando tiver mais tempo:

**Versão 2.0 (próxima)**
- [ ] Comentários nos cards
- [ ] Upload de imagens
- [ ] Notificações

**Futuro**
- [ ] App mobile (React Native)
- [ ] Integração com GitHub/Slack
- [ ] Templates de boards

## Contribuindo

Se quiser contribuir ou tem sugestões, fique à vontade para:
- Abrir uma issue
- Fazer um fork e enviar um PR
- Me mandar mensagem no LinkedIn

### Como contribuir
1. Fork do projeto
2. Crie uma branch para sua feature (`git checkout -b minha-feature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin minha-feature`)
5. Abra um Pull Request

## Aprendizados e desafios

Alguns desafios que enfrentei durante o desenvolvimento:

**WebSockets**: Primeira vez implementando comunicação em tempo real. Levei um tempo para entender como gerenciar conexões e broadcast de mensagens.

**Drag & Drop**: A biblioteca @dnd-kit tem uma curva de aprendizado, especialmente para fazer funcionar bem no mobile.

**Deploy**: Configurar CORS e variáveis de ambiente para produção me deu algumas dores de cabeça no início.

**Estado Global**: Gerenciar estado compartilhado entre WebSocket e React state foi interessante de resolver.

## Licença

MIT License - veja o arquivo [LICENSE](LICENSE) para detalhes.

## Contato

**Bruno Cardoso**
- LinkedIn: [linkedin.com/in/brunocardsx](https://linkedin.com/in/brunocardsx)
- GitHub: [@brunocardsx](https://github.com/brunocardsx)
- Email: brunocardsx@gmail.com

---

**Nota**: Este é um projeto de portfólio criado para demonstrar habilidades em desenvolvimento full-stack. Se encontrar algum bug ou tiver sugestões, ficarei feliz em receber feedback!# SyncTask

Sistema de gerenciamento de tarefas colaborativo desenvolvido com React, Node.js e WebSockets. Permite criar boards estilo Kanban com sincronização em tempo real entre usuários.

![SyncTask Demo](images/demo.gif)

**[🚀 Ver Demo](https://synctask-demo.vercel.app)** | **[📚 Documentação](https://github.com/brunocardsx/synctask/wiki)** | **[🐛 Reportar Bug](https://github.com/brunocardsx/synctask/issues)**

---

## Por que criei o SyncTask?

Durante meus estudos de desenvolvimento full-stack, senti falta de uma ferramenta simples para organizar meus projetos pessoais. Ferramentas como Trello são ótimas, mas queria construir algo do zero para entender como funciona a sincronização em tempo real e praticar com tecnologias modernas.

O resultado foi o SyncTask - um projeto que me ensinou muito sobre WebSockets, arquitetura de APIs REST, gerenciamento de estado no React e deploy de aplicações full-stack.

## O que o SyncTask faz

- **Boards Kanban**: Crie quadros para organizar suas tarefas em colunas (To Do, Doing, Done)
- **Drag & Drop**: Arraste cards entre colunas de forma intuitiva
- **Tempo Real**: Veja as mudanças de outros usuários instantaneamente via WebSocket
- **Autenticação**: Sistema de login seguro com JWT
- **Responsivo**: Funciona bem tanto no desktop quanto no mobile

## Stack Tecnológica

**Frontend**
- React 18 + TypeScript
- Tailwind CSS (ainda estou aprendendo algumas funcionalidades avançadas)
- Vite para development server
- @dnd-kit para drag and drop
- Socket.IO client

**Backend**
- Node.js + Express
- TypeScript (tem me ajudado muito com bugs)
- Prisma ORM + PostgreSQL
- Socket.IO para WebSocket
- JWT para autenticação

**Deploy & Ferramentas**
- Docker Compose para o banco local
- Vercel (frontend) e Railway (backend)
- ESLint e Prettier

## Diretrizes de Código

Este projeto segue diretrizes específicas de código para manter consistência e qualidade. Consulte o arquivo [CODING_GUIDELINES.md](./CODING_GUIDELINES.md) para detalhes completos.

**Principais práticas:**
- TypeScript com type-safety end-to-end
- Named exports ao invés de default exports
- Early returns para evitar aninhamento
- Nomes descritivos e específicos
- Testes focados em comportamento
- Código limpo e legível

## Instalação

### Requisitos
- Node.js 18+
- Docker (para o PostgreSQL)
- npm

### Rodando localmente

1. **Clone o projeto**
```bash
git clone https://github.com/brunocardsx/synctask.git
cd synctask
```

2. **Backend primeiro**
```bash
cd backend
npm install

# Configure o .env (copie do .env.example)
cp .env.example .env

# Suba o banco
docker-compose up -d

# Rode as migrations
npx prisma migrate dev
npx prisma generate

# Inicie o servidor
npm run dev
```

3. **Frontend**
```bash
cd frontend
npm install
npm run dev
```

4. **Acesse**
- App: http://localhost:5173
- API: http://localhost:3001

### Script automatizado

Se preferir, tem um script que faz tudo automaticamente:
```bash
chmod +x start.sh
./start.sh
```

## Estrutura dos arquivos

```
synctask/
├── backend/
│   ├── src/
│   │   ├── api/           # Controllers e rotas
│   │   ├── config/        # Config do banco e Socket.IO
│   │   ├── middlewares/   # Auth, CORS, etc
│   │   └── schemas/       # Validações com Zod
│   ├── prisma/           # Schema do banco
│   └── docker-compose.yml
├── frontend/
│   ├── src/
│   │   ├── components/   # Componentes React
│   │   ├── pages/        # Páginas da app
│   │   ├── hooks/        # Custom hooks
│   │   ├── context/      # Context API
│   │   └── services/     # Chamadas para API
└── scripts/              # Scripts de setup
```

## Funcionalidades implementadas

✅ **Autenticação**
- [x] Registro de usuário
- [x] Login/logout
- [x] Proteção de rotas

✅ **Gerenciamento de Boards**
- [x] Criar/editar/deletar boards
- [x] Adicionar/editar/remover cards
- [x] Drag and drop entre colunas

✅ **Tempo Real**
- [x] Sincronização via WebSocket
- [x] Múltiplos usuários no mesmo board
- [x] Updates instantâneos

✅ **Interface**
- [x] Design responsivo
- [x] Loading states
- [x] Feedback visual para ações

## Próximos passos

Tem algumas coisas que quero implementar quando tiver mais tempo:

**Versão 2.0 (próxima)**
- [ ] Comentários nos cards
- [ ] Upload de imagens
- [ ] Notificações

**Futuro**
- [ ] App mobile (React Native)
- [ ] Integração com GitHub/Slack
- [ ] Templates de boards

## Contribuindo

Se quiser contribuir ou tem sugestões, fique à vontade para:
- Abrir uma issue
- Fazer um fork e enviar um PR
- Me mandar mensagem no LinkedIn

### Como contribuir
1. Fork do projeto
2. Crie uma branch para sua feature (`git checkout -b minha-feature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin minha-feature`)
5. Abra um Pull Request

## Aprendizados e desafios

Alguns desafios que enfrentei durante o desenvolvimento:

**WebSockets**: Primeira vez implementando comunicação em tempo real. Levei um tempo para entender como gerenciar conexões e broadcast de mensagens.

**Drag & Drop**: A biblioteca @dnd-kit tem uma curva de aprendizado, especialmente para fazer funcionar bem no mobile.

**Deploy**: Configurar CORS e variáveis de ambiente para produção me deu algumas dores de cabeça no início.

**Estado Global**: Gerenciar estado compartilhado entre WebSocket e React state foi interessante de resolver.

## Licença

MIT License - veja o arquivo [LICENSE](LICENSE) para detalhes.

## Contato

**Bruno Cardoso**
- LinkedIn: [linkedin.com/in/brunocardsx](https://linkedin.com/in/brunocardsx)
- GitHub: [@brunocardsx](https://github.com/brunocardsx)
- Email: brunocardsx@gmail.com

---

**Nota**: Este é um projeto de portfólio criado para demonstrar habilidades em desenvolvimento full-stack. Se encontrar algum bug ou tiver sugestões, ficarei feliz em receber feedback!