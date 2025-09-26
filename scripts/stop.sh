#!/bin/bash

echo "🛑 Parando SyncTask..."

# Parar processos do Node.js
echo "⚙️ Parando backend e frontend..."
pkill -f "node dist/server.js"
pkill -f "vite"

# Parar banco de dados
echo "📊 Parando banco de dados..."
cd backend && docker-compose down
cd ..

echo "✅ SyncTask parado com sucesso!"
