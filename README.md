# SyncTask

Sistema de gerenciamento de tarefas colaborativo desenvolvido com React, Node.js e Typescript. Permite criar boards estilo Kanban com sincronização em tempo real entre usuários.

##  Início Rápido

```bash
# Clone o projeto
git clone https://github.com/brunocardsx/synctask.git
cd synctask

# Instale dependências
npm install

# Configure o ambiente
cp backend/.env.example backend/.env

# Inicie o ambiente completo
./scripts/start-dev.sh
```

##  Estrutura do Projeto

```
synctask/
├── backend/              # Backend Node.js + Express
│   ├── src/
│   │   ├── api/         # Controllers e rotas
│   │   ├── config/      # Config do banco e Socket.IO
│   │   ├── middlewares/ # Auth, CORS, etc
│   │   └── schemas/     # Validações com Zod
│   └── prisma/         # Schema do banco
├── frontend/            # Frontend React + TypeScript
│   ├── src/
│   │   ├── components/ # Componentes React
│   │   ├── pages/      # Páginas da app
│   │   ├── hooks/      # Custom hooks
│   │   ├── context/    # Context API
│   │   └── services/   # Chamadas para API
├── scripts/            # Scripts de desenvolvimento
│   ├── start-dev.sh    # Inicia ambiente completo
│   ├── stop-dev.sh     # Para ambiente completo
│   └── schedule-commits.sh # Reorganiza commits
├── docs/               # Documentação
│   ├── README.md       # Documentação completa
│   ├── CLAUDE.md       # Diretrizes de código
│   └── CODING_GUIDELINES.md
└── config/             # Configurações
    ├── docker-compose.yml
    ├── .eslintrc.js
    ├── .prettierrc
    └── tsconfig.json
```


## 🎯 Funcionalidades

✅ **Autenticação**
- Registro e login de usuários
- Proteção de rotas
- JWT para segurança

✅ **Boards Kanban**
- Criar/editar/deletar boards
- Drag & drop entre colunas
- Cards com descrições

✅ **Tempo Real**
- Sincronização via WebSocket
- Múltiplos usuários simultâneos
- Updates instantâneos

✅ **Interface**
- Design responsivo
- Loading states
- Feedback visual


## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## 📄 Licença

MIT License - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 👨‍💻 Autor

**Bruno Cardoso**
- LinkedIn: [linkedin.com/in/brunocardsx](https://linkedin.com/in/brunocardsx)
- GitHub: [@brunocardsx](https://github.com/brunocardsx)
- Email: brunocardsx@gmail.com
