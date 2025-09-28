import { useEffect, useState } from 'react';
import type { Card } from '../types/index.js';
import { createDeleteRequest, createPatchRequest, handleApiError } from '../utils/api.js';
import { isValidString } from '../utils/validation.js';

interface CardModalProps {
  card: Card | null;
  isOpen: boolean;
  onClose: () => void;
  onCardUpdated: (card: Card) => void;
  onCardDeleted: (cardId: string) => void;
}

const createModalClassName = () =>
  'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';

const createModalContentClassName = () =>
  'bg-white rounded-lg p-6 w-full max-w-md mx-4';

const createInputClassName = () =>
  'w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500';

const createTextareaClassName = () =>
  'w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500';

const createButtonClassName = () =>
  'px-3 py-1 rounded text-sm';

const createDeleteButtonClassName = (isLoading: boolean) =>
  `${createButtonClassName()} bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 ${isLoading ? 'opacity-50' : ''}`;

const createCancelButtonClassName = (isLoading: boolean) =>
  `${createButtonClassName()} bg-gray-300 text-gray-700 hover:bg-gray-400 ${isLoading ? 'opacity-50' : ''}`;

const createSaveButtonClassName = (isLoading: boolean, isDisabled: boolean) =>
  `${createButtonClassName()} bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 ${isLoading || isDisabled ? 'opacity-50' : ''}`;

const createDeleteConfirmClassName = () =>
  'mt-6 p-4 bg-red-50 border border-red-200 rounded';

const validateCardData = (title: string, description: string): boolean => {
  return isValidString(title) && description.length <= 500;
};

const updateCard = async (cardId: string, title: string, description: string): Promise<Card> => {
  const endpoint = `/cards/${cardId}`;
  const data = {
    title: title.trim(),
    description: description.trim(),
  };

  return createPatchRequest<Card>(endpoint, data);
};

const deleteCard = async (cardId: string): Promise<void> => {
  const endpoint = `/cards/${cardId}`;
  return createDeleteRequest<void>(endpoint);
};

const handleCardUpdate = async (
  card: Card,
  title: string,
  description: string,
  onCardUpdated: (card: Card) => void,
  onClose: () => void,
  setIsLoading: (loading: boolean) => void
) => {
  if (!validateCardData(title, description)) return;

  setIsLoading(true);
  try {
    const updatedCard = await updateCard(card.id, title, description);
    onCardUpdated(updatedCard);
    onClose();
  } catch (error) {
    const errorMessage = handleApiError(error);
    alert(`Erro ao atualizar card: ${errorMessage}`);
  } finally {
    setIsLoading(false);
  }
};

const handleCardDeletion = async (
  card: Card,
  onCardDeleted: (cardId: string) => void,
  onClose: () => void,
  setIsLoading: (loading: boolean) => void
) => {
  setIsLoading(true);
  try {
    await deleteCard(card.id);
    onCardDeleted(card.id);
    onClose();
  } catch (error) {
    const errorMessage = handleApiError(error);
    alert(`Erro ao deletar card: ${errorMessage}`);
  } finally {
    setIsLoading(false);
  }
};

const renderDeleteConfirmation = (
  isLoading: boolean,
  onDelete: () => void,
  onCancel: () => void
) => (
  <div className={createDeleteConfirmClassName()}>
    <p className="text-red-800 mb-3">Tem certeza que deseja deletar este card?</p>
    <div className="flex gap-2">
      <button
        onClick={onDelete}
        disabled={isLoading}
        className={createDeleteButtonClassName(isLoading)}
      >
        {isLoading ? 'Deletando...' : 'Sim, deletar'}
      </button>
      <button
        onClick={onCancel}
        className={createCancelButtonClassName(isLoading)}
        disabled={isLoading}
      >
        Cancelar
      </button>
    </div>
  </div>
);

const renderActionButtons = (
  isLoading: boolean,
  title: string,
  onDelete: () => void,
  onSave: () => void,
  onClose: () => void
) => (
  <div className="flex justify-between mt-6">
    <button
      onClick={onDelete}
      className={createDeleteButtonClassName(isLoading)}
      disabled={isLoading}
    >
      Deletar
    </button>

    <div className="flex gap-2">
      <button
        onClick={onClose}
        className={createCancelButtonClassName(isLoading)}
        disabled={isLoading}
      >
        Cancelar
      </button>
      <button
        onClick={onSave}
        disabled={isLoading || !isValidString(title)}
        className={createSaveButtonClassName(isLoading, !isValidString(title))}
      >
        {isLoading ? 'Salvando...' : 'Salvar'}
      </button>
    </div>
  </div>
);

export function CardModal({ card, isOpen, onClose, onCardUpdated, onCardDeleted }: CardModalProps) {
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
    if (!card) return;
    await handleCardUpdate(card, title, description, onCardUpdated, onClose, setIsLoading);
  };

  const handleDelete = async () => {
    if (!card) return;
    await handleCardDeletion(card, onCardDeleted, onClose, setIsLoading);
  };

  if (!isOpen || !card) return null;

  return (
    <div className={createModalClassName()}>
      <div className={createModalContentClassName()}>
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
              className={createInputClassName()}
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
              className={createTextareaClassName()}
              rows={4}
              disabled={isLoading}
            />
          </div>
        </div>

        {showDeleteConfirm
          ? renderDeleteConfirmation(isLoading, handleDelete, () => setShowDeleteConfirm(false))
          : renderActionButtons(isLoading, title, () => setShowDeleteConfirm(true), handleSave, onClose)
        }
      </div>
    </div>
  );
}
