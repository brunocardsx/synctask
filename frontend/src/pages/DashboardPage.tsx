import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Grid3X3,
  Users,
  TrendingUp,
  Clock,
  Search,
  Filter,
  Settings,
  LogOut,
  User,
  Bell,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { BoardCard } from "@/components/BoardCard";
import { NotificationCenter } from "@/components/NotificationCenter";
import apiClient from "../services/api";

interface Board {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  memberCount?: number;
  isStarred?: boolean;
}

interface User {
  id: string;
  name: string;
  email: string;
}

interface DashboardStats {
  totalBoards: number;
  activeBoards: number;
  totalMembers: number;
  recentActivity: number;
}

export default function DashboardPage() {
  const navigate = useNavigate();

  // Verificar autenticação
  const authToken = localStorage.getItem("authToken");
  if (!authToken) {
    navigate("/login");
    return null;
  }

  // Estados
  const [boards, setBoards] = useState<Board[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newBoardName, setNewBoardName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [userProfileOpen, setUserProfileOpen] = useState(false);

  // Buscar dados do usuário e boards
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Buscar boards
        const boardsResponse = await apiClient.get("/boards", {
          headers: { Authorization: `Bearer ${authToken}` },
        });

        setBoards(boardsResponse.data);

        // Extrair informações do usuário do localStorage ou usar dados padrão
        const savedEmail = localStorage.getItem("userEmail");
        console.log("Email salvo no localStorage:", savedEmail); // Debug

        if (savedEmail) {
          const name = savedEmail.split("@")[0];
          setUser({
            id: "user-" + Date.now(),
            name: name.charAt(0).toUpperCase() + name.slice(1),
            email: savedEmail,
          });
        } else {
          // Fallback para dados padrão se não encontrar email salvo
          setUser({
            id: "default",
            name: "João",
            email: "joao@teste.com",
          });
        }
      } catch (err) {
        console.error("Failed to fetch data:", err);
        setError("Falha ao carregar dados. Tente novamente.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [authToken]);

  // Criar novo board
  const handleCreateBoard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBoardName.trim()) return;

    setIsCreating(true);
    try {
      const response = await apiClient.post(
        "/boards",
        {
          name: newBoardName.trim(),
        },
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );

      setBoards((prev) => [...prev, response.data]);
      setNewBoardName("");
      setShowCreateModal(false);
    } catch (error) {
      console.error("Erro ao criar board:", error);
      alert("Erro ao criar board. Tente novamente.");
    } finally {
      setIsCreating(false);
    }
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("tokenExpiresIn");
    localStorage.removeItem("userEmail");
    navigate("/login");
  };

  // Filtrar boards
  const filteredBoards = boards.filter((board) =>
    board.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Estatísticas
  const stats: DashboardStats = {
    totalBoards: boards.length,
    activeBoards: boards.length,
    totalMembers: boards.reduce(
      (acc, board) => acc + (board.memberCount || 1),
      0
    ),
    recentActivity: 0,
  };

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">❌ {error}</div>
          <Button onClick={() => window.location.reload()}>
            Tentar Novamente
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-purple-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo e Nome */}
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl flex items-center justify-center shadow-lg">
                <Grid3X3 className="h-6 w-6 text-white" />
                <Sparkles className="h-3 w-3 text-purple-200 absolute -top-1 -right-1 animate-pulse" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-700 to-purple-600 bg-clip-text text-transparent">
                  SyncTask
                </h1>
                <p className="text-sm text-gray-500">Dashboard</p>
              </div>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-lg mx-8 hidden md:block">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Buscar boards..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/70 border-purple-200 focus:border-purple-500 focus:ring-purple-500"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-3">
              {/* Notifications */}
              <NotificationCenter />

              {/* Create Board */}
              <Button
                onClick={() => setShowCreateModal(true)}
                className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Plus className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Novo Board</span>
              </Button>

              {/* User Profile */}
              <div className="relative">
                <Button
                  variant="ghost"
                  onClick={() => setUserProfileOpen(!userProfileOpen)}
                  className="flex items-center space-x-2"
                >
                  <div className="h-8 w-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {user?.name?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <span className="hidden md:block text-sm font-medium">
                    {user?.name || "Usuário"}
                  </span>
                </Button>

                {userProfileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-purple-100 py-2 z-50">
                    <div className="px-4 py-2 border-b border-purple-100">
                      <p className="text-sm font-medium text-gray-900">
                        {user?.name || "Usuário"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {user?.email || "email@exemplo.com"}
                      </p>
                    </div>
                    <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      Meu Perfil
                    </button>
                    <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 flex items-center">
                      <Settings className="h-4 w-4 mr-2" />
                      Configurações
                    </button>
                    <hr className="my-2" />
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sair
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Bem-vindo de volta! 👋
          </h2>
          <p className="text-gray-600">
            Gerencie seus boards e colabore com sua equipe em tempo real
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/70 backdrop-blur-sm border-purple-200 hover:shadow-lg transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 rounded-xl">
                  <Grid3X3 className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Total de Boards
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.totalBoards}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-purple-200 hover:shadow-lg transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-xl">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Boards Ativos
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.activeBoards}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-purple-200 hover:shadow-lg transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Colaboradores
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.totalMembers}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-purple-200 hover:shadow-lg transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-orange-100 rounded-xl">
                  <Clock className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Atividade Recente
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.recentActivity}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Boards Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                Meus Boards
              </h3>
              <p className="text-gray-600">
                {filteredBoards.length}{" "}
                {filteredBoards.length === 1 ? "board" : "boards"} encontrado
                {filteredBoards.length !== 1 ? "s" : ""}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filtrar
              </Button>
            </div>
          </div>

          {/* Boards Grid */}
          {filteredBoards.length === 0 ? (
            <Card className="bg-white/70 backdrop-blur-sm border-purple-200">
              <CardContent className="p-12 text-center">
                <div className="max-w-md mx-auto">
                  <div className="h-24 w-24 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Grid3X3 className="h-12 w-12 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {searchTerm
                      ? "Nenhum board encontrado"
                      : "Nenhum board ainda"}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {searchTerm
                      ? "Tente ajustar sua busca ou criar um novo board"
                      : "Crie seu primeiro board para começar a organizar suas tarefas"}
                  </p>
                  <Button
                    onClick={() => setShowCreateModal(true)}
                    className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Primeiro Board
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredBoards.map((board) => (
                <BoardCard
                  key={board.id}
                  board={board}
                  onStar={(boardId) => {
                    // TODO: Implementar favoritar board
                    console.log("Star board:", boardId);
                  }}
                  onMore={(boardId) => {
                    // TODO: Implementar menu de opções
                    console.log("More options for board:", boardId);
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Create Board Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md bg-white/95 backdrop-blur-xl border-purple-200 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-900">
                Criar Novo Board
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateBoard} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome do Board
                  </label>
                  <Input
                    type="text"
                    value={newBoardName}
                    onChange={(e) => setNewBoardName(e.target.value)}
                    placeholder="Ex: Projeto Marketing"
                    className="border-purple-200 focus:border-purple-500 focus:ring-purple-500"
                    autoFocus
                    disabled={isCreating}
                  />
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowCreateModal(false);
                      setNewBoardName("");
                    }}
                    disabled={isCreating}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={isCreating || !newBoardName.trim()}
                    className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white"
                  >
                    {isCreating ? "Criando..." : "Criar Board"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
