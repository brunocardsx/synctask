import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
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

interface Column {
  id: string;
  title: string;
  order: number;
  boardId: string;
  cards: Card[];
  createdAt: string;
  updatedAt: string;
}

interface Board {
  id: string;
  name: string;
  description?: string;
  columns: Column[];
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export default function BoardPage() {
  const { boardId } = useParams<{ boardId: string }>();
  const socket = useSocket();
  const [board, setBoard] = useState<Board | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Busca inicial dos dados do board
  useEffect(() => {
    const fetchBoard = async () => {
      if (!boardId) return;
      
      try {
        const authToken = localStorage.getItem('authToken');
        if (!authToken) {
          setError('Token de autenticação não encontrado');
          return;
        }

        const response = await apiClient.get(`/boards/${boardId}`, {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });
        
        setBoard(response.data);
      } catch (err) {
        console.error('Erro ao carregar board:', err);
        setError('Erro ao carregar o board');
      } finally {
        setLoading(false);
      }
    };

    fetchBoard();
  }, [boardId]);

  // Configuração do Socket
  useEffect(() => {
    socket.connect();

    if (boardId) {
      socket.emit('join_board', boardId);
    }
    
    // Listener para nova coluna criada
    socket.on('column:created', (newColumn: Column) => {
      console.log('Nova coluna recebida:', newColumn);
      setBoard(currentBoard => {
        if (!currentBoard) return null;
        
        // Verifica se a coluna já existe para evitar duplicação
        const columnExists = currentBoard.columns.some(col => col.id === newColumn.id);
        if (columnExists) return currentBoard;
        
        return {
          ...currentBoard,
          columns: [...currentBoard.columns, { ...newColumn, cards: [] }]
        };
      });
    });

    socket.on('card:moved', (updatedCard) => {
      console.log('Card movido:', updatedCard);
      // TODO: Implementar atualização de card movido
    });

    return () => {
      socket.disconnect();
    };
  }, [boardId, socket]);

  if (loading) {
    return <div className="p-4 text-center">Carregando board...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">Erro: {error}</div>;
  }

  if (!board) {
    return <div className="p-4 text-center">Board não encontrado</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-6">{board.name}</h1>
      
      <div className="flex space-x-6 overflow-x-auto">
        {board.columns.map((column) => (
          <div key={column.id} className="bg-gray-100 p-4 rounded-lg min-w-80 max-w-80">
            <h2 className="text-xl font-semibold mb-4">{column.title}</h2>
            
            <div className="space-y-3">
              {column.cards.map((card) => (
                <div key={card.id} className="bg-white p-3 rounded shadow-sm">
                  <h3 className="font-medium">{card.title}</h3>
                  {card.description && (
                    <p className="text-sm text-gray-600 mt-1">{card.description}</p>
                  )}
                </div>
              ))}
            </div>
            
            {column.cards.length === 0 && (
              <div className="text-gray-500 text-center py-8 text-sm">
                Nenhum card nesta coluna
              </div>
            )}
          </div>
        ))}
        
        {board.columns.length === 0 && (
          <div className="text-gray-500 text-center py-8">
            Nenhuma coluna criada ainda
          </div>
        )}
      </div>
    </div>
  );
}
