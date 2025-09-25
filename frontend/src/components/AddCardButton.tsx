import { useState } from 'react';
import apiClient from '../services/api';

interface AddCardButtonProps {
  columnId: string;
  onCardAdded: (card: any) => void;
}

export default function AddCardButton({ columnId, onCardAdded }: AddCardButtonProps) {
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsLoading(true);
    try {
      const authToken = localStorage.getItem('authToken');
      const response = await apiClient.post(`/cards/columns/${columnId}/cards`, {
        title: title.trim(),
        description: description.trim()
      }, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      onCardAdded(response.data);
      setTitle('');
      setDescription('');
      setIsFormVisible(false);
    } catch (error) {
      console.error('Erro ao criar card:', error);
      alert('Erro ao criar card. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isFormVisible) {
    return (
      <form onSubmit={handleSubmit} className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
        <input
          type="text"
          placeholder="Título do card"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          autoFocus
          disabled={isLoading}
        />
        <textarea
          placeholder="Descrição (opcional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={2}
          disabled={isLoading}
        />
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={isLoading || !title.trim()}
            className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 disabled:opacity-50"
          >
            {isLoading ? 'Criando...' : 'Adicionar'}
          </button>
          <button
            type="button"
            onClick={() => setIsFormVisible(false)}
            className="px-3 py-1 bg-gray-300 text-gray-700 rounded text-sm hover:bg-gray-400"
            disabled={isLoading}
          >
            Cancelar
          </button>
        </div>
      </form>
    );
  }

  return (
    <button
      onClick={() => setIsFormVisible(true)}
      className="w-full p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded text-sm transition-colors"
    >
      + Adicionar um card
    </button>
  );
}
