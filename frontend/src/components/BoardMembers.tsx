import { useState, useEffect } from 'react';
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

interface BoardMembersProps {
  boardId: string;
}

export function BoardMembers({ boardId }: BoardMembersProps) {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchMembers();
  }, [boardId]);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await apiClient.get(`/boards/${boardId}/members`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMembers(response.data.slice(0, 5)); // Mostrar apenas os primeiros 5
    } catch (err) {
      console.error('Erro ao carregar membros:', err);
    } finally {
      setLoading(false);
    }
  };


  if (loading) {
    return (
      <div className="flex items-center space-x-2 text-sm text-gray-500">
        <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
        <span>Carregando membros...</span>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm text-gray-600">Membros:</span>
      <div className="flex -space-x-2">
        {members.map((member) => (
          <div
            key={member.userId}
            className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-xs font-medium"
            style={{ backgroundColor: member.role === 'ADMIN' ? '#dbeafe' : '#f3f4f6' }}
            title={`${member.user.name} (${member.role === 'ADMIN' ? 'Admin' : 'Membro'})`}
          >
            {member.user.name.charAt(0).toUpperCase()}
          </div>
        ))}
      </div>
      {members.length > 5 && (
        <span className="text-xs text-gray-500">+{members.length - 5}</span>
      )}
    </div>
  );
}
