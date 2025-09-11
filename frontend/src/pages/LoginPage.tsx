import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../components/Input';
import Button from '../components/Button';
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
      // 4. Chamada à API usando nosso apiClient
      const response = await apiClient.post('/auth/login', {
        email,
        password,
      });
      
      const { token } = response.data;

      // 5. Lógica de sucesso: salvar o token e navegar para o dashboard
      localStorage.setItem('authToken', token); // Salva o token no armazenamento local
      console.log('Login bem-sucedido! Token:', token);

      navigate('/'); // Redireciona o usuário para a página principal (Dashboard)

    } catch (err: any) {
      // 6. Lógica de erro: exibir uma mensagem para o usuário
      console.error('Falha no login:', err);
      setError(err.response?.data?.message || 'Erro ao tentar fazer login. Tente novamente.');
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