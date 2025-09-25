import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../services/api';

interface Board {
  id: string;
  name: string;
}

export default function DashboardPage() {
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newBoardName, setNewBoardName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    const fetchBoards = async () => {
      try {
        const authToken = localStorage.getItem('authToken');
        if (!authToken) {
          setError('No authentication token found.');
          setLoading(false);
          return;
        }

        const response = await apiClient.get('/boards', {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });
        setBoards(response.data);
      } catch (err) {
        console.error('Failed to fetch boards:', err);
        setError('Failed to load boards. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchBoards();
  }, []);

  const handleCreateBoard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBoardName.trim()) return;

    setIsCreating(true);
    try {
      const authToken = localStorage.getItem('authToken');
      const response = await apiClient.post('/boards', {
        name: newBoardName.trim()
      }, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      setBoards(prev => [...prev, response.data]);
      setNewBoardName('');
      setShowCreateModal(false);
    } catch (error) {
      console.error('Erro ao criar board:', error);
      alert('Erro ao criar board. Tente novamente.');
    } finally {
      setIsCreating(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading boards...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Your Boards</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
        >
          + Create Board
        </button>
      </div>
      
      {boards.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">No boards found. Create one to get started!</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Create Your First Board
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {boards.map((board) => (
            <Link key={board.id} to={`/board/${board.id}`}>
              <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow cursor-pointer">
                <h2 className="text-xl font-semibold text-gray-800">{board.name}</h2>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Modal para criar board */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold mb-4">Create New Board</h2>
            
            <form onSubmit={handleCreateBoard}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Board Name
                </label>
                <input
                  type="text"
                  value={newBoardName}
                  onChange={(e) => setNewBoardName(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter board name"
                  autoFocus
                  disabled={isCreating}
                />
              </div>
              
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewBoardName('');
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                  disabled={isCreating}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating || !newBoardName.trim()}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                >
                  {isCreating ? 'Creating...' : 'Create Board'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}