import { useState } from "react";
import { Plus, X } from "lucide-react";
import type { Column as ColumnType } from "../types/index.js";
import { createPostRequest, handleApiError } from "../utils/api.js";
import { isValidString } from "../utils/validation.js";

interface AddColumnButtonProps {
  boardId: string;
}

const createFormClassName = () =>
  "bg-white/90 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-purple-100 min-w-80 max-w-80 flex-shrink-0";

const createInputClassName = () =>
  "w-full p-3 border border-purple-200 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white/80";

const createButtonClassName = () =>
  "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200";

const createSubmitButtonClassName = (isLoading: boolean, isDisabled: boolean) =>
  `${createButtonClassName()} bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 shadow-md hover:shadow-lg ${isLoading || isDisabled ? "opacity-50" : ""}`;

const createCancelButtonClassName = (isLoading: boolean) =>
  `${createButtonClassName()} bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-700 ${isLoading ? "opacity-50" : ""}`;

const createAddButtonClassName = () =>
  "w-80 flex-shrink-0 h-auto py-6 text-gray-400 hover:text-purple-500 hover:border-purple-300 transition-all duration-300 border-2 border-dashed border-gray-300 hover:border-purple-300 rounded-xl bg-white/50 hover:bg-white/80 backdrop-blur-sm group";

const validateColumnData = (title: string): boolean => {
  return isValidString(title) && title.length <= 50;
};

const createColumn = async (
  boardId: string,
  title: string
): Promise<ColumnType> => {
  const endpoint = `/boards/${boardId}/columns`;
  const data = {
    title: title.trim(),
  };

  return createPostRequest<ColumnType>(endpoint, data);
};

const handleColumnCreation = async (
  boardId: string,
  title: string,
  setIsLoading: (loading: boolean) => void,
  setTitle: (title: string) => void,
  setIsFormVisible: (visible: boolean) => void
) => {
  if (!validateColumnData(title)) return;

  setIsLoading(true);
  try {
    await createColumn(boardId, title);
    // Não chamar onColumnAdded aqui - o WebSocket vai adicionar quando receber a confirmação
    setTitle("");
    setIsFormVisible(false);
  } catch (error) {
    const errorMessage = handleApiError(error);
    alert(`Erro ao criar coluna: ${errorMessage}`);
  } finally {
    setIsLoading(false);
  }
};

const renderForm = (
  title: string,
  isLoading: boolean,
  setTitle: (title: string) => void,
  setIsFormVisible: (visible: boolean) => void,
  handleSubmit: (e: React.FormEvent) => void
) => (
  <form onSubmit={handleSubmit} className={createFormClassName()}>
    <input
      type="text"
      placeholder="Nome da coluna"
      value={title}
      onChange={(e) => setTitle(e.target.value)}
      className={createInputClassName()}
      autoFocus
      disabled={isLoading}
      maxLength={50}
    />
    <div className="flex gap-2">
      <button
        type="submit"
        disabled={isLoading || !validateColumnData(title)}
        className={createSubmitButtonClassName(
          isLoading,
          !validateColumnData(title)
        )}
      >
        {isLoading ? "Criando..." : "Criar Coluna"}
      </button>
      <button
        type="button"
        onClick={() => {
          setIsFormVisible(false);
          setTitle("");
        }}
        className={createCancelButtonClassName(isLoading)}
        disabled={isLoading}
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  </form>
);

const renderAddButton = (setIsFormVisible: (visible: boolean) => void) => (
  <button
    onClick={() => setIsFormVisible(true)}
    className={createAddButtonClassName()}
  >
    <div className="flex flex-col items-center justify-center space-y-2">
      <div className="p-2 rounded-full bg-purple-100 group-hover:bg-purple-200 transition-colors duration-200">
        <Plus className="h-5 w-5" />
      </div>
      <span className="text-sm font-medium">Adicionar Coluna</span>
    </div>
  </button>
);

export function AddColumnButton({
  boardId,
  onColumnAdded,
}: AddColumnButtonProps) {
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [title, setTitle] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleColumnCreation(
      boardId,
      title,
      setIsLoading,
      setTitle,
      setIsFormVisible
    );
  };

  if (isFormVisible) {
    return renderForm(
      title,
      isLoading,
      setTitle,
      setIsFormVisible,
      handleSubmit
    );
  }

  return renderAddButton(setIsFormVisible);
}
