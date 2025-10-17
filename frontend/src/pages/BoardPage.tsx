import {
  DndContext,
  type DragEndEvent,
  type DragOverEvent,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { CardModal } from "../components/CardModal";
import { Column } from "../components/Column";
import { MembersModal } from "../components/MembersModal";
import { BoardMembers } from "../components/BoardMembers";
import { BoardChat } from "../components/BoardChat";
import { MembersTab } from "../components/MembersTab";
import { NotificationCenter } from "../components/NotificationCenter";
import { useSocket } from "../hooks/useSocket";
import { getUserData } from "../utils/storage";
import apiClient from "../services/api";
import {
  Kanban,
  Users,
  MessageSquare,
  Settings,
  ChevronLeft,
} from "lucide-react";
import { Button } from "../components/ui/button";

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
  const authToken = localStorage.getItem("authToken");
  if (!authToken) {
    console.log("BoardPage: No auth token, redirecting to login");
    window.location.href = "/login";
    return null;
  }

  const { boardId } = useParams<{ boardId: string }>();
  const socket = useSocket();
  const [board, setBoard] = useState<Board | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<{
    userId: string | null;
    isOwner: boolean;
    isAdmin: boolean;
  }>({
    userId: null,
    isOwner: false,
    isAdmin: false,
  });
  const [boardOwner, setBoardOwner] = useState<{
    id: string;
    name: string;
    email: string;
  } | null>(null);
  const [activeTab, setActiveTab] = useState<"kanban" | "members" | "chat">(
    "kanban"
  );

  // Busca inicial dos dados do board
  useEffect(() => {
    const fetchBoard = async () => {
      if (!boardId) return;

      try {
        const authToken = localStorage.getItem("authToken");
        if (!authToken) {
          setError("Token de autenticação não encontrado");
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
              id: "card-1",
              title: "Implementar autenticação",
              description: "Criar sistema de login e registro de usuários",
              order: 0,
              columnId: boardData.columns[0].id,
            },
            {
              id: "card-2",
              title: "Configurar banco de dados",
              description: "Setup do PostgreSQL e Prisma",
              order: 1,
              columnId: boardData.columns[0].id,
            },
          ];

          // Cards na segunda coluna
          if (boardData.columns[1]) {
            boardData.columns[1].cards = [
              {
                id: "card-3",
                title: "Implementar WebSockets",
                description: "Sistema de tempo real com Socket.IO",
                order: 0,
                columnId: boardData.columns[1].id,
              },
            ];
          }
        }

        setBoard(boardData);

        // Determinar permissões do usuário atual
        const userData = getUserData();
        console.log("Dados do usuário no BoardPage:", userData);
        console.log("localStorage userId:", localStorage.getItem("userId"));
        console.log("localStorage userName:", localStorage.getItem("userName"));
        console.log(
          "localStorage userEmail:",
          localStorage.getItem("userEmail")
        );
        // Verificar se é owner - se não houver ownerId, considerar o primeiro membro como owner
        const isOwner =
          userData.userId === boardData.ownerId ||
          (!boardData.ownerId &&
            userData.userId === boardData.members?.[0]?.userId);

        console.log("Debug Owner Check:");
        console.log("- userData.userId:", userData.userId);
        console.log("- boardData.ownerId:", boardData.ownerId);
        console.log("- boardData.members:", boardData.members);
        console.log("- isOwner:", isOwner);

        setCurrentUser({
          userId: userData.userId,
          isOwner,
          isAdmin: false, // Será determinado quando carregarmos os membros
        });

        // Buscar informações do owner
        await fetchBoardOwner(boardData.ownerId);
      } catch (err) {
        console.error("Erro ao carregar board:", err);
        setError("Erro ao carregar o board");
      } finally {
        setLoading(false);
      }
    };

    fetchBoard();
  }, [boardId]);

  // Função para buscar informações do owner do board
  const fetchBoardOwner = async (ownerId: string) => {
    try {
      const authToken = localStorage.getItem("authToken");
      const response = await apiClient.get(`/users/${ownerId}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      setBoardOwner(response.data);
    } catch (err) {
      console.error("Erro ao carregar informações do owner:", err);
    }
  };

  // Função para lidar com drag over (mover entre colunas)
  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;

    if (!over || !board) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Encontrar a coluna de origem e destino
    const activeColumn = board.columns.find((col) =>
      col.cards.some((card) => card.id === activeId)
    );
    const overColumn = board.columns.find(
      (col) => col.id === overId || col.cards.some((card) => card.id === overId)
    );

    if (!activeColumn || !overColumn || activeColumn.id === overColumn.id) {
      return;
    }

    // Mover card entre colunas
    setBoard((currentBoard) => {
      if (!currentBoard) return null;

      const newColumns = currentBoard.columns.map((column) => {
        if (column.id === activeColumn.id) {
          return {
            ...column,
            cards: column.cards.filter((card) => card.id !== activeId),
          };
        }

        if (column.id === overColumn.id) {
          const cardToMove = activeColumn.cards.find(
            (card) => card.id === activeId
          );
          if (cardToMove) {
            return {
              ...column,
              cards: [...column.cards, { ...cardToMove, columnId: column.id }],
            };
          }
        }

        return column;
      });

      return { ...currentBoard, columns: newColumns };
    });

    // Emitir evento de movimento de card entre colunas via WebSocket
    if (socket) {
      const cardToMove = activeColumn.cards.find(
        (card) => card.id === activeId
      );
      if (cardToMove) {
        socket.emit("card:moved", {
          cardId: activeId,
          fromColumnId: activeColumn.id,
          toColumnId: overColumn.id,
          newOrder: overColumn.cards.length,
          boardId: boardId,
        });
      }
    }
  };

  // Função para lidar com o fim do drag
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || !board) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Encontrar a coluna que contém o card ativo
    const activeColumn = board.columns.find((col) =>
      col.cards.some((card) => card.id === activeId)
    );

    if (!activeColumn) return;

    // Se estamos reordenando dentro da mesma coluna
    const activeCardIndex = activeColumn.cards.findIndex(
      (card) => card.id === activeId
    );
    const overCardIndex = activeColumn.cards.findIndex(
      (card) => card.id === overId
    );

    if (activeCardIndex !== -1 && overCardIndex !== -1) {
      setBoard((currentBoard) => {
        if (!currentBoard) return null;

        const newColumns = currentBoard.columns.map((column) => {
          if (column.id === activeColumn.id) {
            const newCards = arrayMove(
              column.cards,
              activeCardIndex,
              overCardIndex
            );
            return { ...column, cards: newCards };
          }
          return column;
        });

        return { ...currentBoard, columns: newColumns };
      });
    }

    console.log("Drag ended:", { activeId, overId });

    // Emitir evento de movimento de card via WebSocket
    if (socket) {
      const cardToMove = activeColumn.cards.find(
        (card) => card.id === activeId
      );
      if (cardToMove) {
        socket.emit("card:moved", {
          cardId: activeId,
          fromColumnId: activeColumn.id,
          toColumnId: overId.startsWith("column-") ? overId : activeColumn.id,
          newOrder:
            overCardIndex !== -1 ? overCardIndex : activeColumn.cards.length,
          boardId: boardId,
        });
      }
    }
  };

  // Funções para lidar com cards
  const handleCardClick = (card: Card) => {
    setSelectedCard(card);
    setIsModalOpen(true);
  };

  const handleCardUpdated = (updatedCard: Card) => {
    setBoard((currentBoard) => {
      if (!currentBoard) return null;

      const newColumns = currentBoard.columns.map((column) => ({
        ...column,
        cards: column.cards.map((card) =>
          card.id === updatedCard.id ? updatedCard : card
        ),
      }));

      return { ...currentBoard, columns: newColumns };
    });
  };

  const handleCardDeleted = (cardId: string) => {
    setBoard((currentBoard) => {
      if (!currentBoard) return null;

      const newColumns = currentBoard.columns.map((column) => ({
        ...column,
        cards: column.cards.filter((card) => card.id !== cardId),
      }));

      return { ...currentBoard, columns: newColumns };
    });
  };

  const handleCardAdded = (newCard: Card) => {
    setBoard((currentBoard) => {
      if (!currentBoard) return null;

      const newColumns = currentBoard.columns.map((column) => {
        if (column.id === newCard.columnId) {
          return {
            ...column,
            cards: [...column.cards, newCard],
          };
        }
        return column;
      });

      return { ...currentBoard, columns: newColumns };
    });
  };

  // Configuração do Socket
  useEffect(() => {
    if (socket) {
      socket.connect();

      if (boardId) {
        socket.emit("join_board", boardId);
      }

      // Listener para nova coluna criada
      socket.on("column:created", (newColumn: Column) => {
        console.log("Nova coluna recebida:", newColumn);
        setBoard((currentBoard) => {
          if (!currentBoard) return null;

          // Verifica se a coluna já existe para evitar duplicação
          const columnExists = currentBoard.columns.some(
            (col) => col.id === newColumn.id
          );
          if (columnExists) return currentBoard;

          return {
            ...currentBoard,
            columns: [...currentBoard.columns, { ...newColumn, cards: [] }],
          };
        });
      });

      socket.on("card:moved", (updatedCard) => {
        console.log("Card movido:", updatedCard);
        // TODO: Implementar atualização de card movido
      });

      return () => {
        socket.disconnect();
      };
    }
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
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
        {/* Header do Board */}
        <div className="bg-white/80 backdrop-blur-xl border-b border-purple-100 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              {/* Título e navegação */}
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.history.back()}
                  className="text-purple-600 hover:text-purple-700"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Voltar
                </Button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {board.name}
                  </h1>
                  <div className="mt-1">
                    <BoardMembers boardId={boardId!} />
                  </div>
                </div>
              </div>

              {/* Notificações e Abas */}
              <div className="flex items-center space-x-3">
                <NotificationCenter />

                <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
                  <Button
                    variant={activeTab === "kanban" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setActiveTab("kanban")}
                    className={
                      activeTab === "kanban"
                        ? "bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-md"
                        : "text-gray-600 hover:text-gray-900"
                    }
                  >
                    <Kanban className="h-4 w-4 mr-2" />
                    Kanban
                  </Button>
                  <Button
                    variant={activeTab === "members" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setActiveTab("members")}
                    className={
                      activeTab === "members"
                        ? "bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-md"
                        : "text-gray-600 hover:text-gray-900"
                    }
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Membros
                  </Button>
                  <Button
                    variant={activeTab === "chat" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setActiveTab("chat")}
                    className={
                      activeTab === "chat"
                        ? "bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-md"
                        : "text-gray-600 hover:text-gray-900"
                    }
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Chat
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Conteúdo das Abas */}
        <div className="max-w-7xl mx-auto px-4 py-6">
          {activeTab === "kanban" && (
            <DndContext onDragEnd={handleDragEnd} onDragOver={handleDragOver}>
              <div className="flex space-x-6 overflow-x-auto pb-4">
                {board.columns.map((column) => (
                  <Column
                    key={column.id}
                    column={column}
                    onCardClick={handleCardClick}
                    onCardAdded={handleCardAdded}
                  />
                ))}

                {board.columns.length === 0 && (
                  <div className="flex-1 text-center py-12">
                    <div className="text-gray-400 text-lg">
                      Nenhuma coluna criada ainda
                    </div>
                    <div className="text-gray-300 text-sm mt-2">
                      Adicione colunas para começar a organizar suas tarefas
                    </div>
                  </div>
                )}
              </div>
            </DndContext>
          )}

          {activeTab === "members" && (
            <MembersTab
              boardId={boardId!}
              currentUser={currentUser}
              onUserRoleUpdated={(isAdmin) =>
                setCurrentUser((prev) => ({ ...prev, isAdmin }))
              }
              boardOwner={boardOwner}
            />
          )}

          {activeTab === "chat" && (
            <BoardChat boardId={boardId!} currentUser={currentUser} />
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

      <MembersModal
        boardId={boardId!}
        isOpen={isMembersModalOpen}
        onClose={() => setIsMembersModalOpen(false)}
        currentUser={currentUser}
        onUserRoleUpdated={(isAdmin) =>
          setCurrentUser((prev) => ({ ...prev, isAdmin }))
        }
        boardOwner={boardOwner || undefined}
      />
    </DndContext>
  );
}
