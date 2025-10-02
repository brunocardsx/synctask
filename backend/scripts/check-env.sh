#!/bin/bash

# Script para verificar e iniciar ambiente de desenvolvimento
echo "🔍 Verificando ambiente de desenvolvimento..."

# Verificar se Docker está rodando
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker não está rodando!"
    echo ""
    echo "📋 Opções disponíveis:"
    echo "1. Iniciar Docker Desktop e executar: npm run docker:dev"
    echo "2. Executar testes sem banco: npm run test:unit"
    echo "3. Configurar banco local PostgreSQL na porta 5433"
    echo ""
    echo "🚀 Para iniciar Docker Desktop:"
    echo "   - Abra o Docker Desktop"
    echo "   - Aguarde inicializar completamente"
    echo "   - Execute: npm run docker:dev"
    echo ""
    exit 1
fi

echo "✅ Docker está rodando!"
echo "🐳 Iniciando containers de desenvolvimento..."

# Iniciar containers
npm run docker:dev

echo "✅ Ambiente de desenvolvimento iniciado!"
echo "🧪 Execute os testes com: npm run test"
