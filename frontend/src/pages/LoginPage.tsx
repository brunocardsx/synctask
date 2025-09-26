import type { FormEvent } from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import Input from '../components/Input';
import apiClient from '../services/api'; // 1. Importamos nosso cliente API

export default function LoginPage() {
  // Hook para nos permitir navegar para outras páginas após o login
  const navigate = useNavigate();

  // 2. Estados para controlar os valores dos inputs e o estado de carregamento/erro
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 3. Função para lidar com a submissão do formulário
  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault(); // Previne o recarregamento padrão da página
    setIsLoading(true);
    setError(null);

    try {
      console.log('Tentando fazer login com:', { email, password: '***' });
      
      // 4. Chamada à API usando nosso apiClient
      const response = await apiClient.post('/auth/login', {
        email,
        password,
      });

      console.log('Resposta da API:', response.data);
      const { accessToken, refreshToken, expiresIn } = response.data;

      // 5. Lógica de sucesso: salvar os tokens e navegar para o dashboard
      localStorage.setItem('authToken', accessToken); // Salva o access token
      localStorage.setItem('refreshToken', refreshToken); // Salva o refresh token
      localStorage.setItem('tokenExpiresIn', expiresIn); // Salva o tempo de expiração
      console.log('Login bem-sucedido! Access Token:', accessToken);

      navigate('/'); // Redireciona o usuário para a página principal (Dashboard)

    } catch (err: any) {
      // 6. Lógica de erro: exibir uma mensagem para o usuário
      console.error('Falha no login:', err);
      
      let errorMessage = 'Erro ao tentar fazer login. Tente novamente.';
      
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      } else if (err.code === 'NETWORK_ERROR') {
        errorMessage = 'Erro de conexão. Verifique se o servidor está rodando.';
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false); // Garante que o estado de carregamento termine
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="p-8 py-10 bg-gray-800 rounded-lg shadow-lg w-full sm:max-w-sm md:max-w-md lg:max-w-lg border border-gray-700">
        <h1 className="text-2xl font-bold mb-6 text-center">Login no SyncTask</h1>
        {/* Exibe a mensagem de erro, se houver */}
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        {/* 7. Conectamos o estado e as funções ao formulário */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            id="email"
            label="Seu email"
            type="email"
            placeholder="nome@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            required
          />
          <Input
            id="password"
            label="Sua senha"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            required
          />
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Entrando...' : 'Entrar'}
          </Button>
        </form>
      </div>
    </div>
  );
}