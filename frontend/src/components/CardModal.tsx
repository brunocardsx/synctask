import { useState, useEffect } from 'react';
import apiClient from '../services/api';

interface Card {
  id: string;
  title: string;
  description?: string;
  order: number;
  columnId: string;
  createdAt: string;
  updatedAt: string;
}

interface CardModalProps {
  card: Card | null;
  isOpen: boolean;
  onClose: () => void;
  onCardUpdated: (card: Card) => void;
  onCardDeleted: (cardId: string) => void;
}

export default function CardModal({ card, isOpen, onClose, onCardUpdated, onCardDeleted }: CardModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (card) {
      setTitle(card.title);
      setDescription(card.description || '');
    }
  }, [card]);

  const handleSave = async () => {
    if (!card || !title.trim()) return;

    setIsLoading(true);
    try {
      const authToken = localStorage.getItem('authToken');
      const response = await apiClient.patch(`/cards/${card.id}`, {
        title: title.trim(),
        description: description.trim()
      }, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      onCardUpdated(response.data);
      onClose();
    } catch (error) {
      console.error('Erro ao atualizar card:', error);
      alert('Erro ao atualizar card. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!card) return;

    setIsLoading(true);
    try {
      const authToken = localStorage.getItem('authToken');
      await apiClient.delete(`/cards/${card.id}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      onCardDeleted(card.id);
      onClose();
    } catch (error) {
      console.error('Erro ao deletar card:', error);
      alert('Erro ao deletar card. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !card) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h2 className="text-xl font-bold mb-4">Editar Card</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Título
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descrição
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
              disabled={isLoading}
            />
          </div>
        </div>

        {showDeleteConfirm ? (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded">
            <p className="text-red-800 mb-3">Tem certeza que deseja deletar este card?</p>
            <div className="flex gap-2">
              <button
                onClick={handleDelete}
                disabled={isLoading}
                className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 disabled:opacity-50"
              >
                {isLoading ? 'Deletando...' : 'Sim, deletar'}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-3 py-1 bg-gray-300 text-gray-700 rounded text-sm hover:bg-gray-400"
                disabled={isLoading}
              >
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <div className="flex justify-between mt-6">
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
              disabled={isLoading}
            >
              Deletar
            </button>
            
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="px-3 py-1 bg-gray-300 text-gray-700 rounded text-sm hover:bg-gray-400"
                disabled={isLoading}
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={isLoading || !title.trim()}
                className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 disabled:opacity-50"
              >
                {isLoading ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
