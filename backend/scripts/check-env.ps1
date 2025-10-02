# Script para verificar e iniciar ambiente de desenvolvimento
Write-Host "🔍 Verificando ambiente de desenvolvimento..." -ForegroundColor Cyan

# Verificar se Docker está rodando
try {
    docker info | Out-Null
    Write-Host "✅ Docker está rodando!" -ForegroundColor Green
    Write-Host "🐳 Iniciando containers de desenvolvimento..." -ForegroundColor Yellow
    
    # Iniciar containers
    npm run docker:dev
    
    Write-Host "✅ Ambiente de desenvolvimento iniciado!" -ForegroundColor Green
    Write-Host "🧪 Execute os testes com: npm run test" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Docker não está rodando!" -ForegroundColor Red
    Write-Host ""
    Write-Host "📋 Opções disponíveis:" -ForegroundColor Yellow
    Write-Host "1. Iniciar Docker Desktop e executar: npm run docker:dev" -ForegroundColor White
    Write-Host "2. Executar testes sem banco: npm run test:unit" -ForegroundColor White
    Write-Host "3. Configurar banco local PostgreSQL na porta 5433" -ForegroundColor White
    Write-Host ""
    Write-Host "🚀 Para iniciar Docker Desktop:" -ForegroundColor Yellow
    Write-Host "   - Abra o Docker Desktop" -ForegroundColor White
    Write-Host "   - Aguarde inicializar completamente" -ForegroundColor White
    Write-Host "   - Execute: npm run docker:dev" -ForegroundColor White
    Write-Host ""
    Write-Host "💡 Alternativa: Execute 'npm run test:unit' para testes sem banco" -ForegroundColor Cyan
}