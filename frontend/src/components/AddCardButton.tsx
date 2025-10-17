import { useState } from 'react';
import type { Card } from '../types/index.js';
import apiClient from '../services/api.js';
import { isValidString } from '../utils/validation.js';

interface AddCardButtonProps {
  columnId: string;
  onCardAdded: (card: Card) => void;
}

const createFormClassName = () =>
  'bg-white p-3 rounded-lg shadow-sm border border-gray-200';

const createInputClassName = () =>
  'w-full p-2 border border-gray-300 rounded mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500';

const createTextareaClassName = () =>
  'w-full p-2 border border-gray-300 rounded mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500';

const createButtonClassName = () =>
  'px-3 py-1 rounded text-sm';

const createSubmitButtonClassName = (isLoading: boolean, isDisabled: boolean) =>
  `${createButtonClassName()} bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 ${isLoading || isDisabled ? 'opacity-50' : ''}`;

const createCancelButtonClassName = (isLoading: boolean) =>
  `${createButtonClassName()} bg-gray-300 text-gray-700 hover:bg-gray-400 ${isLoading ? 'opacity-50' : ''}`;

const createAddButtonClassName = () =>
  'w-full p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded text-sm transition-colors';

const validateCardData = (title: string, description: string): boolean => {
  return isValidString(title) && description.length <= 500;
};

const createCard = async (columnId: string, title: string, description: string): Promise<Card> => {
  const endpoint = `/cards/columns/${columnId}/cards`;
  const data = {
    title: title.trim(),
    description: description.trim(),
  };

  const response = await apiClient.post(endpoint, data);
  return response.data;
};

const handleCardCreation = async (
  columnId: string,
  title: string,
  description: string,
  onCardAdded: (card: Card) => void,
  setIsLoading: (loading: boolean) => void,
  setTitle: (title: string) => void,
  setDescription: (description: string) => void,
  setIsFormVisible: (visible: boolean) => void
) => {
  if (!validateCardData(title, description)) return;

  setIsLoading(true);
  try {
    const newCard = await createCard(columnId, title, description);
    onCardAdded(newCard);
    setTitle('');
    setDescription('');
    setIsFormVisible(false);
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || 'Erro desconhecido';
    alert(`Erro ao criar card: ${errorMessage}`);
  } finally {
    setIsLoading(false);
  }
};

const renderForm = (
  title: string,
  description: string,
  isLoading: boolean,
  setTitle: (title: string) => void,
  setDescription: (description: string) => void,
  setIsFormVisible: (visible: boolean) => void,
  handleSubmit: (e: React.FormEvent) => void
) => (
  <form onSubmit={handleSubmit} className={createFormClassName()}>
    <input
      type="text"
      placeholder="Título do card"
      value={title}
      onChange={(e) => setTitle(e.target.value)}
      className={createInputClassName()}
      autoFocus
      disabled={isLoading}
    />
    <textarea
      placeholder="Descrição (opcional)"
      value={description}
      onChange={(e) => setDescription(e.target.value)}
      className={createTextareaClassName()}
      rows={2}
      disabled={isLoading}
    />
    <div className="flex gap-2">
      <button
        type="submit"
        disabled={isLoading || !isValidString(title)}
        className={createSubmitButtonClassName(isLoading, !isValidString(title))}
      >
        {isLoading ? 'Criando...' : 'Adicionar'}
      </button>
      <button
        type="button"
        onClick={() => setIsFormVisible(false)}
        className={createCancelButtonClassName(isLoading)}
        disabled={isLoading}
      >
        Cancelar
      </button>
    </div>
  </form>
);

const renderAddButton = (setIsFormVisible: (visible: boolean) => void) => (
  <button
    onClick={() => setIsFormVisible(true)}
    className={createAddButtonClassName()}
  >
    + Adicionar um card
  </button>
);

export function AddCardButton({ columnId, onCardAdded }: AddCardButtonProps) {
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleCardCreation(
      columnId,
      title,
      description,
      onCardAdded,
      setIsLoading,
      setTitle,
      setDescription,
      setIsFormVisible
    );
  };

  if (isFormVisible) {
    return renderForm(
      title,
      description,
      isLoading,
      setTitle,
      setDescription,
      setIsFormVisible,
      handleSubmit
    );
  }

  return renderAddButton(setIsFormVisible);
}
