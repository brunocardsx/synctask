import React, { useState, useEffect } from 'react';
import { useSocket } from '../hooks/useSocket';
import apiClient from '../services/api';

interface Member {
  userId: string;
  boardId: string;
  role: 'ADMIN' | 'MEMBER';
  joinedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

interface MembersModalProps {
  boardId: string;
  isOpen: boolean;
  onClose: () => void;
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
  };
}

export function MembersModal({ boardId, isOpen, onClose, currentUser, onUserRoleUpdated, boardOwner }: MembersModalProps) {
  const socket = useSocket();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState<'ADMIN' | 'MEMBER'>('MEMBER');
  const [isAdding, setIsAdding] = useState(false);

  // Buscar membros quando o modal abrir
  useEffect(() => {
    if (isOpen) {
      fetchMembers();
    }
  }, [isOpen, boardId]);

  // Configurar listeners de WebSocket
  useEffect(() => {
    if (socket && isOpen) {
      // Listener para quando um membro é adicionado
      socket.on('memberAdded', (data: { boardId: string; member: Member }) => {
        if (data.boardId === boardId) {
          setMembers(prev => [...prev, data.member]);
        }
      });

      // Listener para quando um membro é removido
      socket.on('memberRemoved', (data: { boardId: string; memberId: string }) => {
        if (data.boardId === boardId) {
          setMembers(prev => prev.filter(member => member.userId !== data.memberId));
        }
      });

      // Listener para quando o role de um membro é atualizado
      socket.on('memberRoleUpdated', (data: { boardId: string; member: Member }) => {
        if (data.boardId === boardId) {
          setMembers(prev => prev.map(member => 
            member.userId === data.member.userId ? data.member : member
          ));
        }
      });

      return () => {
        socket.off('memberAdded');
        socket.off('memberRemoved');
        socket.off('memberRoleUpdated');
      };
    }
  }, [socket, isOpen, boardId]);

  const fetchMembers = async () => {
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const token = localStorage.getItem('authToken');
      const response = await apiClient.get(`/boards/${boardId}/members`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMembers(response.data);
      
      // Verificar se o usuário atual é admin
      const currentMember = response.data.find((member: Member) => member.userId === currentUser.userId);
      if (currentMember && currentMember.role === 'ADMIN') {
        onUserRoleUpdated(true);
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Erro ao carregar membros';
      setError(errorMessage);
      console.error('Erro ao carregar membros:', err);
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
      const token = localStorage.getItem('authToken');
      const response = await apiClient.post(`/boards/${boardId}/members`, {
        email: newMemberEmail,
        role: newMemberRole
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setMembers(prev => [...prev, response.data]);
      setNewMemberEmail('');
      setShowAddForm(false);
      setSuccessMessage('Membro adicionado com sucesso!');
      
      // Limpar mensagem de sucesso após 3 segundos
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Erro ao adicionar membro';
      setError(errorMessage);
      console.error('Erro ao adicionar membro:', err);
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!confirm('Tem certeza que deseja remover este membro?')) return;

    setError(null);
    setSuccessMessage(null);
    try {
      const token = localStorage.getItem('authToken');
      await apiClient.delete(`/boards/${boardId}/members/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setMembers(prev => prev.filter(member => member.userId !== userId));
      setSuccessMessage('Membro removido com sucesso!');
      
      // Limpar mensagem de sucesso após 3 segundos
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Erro ao remover membro';
      setError(errorMessage);
      console.error('Erro ao remover membro:', err);
    }
  };

  const handleUpdateRole = async (userId: string, newRole: 'ADMIN' | 'MEMBER') => {
    setError(null);
    setSuccessMessage(null);
    try {
      const token = localStorage.getItem('authToken');
      await apiClient.put(`/boards/${boardId}/members/${userId}`, {
        role: newRole
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setMembers(prev => prev.map(member => 
        member.userId === userId ? { ...member, role: newRole } : member
      ));
      setSuccessMessage('Role atualizado com sucesso!');
      
      // Limpar mensagem de sucesso após 3 segundos
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Erro ao atualizar role';
      setError(errorMessage);
      console.error('Erro ao atualizar role:', err);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'bg-blue-100 text-blue-800';
      case 'MEMBER': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-hidden">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Gerenciar Membros</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {successMessage}
          </div>
        )}

        {/* Botão para adicionar membro - apenas para owners e admins */}
        {(currentUser.isOwner || currentUser.isAdmin) && (
          <div className="mb-4">
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
            >
              {showAddForm ? 'Cancelar' : '+ Adicionar Membro'}
            </button>
          </div>
        )}

        {/* Formulário para adicionar membro */}
        {showAddForm && (
          <form onSubmit={handleAddMember} className="mb-6 p-4 bg-gray-50 rounded">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                  className="w-full p-2 border rounded"
                  placeholder="usuario@exemplo.com"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Role</label>
                <select
                  value={newMemberRole}
                  onChange={(e) => setNewMemberRole(e.target.value as 'ADMIN' | 'MEMBER')}
                  className="w-full p-2 border rounded"
                >
                  <option value="MEMBER">Membro</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={isAdding}
                  className="w-full bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
                >
                  {isAdding ? 'Adicionando...' : 'Adicionar'}
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Proprietário do Board */}
        {boardOwner && (
          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Proprietário do Board</h3>
            <div className="flex items-center justify-between p-3 bg-purple-50 border border-purple-200 rounded">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-purple-300 rounded-full flex items-center justify-center">
                  {boardOwner.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-medium">{boardOwner.name}</div>
                  <div className="text-sm text-gray-500">{boardOwner.email}</div>
                </div>
              </div>
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                Proprietário
              </span>
            </div>
          </div>
        )}

        {/* Lista de membros */}
        <div className="mb-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Membros do Board</h3>
          <div className="overflow-y-auto max-h-96">
            {loading ? (
              <div className="text-center py-4">Carregando membros...</div>
            ) : members.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                Nenhum membro encontrado
              </div>
            ) : (
              <div className="space-y-3">
                {members.map((member) => (
                  <div key={member.userId} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                        {member.user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium">{member.user.name}</div>
                        <div className="text-sm text-gray-500">{member.user.email}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(member.role)}`}>
                        {member.role === 'ADMIN' ? 'Admin' : 'Membro'}
                      </span>
                      
                      {/* Controles de gerenciamento - apenas para owners e admins */}
                      {(currentUser.isOwner || currentUser.isAdmin) && (
                        <div className="flex space-x-1">
                          <select
                            value={member.role}
                            onChange={(e) => handleUpdateRole(member.userId, e.target.value as 'ADMIN' | 'MEMBER')}
                            className="text-xs border rounded px-2 py-1"
                          >
                            <option value="MEMBER">Membro</option>
                            <option value="ADMIN">Admin</option>
                          </select>
                          
                          <button
                            onClick={() => handleRemoveMember(member.userId)}
                            className="text-red-500 hover:text-red-700 text-xs px-2 py-1"
                          >
                            Remover
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 pt-4 border-t">
          <button
            onClick={onClose}
            className="w-full bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}

