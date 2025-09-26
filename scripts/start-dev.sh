#!/bin/bash

# SyncTask Development Startup Script
# Este script inicia o banco de dados, backend e frontend

set -e  # Exit on any error

echo "🚀 Iniciando SyncTask Development Environment..."

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para imprimir mensagens coloridas
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar se Docker está rodando
if ! docker info > /dev/null 2>&1; then
    print_error "Docker não está rodando. Por favor, inicie o Docker primeiro."
    exit 1
fi

# Verificar se as dependências estão instaladas
if [ ! -d "backend/node_modules" ] || [ ! -d "frontend/node_modules" ]; then
    print_warning "Dependências não encontradas. Instalando..."
    npm install
    cd backend && npm install && cd ..
    cd frontend && npm install && cd ..
fi

# Iniciar banco de dados
print_status "Iniciando banco de dados PostgreSQL..."
cd backend
docker-compose up -d
cd ..

# Aguardar banco estar pronto
print_status "Aguardando banco de dados estar pronto..."
sleep 5

# Verificar se banco está rodando
if ! docker ps | grep -q "backend-db-1"; then
    print_error "Falha ao iniciar banco de dados"
    exit 1
fi

print_success "Banco de dados iniciado com sucesso!"

# Compilar backend
print_status "Compilando backend..."
cd backend
npm run build
cd ..

# Verificar se compilação foi bem-sucedida
if [ ! -d "backend/dist" ]; then
    print_error "Falha na compilação do backend"
    exit 1
fi

print_success "Backend compilado com sucesso!"

# Executar migrações do banco
print_status "Executando migrações do banco de dados..."
cd backend
npx prisma migrate deploy
cd ..

print_success "Migrações executadas com sucesso!"

# Iniciar serviços
print_status "Iniciando backend e frontend..."
print_status "Backend: http://localhost:3001"
print_status "Frontend: http://localhost:5173"
print_status "Pressione Ctrl+C para parar todos os serviços"

# Usar concurrently para rodar ambos os serviços
npx concurrently \
  --names "BACKEND,FRONTEND" \
  --prefix-colors "blue,green" \
  "cd backend && npm run dev:single" \
  "cd frontend && npm run dev"

print_success "Serviços parados."
