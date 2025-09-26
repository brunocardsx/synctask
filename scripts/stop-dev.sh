#!/bin/bash

# SyncTask Development Stop Script
# Este script para todos os serviços de desenvolvimento

set -e

echo "🛑 Parando SyncTask Development Environment..."

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

# Parar processos Node.js
print_status "Parando processos Node.js..."
pkill -f "node dist/server.js" 2>/dev/null || true
pkill -f "vite" 2>/dev/null || true
pkill -f "tsx" 2>/dev/null || true

# Parar banco de dados
print_status "Parando banco de dados..."
cd backend
docker-compose down
cd ..

print_success "Todos os serviços foram parados com sucesso!"
