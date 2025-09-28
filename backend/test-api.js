// Teste simples das APIs
import app from './dist/app.js';

const server = app.listen(3001, async () => {
    console.log('✅ Servidor rodando na porta 3001');
    
    // Teste de registro
    try {
        const registerResponse = await fetch('http://localhost:3001/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'Usuario Teste',
                email: 'teste@email.com',
                password: 'senha123'
            })
        });
        
        console.log('📝 Registro:', registerResponse.status);
        if (registerResponse.ok) {
            const data = await registerResponse.json();
            console.log('✅ Usuário criado, token:', data.token.substring(0, 20) + '...');
        } else {
            console.log('❌ Erro no registro:', await registerResponse.text());
        }
    } catch (err) {
        console.log('❌ Erro na conexão de registro:', err.message);
    }

    // Teste de login
    try {
        const loginResponse = await fetch('http://localhost:3001/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'teste@email.com',
                password: 'senha123'
            })
        });
        
        console.log('🔐 Login:', loginResponse.status);
        if (loginResponse.ok) {
            const data = await loginResponse.json();
            console.log('✅ Login bem-sucedido, token:', data.token.substring(0, 20) + '...');
        } else {
            console.log('❌ Erro no login:', await loginResponse.text());
        }
    } catch (err) {
        console.log('❌ Erro na conexão de login:', err.message);
    }

    console.log('\n🌐 Servidor continuará rodando...');
    console.log('Frontend pode conectar em http://localhost:3001');
    console.log('Pressione Ctrl+C para parar');
});
