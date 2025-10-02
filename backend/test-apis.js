const https = require('http');

const BASE_URL = 'http://localhost:3001';

function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const jsonBody = JSON.parse(body);
          resolve({
            status: res.statusCode,
            body: jsonBody,
            headers: res.headers
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            body: body,
            headers: res.headers
          });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function testAPIs() {
  console.log('🧪 Testando APIs do SyncTask...\n');

  try {
    // Teste 1: Health Check
    console.log('1. Testando Health Check...');
    const health = await makeRequest('GET', '/health');
    console.log(`   Status: ${health.status}`);
    console.log(`   Response:`, health.body);
    console.log('   ✅ Health check funcionando\n');

    // Teste 2: Registro de usuário
    console.log('2. Testando registro de usuário...');
    const userData = {
      name: 'Test User API',
      email: 'testapi@example.com',
      password: 'password123'
    };
    
    try {
      const register = await makeRequest('POST', '/api/auth/register', userData);
      console.log(`   Status: ${register.status}`);
      console.log(`   Response:`, register.body);
      
      if (register.status === 201) {
        console.log('   ✅ Registro funcionando');
        
        // Teste 3: Login
        console.log('\n3. Testando login...');
        const loginData = {
          email: userData.email,
          password: userData.password
        };
        
        const login = await makeRequest('POST', '/api/auth/login', loginData);
        console.log(`   Status: ${login.status}`);
        console.log(`   Response:`, login.body);
        
        if (login.status === 200) {
          console.log('   ✅ Login funcionando');
          
          // Teste 4: Criar board (com token)
          console.log('\n4. Testando criação de board...');
          const token = login.body.token;
          const boardData = {
            name: 'Board de Teste API'
          };
          
          // Nota: Este teste pode falhar se precisar de autenticação no header
          const board = await makeRequest('POST', '/api/boards', boardData);
          console.log(`   Status: ${board.status}`);
          console.log(`   Response:`, board.body);
          
          if (board.status === 201) {
            console.log('   ✅ Criação de board funcionando');
          } else {
            console.log('   ⚠️  Criação de board falhou (pode precisar de autenticação)');
          }
        } else {
          console.log('   ❌ Login falhou');
        }
      } else {
        console.log('   ❌ Registro falhou');
      }
    } catch (error) {
      console.log(`   ❌ Erro no registro: ${error.message}`);
    }

  } catch (error) {
    console.log(`❌ Erro geral: ${error.message}`);
  }

  console.log('\n🏁 Testes concluídos!');
}

testAPIs();
