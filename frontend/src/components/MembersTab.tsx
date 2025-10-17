import React, { useState, useEffect } from "react";
import { useSocket } from "../hooks/useSocket";
import apiClient from "../services/api";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { InviteMemberModal } from "./InviteMemberModal";
import {
  UserPlus,
  Mail,
  Shield,
  User,
  Trash2,
  Crown,
  Users,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";

interface Member {
  userId: string;
  boardId: string;
  role: "ADMIN" | "MEMBER";
  joinedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

interface MembersTabProps {
  boardId: string;
  currentUser: {
    userId: string | null;
    isOwner: boolean;
    isAdmin: boolean;
  };
  onUserRoleUpdated: (isAdmin: boolean) => void;
  boardOwner?: {
    id: string;
    name: string;
    email: string;
  } | null;
}

export function MembersTab({
  boardId,
  currentUser,
  onUserRoleUpdated,
  boardOwner,
}: MembersTabProps) {
  const socket = useSocket();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [newMemberRole, setNewMemberRole] = useState<"ADMIN" | "MEMBER">(
    "MEMBER"
  );
  const [isAdding, setIsAdding] = useState(false);

  // Buscar membros quando o componente montar
  useEffect(() => {
    fetchMembers();
  }, [boardId]);

  // Configurar listeners de WebSocket
  useEffect(() => {
    if (socket) {
      // Listener para quando um membro é adicionado
      socket.on("memberAdded", (data: { boardId: string; member: Member }) => {
        if (data.boardId === boardId) {
          setMembers((prev) => [...prev, data.member]);
          setSuccessMessage("Novo membro adicionado!");
          setTimeout(() => setSuccessMessage(null), 3000);
        }
      });

      // Listener para quando um membro é removido
      socket.on(
        "memberRemoved",
        (data: { boardId: string; memberId: string }) => {
          if (data.boardId === boardId) {
            setMembers((prev) =>
              prev.filter((member) => member.userId !== data.memberId)
            );
            setSuccessMessage("Membro removido!");
            setTimeout(() => setSuccessMessage(null), 3000);
          }
        }
      );

      // Listener para quando o role de um membro é atualizado
      socket.on(
        "memberRoleUpdated",
        (data: { boardId: string; member: Member }) => {
          if (data.boardId === boardId) {
            setMembers((prev) =>
              prev.map((member) =>
                member.userId === data.member.userId ? data.member : member
              )
            );
            setSuccessMessage("Permissões atualizadas!");
            setTimeout(() => setSuccessMessage(null), 3000);
          }
        }
      );

      return () => {
        socket.off("memberAdded");
        socket.off("memberRemoved");
        socket.off("memberRoleUpdated");
      };
    }
  }, [socket, boardId]);

  const fetchMembers = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("authToken");
      const response = await apiClient.get(`/boards/${boardId}/members`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMembers(response.data);

      // Verificar se o usuário atual é admin
      const currentMember = response.data.find(
        (member: Member) => member.userId === currentUser.userId
      );
      if (currentMember && currentMember.role === "ADMIN") {
        onUserRoleUpdated(true);
      }
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Erro ao carregar membros";
      setError(errorMessage);
      console.error("Erro ao carregar membros:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberEmail.trim()) return;

    setIsAdding(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const token = localStorage.getItem("authToken");
      const response = await apiClient.post(
        `/boards/${boardId}/members`,
        {
          email: newMemberEmail,
          role: newMemberRole,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setMembers((prev) => [...prev, response.data]);
      setNewMemberEmail("");
      setShowAddForm(false);
      setSuccessMessage("Membro adicionado com sucesso!");

      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Erro ao adicionar membro";
      setError(errorMessage);
      console.error("Erro ao adicionar membro:", err);
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!confirm("Tem certeza que deseja remover este membro?")) return;

    console.log(`🗑️ Debug removeMember:`);
    console.log(`- userId: ${userId}`);
    console.log(`- boardId: ${boardId}`);

    setError(null);
    setSuccessMessage(null);
    try {
      const token = localStorage.getItem("authToken");
      await apiClient.delete(`/boards/${boardId}/members/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setMembers((prev) => prev.filter((member) => member.userId !== userId));
      setSuccessMessage("Membro removido com sucesso!");

      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error("Erro ao remover membro:", err);

      let errorMessage = "Erro ao remover membro.";

      if (err.response?.status === 404) {
        errorMessage = "Membro não encontrado neste board.";
      } else if (err.response?.status === 403) {
        errorMessage = "Você não tem permissão para remover membros.";
      } else if (err.response?.status === 400) {
        errorMessage = "Dados inválidos para remoção do membro.";
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }

      setError(errorMessage);
    }
  };

  const handleUpdateRole = async (
    userId: string,
    newRole: "ADMIN" | "MEMBER"
  ) => {
    setError(null);
    setSuccessMessage(null);
    try {
      const token = localStorage.getItem("authToken");
      await apiClient.put(
        `/boards/${boardId}/members/${userId}`,
        {
          role: newRole,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setMembers((prev) =>
        prev.map((member) =>
          member.userId === userId ? { ...member, role: newRole } : member
        )
      );
      setSuccessMessage("Permissões atualizadas!");

      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Erro ao atualizar permissões";
      setError(errorMessage);
      console.error("Erro ao atualizar role:", err);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "ADMIN":
        return <Shield className="h-4 w-4 text-blue-500" />;
      case "MEMBER":
        return <User className="h-4 w-4 text-gray-500" />;
      default:
        return <User className="h-4 w-4 text-gray-500" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "MEMBER":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
        <span className="ml-2 text-gray-600">Carregando membros...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Users className="h-6 w-6 mr-2 text-purple-500" />
            Membros do Board
          </h2>
          <p className="text-gray-600 mt-1">
            Gerencie quem tem acesso ao board e suas permissões
          </p>
        </div>

        {/* Botão para adicionar membro */}
        {(currentUser.isOwner || currentUser.isAdmin) && (
          <Button
            onClick={() => setShowInviteModal(true)}
            className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Convidar Membro
          </Button>
        )}

        {/* Debug info - remover depois */}
        {process.env.NODE_ENV === "development" && (
          <div className="text-xs text-gray-500 mt-2">
            Debug: isOwner={currentUser.isOwner?.toString()}, isAdmin=
            {currentUser.isAdmin?.toString()}
          </div>
        )}
      </div>

      {/* Alertas */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
          <AlertCircle className="h-5 w-5 text-red-500 mr-3" />
          <span className="text-red-700">{error}</span>
        </div>
      )}

      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
          <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
          <span className="text-green-700">{successMessage}</span>
        </div>
      )}

      {/* Formulário para adicionar membro */}
      {showAddForm && (
        <div className="bg-white rounded-xl border border-purple-100 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Mail className="h-5 w-5 mr-2 text-purple-500" />
            Convidar Novo Membro
          </h3>
          <form onSubmit={handleAddMember} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email do Membro
                </label>
                <Input
                  type="email"
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                  placeholder="usuario@exemplo.com"
                  required
                  className="border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Permissões
                </label>
                <select
                  value={newMemberRole}
                  onChange={(e) =>
                    setNewMemberRole(e.target.value as "ADMIN" | "MEMBER")
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-purple-500 focus:ring-purple-500"
                >
                  <option value="MEMBER">Membro</option>
                  <option value="ADMIN">Administrador</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAddForm(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isAdding}
                className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
              >
                {isAdding ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Adicionando...
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Adicionar Membro
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Proprietário do Board */}
      {boardOwner && (
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Crown className="h-5 w-5 mr-2 text-purple-500" />
            Proprietário do Board
          </h3>
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
              {boardOwner.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="font-semibold text-gray-900">
                {boardOwner.name}
              </div>
              <div className="text-gray-600">{boardOwner.email}</div>
            </div>
            <div className="ml-auto">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800 border border-purple-200">
                <Crown className="h-4 w-4 mr-1" />
                Proprietário
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Lista de membros */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Membros ({members.length})
          </h3>
        </div>
        <div className="divide-y divide-gray-200">
          {members.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">Nenhum membro encontrado</p>
              <p className="text-sm">
                Adicione membros para colaborar no board
              </p>
            </div>
          ) : (
            members.map((member) => (
              <div
                key={member.userId}
                className="p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center text-white font-medium">
                      {member.user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">
                        {member.user.name}
                      </div>
                      <div className="text-gray-600">{member.user.email}</div>
                      <div className="text-xs text-gray-500">
                        Membro desde{" "}
                        {new Date(member.joinedAt).toLocaleDateString("pt-BR")}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getRoleColor(member.role)}`}
                    >
                      {getRoleIcon(member.role)}
                      <span className="ml-1">
                        {member.role === "ADMIN" ? "Administrador" : "Membro"}
                      </span>
                    </span>

                    {/* Controles de gerenciamento */}
                    {(currentUser.isOwner || currentUser.isAdmin) && (
                      <div className="flex items-center space-x-2">
                        <select
                          value={member.role}
                          onChange={(e) =>
                            handleUpdateRole(
                              member.userId,
                              e.target.value as "ADMIN" | "MEMBER"
                            )
                          }
                          className="text-sm border border-gray-200 rounded-lg px-2 py-1 focus:border-purple-500 focus:ring-purple-500"
                        >
                          <option value="MEMBER">Membro</option>
                          <option value="ADMIN">Administrador</option>
                        </select>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveMember(member.userId)}
                          className="text-red-600 border-red-200 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal de convite */}
      <InviteMemberModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        boardId={boardId}
        onInviteSent={() => {
          // Recarregar lista de membros após convite enviado
          fetchMembers();
        }}
      />
    </div>
  );
}
