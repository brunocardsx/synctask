import { DndContext } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { CardModal } from '../components/CardModal';
import { Column } from '../components/Column';
import { useSocket } from '../hooks/useSocket';
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
  // Verificar autenticação antes de renderizar
  const authToken = localStorage.getItem('authToken');
  if (!authToken) {
    console.log('BoardPage: No auth token, redirecting to login');
    window.location.href = '/login';
    return null;
  }

  const { boardId } = useParams<{ boardId: string }>();
  const socket = useSocket();
  const [board, setBoard] = useState<Board | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

        // Adicionar cards de exemplo para testar drag & drop
        const boardData = response.data;
        if (boardData.columns.length > 0) {
          // Adicionar cards de exemplo na primeira coluna
          boardData.columns[0].cards = [
            {
              id: 'card-1',
              title: 'Implementar autenticação',
              description: 'Criar sistema de login e registro de usuários',
              order: 0,
              columnId: boardData.columns[0].id
            },
            {
              id: 'card-2',
              title: 'Configurar banco de dados',
              description: 'Setup do PostgreSQL e Prisma',
              order: 1,
              columnId: boardData.columns[0].id
            }
          ];

          // Cards na segunda coluna
          if (boardData.columns[1]) {
            boardData.columns[1].cards = [
              {
                id: 'card-3',
                title: 'Implementar WebSockets',
                description: 'Sistema de tempo real com Socket.IO',
                order: 0,
                columnId: boardData.columns[1].id
              }
            ];
          }
        }

        setBoard(boardData);
      } catch (err) {
        console.error('Erro ao carregar board:', err);
        setError('Erro ao carregar o board');
      } finally {
        setLoading(false);
      }
    };

    fetchBoard();
  }, [boardId]);

  // Função para lidar com drag over (mover entre colunas)
  const handleDragOver = (event: { active: { id: string }; over: { id: string } | null }) => {
    const { active, over } = event;

    if (!over || !board) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Encontrar a coluna de origem e destino
    const activeColumn = board.columns.find(col =>
      col.cards.some(card => card.id === activeId)
    );
    const overColumn = board.columns.find(col =>
      col.id === overId || col.cards.some(card => card.id === overId)
    );

    if (!activeColumn || !overColumn || activeColumn.id === overColumn.id) {
      return;
    }

    // Mover card entre colunas
    setBoard(currentBoard => {
      if (!currentBoard) return null;

      const newColumns = currentBoard.columns.map(column => {
        if (column.id === activeColumn.id) {
          return {
            ...column,
            cards: column.cards.filter(card => card.id !== activeId)
          };
        }

        if (column.id === overColumn.id) {
          const cardToMove = activeColumn.cards.find(card => card.id === activeId);
          if (cardToMove) {
            return {
              ...column,
              cards: [...column.cards, { ...cardToMove, columnId: column.id }]
            };
          }
        }

        return column;
      });

      return { ...currentBoard, columns: newColumns };
    });
  };

  // Função para lidar com o fim do drag
  const handleDragEnd = (event: { active: { id: string }; over: { id: string } | null }) => {
    const { active, over } = event;

    if (!over || !board) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Encontrar a coluna que contém o card ativo
    const activeColumn = board.columns.find(col =>
      col.cards.some(card => card.id === activeId)
    );

    if (!activeColumn) return;

    // Se estamos reordenando dentro da mesma coluna
    const activeCardIndex = activeColumn.cards.findIndex(card => card.id === activeId);
    const overCardIndex = activeColumn.cards.findIndex(card => card.id === overId);

    if (activeCardIndex !== -1 && overCardIndex !== -1) {
      setBoard(currentBoard => {
        if (!currentBoard) return null;

        const newColumns = currentBoard.columns.map(column => {
          if (column.id === activeColumn.id) {
            const newCards = arrayMove(column.cards, activeCardIndex, overCardIndex);
            return { ...column, cards: newCards };
          }
          return column;
        });

        return { ...currentBoard, columns: newColumns };
      });
    }

    console.log('Drag ended:', { activeId, overId });
    // TODO: Aqui você implementaria a chamada para a API para salvar a nova posição
  };

  // Funções para lidar com cards
  const handleCardClick = (card: Card) => {
    setSelectedCard(card);
    setIsModalOpen(true);
  };

  const handleCardUpdated = (updatedCard: Card) => {
    setBoard(currentBoard => {
      if (!currentBoard) return null;

      const newColumns = currentBoard.columns.map(column => ({
        ...column,
        cards: column.cards.map(card =>
          card.id === updatedCard.id ? updatedCard : card
        )
      }));

      return { ...currentBoard, columns: newColumns };
    });
  };

  const handleCardDeleted = (cardId: string) => {
    setBoard(currentBoard => {
      if (!currentBoard) return null;

      const newColumns = currentBoard.columns.map(column => ({
        ...column,
        cards: column.cards.filter(card => card.id !== cardId)
      }));

      return { ...currentBoard, columns: newColumns };
    });
  };

  const handleCardAdded = (newCard: Card) => {
    setBoard(currentBoard => {
      if (!currentBoard) return null;

      const newColumns = currentBoard.columns.map(column => {
        if (column.id === newCard.columnId) {
          return {
            ...column,
            cards: [...column.cards, newCard]
          };
        }
        return column;
      });

      return { ...currentBoard, columns: newColumns };
    });
  };

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
    <DndContext onDragEnd={handleDragEnd} onDragOver={handleDragOver}>
      <div className="p-4">
        <h1 className="text-3xl font-bold mb-6">{board.name}</h1>

        <div className="flex space-x-6 overflow-x-auto">
          {board.columns.map((column) => (
            <Column
              key={column.id}
              column={column}
              onCardClick={handleCardClick}
              onCardAdded={handleCardAdded}
            />
          ))}

          {board.columns.length === 0 && (
            <div className="text-gray-500 text-center py-8">
              Nenhuma coluna criada ainda
            </div>
          )}
        </div>
      </div>

      <CardModal
        card={selectedCard}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedCard(null);
        }}
        onCardUpdated={handleCardUpdated}
        onCardDeleted={handleCardDeleted}
      />
    </DndContext>
  );
}
