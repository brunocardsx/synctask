import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Clock, MoreVertical, Star, Eye, Calendar } from "lucide-react";
import { useState } from "react";

interface Board {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  memberCount?: number;
  isStarred?: boolean;
}

interface BoardCardProps {
  board: Board;
  onStar?: (boardId: string) => void;
  onMore?: (boardId: string) => void;
}

export function BoardCard({ board, onStar, onMore }: BoardCardProps) {
  const [isStarred, setIsStarred] = useState(board.isStarred || false);

  const handleStar = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsStarred(!isStarred);
    onStar?.(board.id);
  };

  const handleMore = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onMore?.(board.id);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "Hoje";
    if (diffDays === 2) return "Ontem";
    if (diffDays <= 7) return `${diffDays} dias atrás`;

    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
    });
  };

  return (
    <Link to={`/board/${board.id}`}>
      <Card className="bg-white/70 backdrop-blur-sm border-purple-200 hover:shadow-xl hover:scale-105 transition-all duration-200 group cursor-pointer h-full">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg font-semibold text-gray-900 group-hover:text-purple-700 transition-colors line-clamp-2">
              {board.name}
            </CardTitle>
            <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handleStar}
              >
                <Star
                  className={`h-4 w-4 transition-colors ${
                    isStarred
                      ? "text-yellow-500 fill-current"
                      : "text-gray-400 hover:text-yellow-500"
                  }`}
                />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handleMore}
              >
                <MoreVertical className="h-4 w-4 text-gray-400 hover:text-gray-600" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0 space-y-4">
          {/* Board Stats */}
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <Users className="h-4 w-4 mr-1" />
                <span>{board.memberCount || 1}</span>
              </div>
              <div className="flex items-center">
                <Eye className="h-4 w-4 mr-1" />
                <span>Público</span>
              </div>
            </div>
            <div className="flex items-center text-xs">
              <Clock className="h-3 w-3 mr-1" />
              <span>{formatDate(board.updatedAt)}</span>
            </div>
          </div>

          {/* Progress Bar (simulado) */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-gray-500">
              <span>Progresso</span>
              <span>75%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ width: "75%" }}
              ></div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center text-xs text-gray-500">
              <Calendar className="h-3 w-3 mr-1" />
              <span>Criado {formatDate(board.createdAt)}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 text-xs"
            >
              Abrir
            </Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
