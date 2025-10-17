import React, { useState, useEffect, useRef } from "react";
import { useSocket } from "../hooks/useSocket";
import apiClient from "../services/api";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Send,
  MessageSquare,
  Users,
  Smile,
  Paperclip,
  MoreVertical,
  Loader2,
  AlertCircle,
} from "lucide-react";

interface ChatMessage {
  id: string;
  boardId: string;
  userId: string;
  message: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

interface BoardChatProps {
  boardId: string;
  currentUser: {
    userId: string | null;
    isOwner: boolean;
    isAdmin: boolean;
  };
}

export function BoardChat({ boardId, currentUser }: BoardChatProps) {
  const socket = useSocket();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll para a última mensagem
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Configurar Socket.IO
  useEffect(() => {
    if (socket && boardId) {
      // Conectar ao board
      socket.emit("join_board_chat", boardId);
      setIsConnected(true);

      // Listener para mensagens
      socket.on("chat_message", (message: ChatMessage) => {
        if (message.boardId === boardId) {
          console.log("Nova mensagem recebida:", message);
          setMessages((prev) => {
            // Remover mensagem temporária se existir uma real equivalente
            const filteredPrev = prev.filter((msg) => {
              if (msg.id.startsWith("temp-")) {
                // É uma mensagem temporária - verificar se é equivalente à mensagem real
                const isEquivalent =
                  msg.message === message.message &&
                  msg.userId === message.userId &&
                  Math.abs(
                    new Date(msg.createdAt).getTime() -
                      new Date(message.createdAt).getTime()
                  ) < 5000;
                if (isEquivalent) {
                  console.log("Removendo mensagem temporária:", msg.id);
                  return false; // Remove a mensagem temporária
                }
              }
              return true; // Mantém a mensagem
            });

            // Verificar se já existe uma mensagem real equivalente
            const exists = filteredPrev.some(
              (msg) =>
                msg.id === message.id ||
                (msg.message === message.message &&
                  msg.userId === message.userId &&
                  Math.abs(
                    new Date(msg.createdAt).getTime() -
                      new Date(message.createdAt).getTime()
                  ) < 5000)
            );

            if (exists) {
              console.log("Mensagem duplicada ignorada:", message);
              return filteredPrev;
            }

            console.log("Adicionando nova mensagem:", message);
            return [...filteredPrev, message];
          });
        }
      });

      // Listener para usuários online
      socket.on("users_online", (users: string[]) => {
        setOnlineUsers(users);
      });

      // Listener para conexão
      socket.on("connect", () => {
        console.log("Socket conectado no BoardChat");
        setIsConnected(true);
        socket.emit("join_board_chat", boardId);
      });

      socket.on("disconnect", () => {
        console.log("Socket desconectado no BoardChat");
        setIsConnected(false);
      });

      // Se já estiver conectado, entrar no chat imediatamente
      if (socket.connected) {
        console.log("Socket já conectado, entrando no chat");
        setIsConnected(true);
        socket.emit("join_board_chat", boardId);
      }

      // Listener para erros de chat
      socket.on("chat_error", (errorData) => {
        console.error("Erro no chat:", errorData);
        setError(errorData.message || "Erro ao enviar mensagem");
      });

      return () => {
        socket.emit("leave_board_chat", boardId);
        socket.off("chat_message");
        socket.off("users_online");
        socket.off("connect");
        socket.off("disconnect");
        socket.off("chat_error");
      };
    }
  }, [socket, boardId]);

  // Carregar mensagens iniciais
  useEffect(() => {
    fetchMessages();
  }, [boardId]);

  const fetchMessages = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("authToken");
      const response = await apiClient.get(`/boards/${boardId}/chat/messages`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Chat Debug - Mensagens carregadas:', response.data);
      setMessages(response.data || []);
    } catch (err: any) {
      // Se não houver endpoint de mensagens, usar array vazio
      console.log(
        "Chat messages endpoint not implemented yet, using empty array"
      );
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("handleSendMessage chamado");
    console.log("newMessage:", newMessage);
    console.log("socket:", socket);
    console.log("currentUser.userId:", currentUser.userId);
    console.log("isConnected:", isConnected);

    // Fallback para dados do usuário se currentUser.userId for null
    const userId =
      currentUser.userId ||
      localStorage.getItem("userId") ||
      localStorage.getItem("userEmail")?.split("@")[0] ||
      "user-123";
    const userName =
      localStorage.getItem("userName") ||
      localStorage.getItem("userEmail") ||
      "Usuário";
    const userEmail = localStorage.getItem("userEmail") || "email@exemplo.com";

    console.log("Dados do localStorage:");
    console.log("- userId (localStorage):", localStorage.getItem("userId"));
    console.log("- userName (localStorage):", localStorage.getItem("userName"));
    console.log(
      "- userEmail (localStorage):",
      localStorage.getItem("userEmail")
    );
    console.log("- userId final:", userId);

    if (!newMessage.trim() || !socket || !userId) {
      console.log("Condições não atendidas para enviar mensagem");
      console.log("userId:", userId);
      return;
    }

    const messageData = {
      boardId,
      userId: userId,
      message: newMessage.trim(),
      createdAt: new Date().toISOString(),
      userName: userName,
      userEmail: userEmail,
    };

    try {
      console.log("Enviando mensagem:", messageData);
      console.log("Socket conectado:", socket?.connected);

      // Emitir mensagem via WebSocket
      socket.emit("send_chat_message", messageData);

      // Adicionar mensagem otimisticamente com ID temporário
      const tempId = `temp-${Date.now()}`;
      const optimisticMessage: ChatMessage = {
        id: tempId,
        boardId: boardId,
        userId: userId,
        message: newMessage.trim(),
        createdAt: new Date().toISOString(),
        user: {
          id: userId,
          name: userName,
          email: userEmail,
        },
      };

      setMessages((prev) => [...prev, optimisticMessage]);
      setNewMessage("");

      // Marcar que estamos aguardando confirmação desta mensagem
      setTimeout(() => {
        setMessages((prev) => prev.filter((msg) => msg.id !== tempId));
      }, 10000); // Remove mensagem temporária após 10 segundos se não confirmada

      // Focus no input após enviar
      inputRef.current?.focus();
    } catch (err) {
      console.error("Erro ao enviar mensagem:", err);
      setError("Erro ao enviar mensagem");
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else {
      return date.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
  };

  const getAvatarColor = (userId: string) => {
    const colors = [
      "from-purple-500 to-purple-600",
      "from-blue-500 to-blue-600",
      "from-green-500 to-green-600",
      "from-pink-500 to-pink-600",
      "from-orange-500 to-orange-600",
      "from-teal-500 to-teal-600",
    ];
    const index =
      userId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) %
      colors.length;
    return colors[index];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
        <span className="ml-2 text-gray-600">Carregando chat...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <MessageSquare className="h-6 w-6 mr-2 text-purple-500" />
            Chat do Board
          </h2>
          <div className="text-gray-600 mt-1 flex items-center">
            Converse com os membros do board
            {isConnected && (
              <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                Online
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Usuários online */}
          <div className="flex items-center text-sm text-gray-600">
            <Users className="h-4 w-4 mr-1" />
            {onlineUsers.length} online
          </div>
        </div>
      </div>

      {/* Status de conexão */}
      {!isConnected && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center">
          <AlertCircle className="h-5 w-5 text-yellow-500 mr-3" />
          <span className="text-yellow-700">Conectando ao chat...</span>
        </div>
      )}

      {/* Área de mensagens */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm h-96 flex flex-col">
        <div className="p-4 border-b border-gray-200 bg-gray-50 rounded-t-xl">
          <h3 className="font-semibold text-gray-900">Mensagens</h3>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <MessageSquare className="h-12 w-12 mb-4 text-gray-300" />
              <p className="text-lg font-medium">Nenhuma mensagem ainda</p>
              <p className="text-sm">Seja o primeiro a enviar uma mensagem!</p>
            </div>
          ) : (
            <>
              {messages.map((message) => {
                const isOwnMessage = message.userId === currentUser.userId;
                console.log('Chat Debug - Comparando IDs:', {
                  messageUserId: message.userId,
                  currentUserId: currentUser.userId,
                  isOwnMessage,
                  messageText: message.message.substring(0, 20) + '...'
                });
                return (
                  <div
                    key={message.id}
                    className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`flex space-x-3 max-w-xs lg:max-w-md ${isOwnMessage ? "flex-row-reverse space-x-reverse" : ""}`}
                    >
                      {/* Avatar */}
                      <div
                        className={`w-8 h-8 rounded-full bg-gradient-to-br ${getAvatarColor(message.userId)} flex items-center justify-center text-white text-sm font-medium flex-shrink-0`}
                      >
                        {message.user.name.charAt(0).toUpperCase()}
                      </div>

                      {/* Mensagem */}
                      <div
                        className={`${isOwnMessage ? "items-end" : "items-start"} flex flex-col`}
                      >
                        <div
                          className={`rounded-lg px-4 py-2 ${
                            isOwnMessage
                              ? "bg-gradient-to-r from-purple-500 to-purple-600 text-white"
                              : "bg-gray-100 text-gray-900"
                          }`}
                        >
                          <p className="text-sm">{message.message}</p>
                        </div>
                        <div className="mt-1 flex items-center space-x-2 text-xs text-gray-500">
                          <span className={isOwnMessage ? "order-2" : ""}>
                            {message.user.name}
                          </span>
                          <span className={isOwnMessage ? "order-1" : ""}>
                            {formatTime(message.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input de mensagem */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
          <form onSubmit={handleSendMessage} className="flex space-x-3">
            <div className="flex-1">
              <Input
                ref={inputRef}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Digite sua mensagem..."
                className="border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                disabled={!isConnected}
              />
            </div>
            <Button
              type="submit"
              disabled={!newMessage.trim() || !isConnected}
              className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>

          {/* Aviso se desconectado */}
          {!isConnected && (
            <p className="text-xs text-gray-500 mt-2">Conectando ao chat...</p>
          )}
        </div>
      </div>

      {/* Dicas de uso */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">
          💡 Dicas para o chat:
        </h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Use o chat para coordenar tarefas e discussões do board</li>
          <li>
            • Mensagens são sincronizadas em tempo real entre todos os membros
          </li>
          <li>• Mantenha o foco nas discussões relacionadas ao projeto</li>
        </ul>
      </div>
    </div>
  );
}
