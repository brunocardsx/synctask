#!/bin/bash

echo "🚀 Iniciando SyncTask..."

# Verificar se o banco está rodando
echo "📊 Verificando banco de dados..."
if ! docker ps | grep -q "synctask_db"; then
    echo "🔧 Iniciando banco de dados..."
    cd backend && docker-compose up -d
    cd ..
    sleep 3
fi

# Compilar backend
echo "🔨 Compilando backend..."
cd backend
npm run build
cd ..

# Iniciar backend em background
echo "⚙️ Iniciando backend..."
cd backend
node dist/server.js &
BACKEND_PID=$!
cd ..

# Aguardar backend inicializar
sleep 3

# Iniciar frontend
echo "🎨 Iniciando frontend..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "✅ SyncTask iniciado com sucesso!"
echo "📱 Frontend: http://localhost:5173"
echo "🔧 Backend: http://localhost:3001"
echo ""
echo "Para parar os serviços, pressione Ctrl+C"
echo ""

# Aguardar interrupção
trap "echo '🛑 Parando serviços...'; kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait
