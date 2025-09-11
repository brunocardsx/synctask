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

  if (loading) {
    return <div className="text-center py-8">Loading boards...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Your Boards</h1>
      {boards.length === 0 ? (
        <p className="text-gray-600">No boards found. Create one to get started!</p>
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
    </div>
  );
}