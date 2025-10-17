import React, { useState } from "react";
import { X, Mail, UserPlus, AlertCircle } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import apiClient from "../services/api";

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  boardId: string;
  onInviteSent: () => void;
}

export function InviteMemberModal({
  isOpen,
  onClose,
  boardId,
  onInviteSent,
}: InviteMemberModalProps) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"MEMBER" | "ADMIN">("MEMBER");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setError(null);

    try {
      await apiClient.post(`/boards/${boardId}/invites`, {
        email: email.trim(),
        role,
      });

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setEmail("");
        setRole("MEMBER");
        onClose();
        onInviteSent();
      }, 2000);
    } catch (err: any) {
      console.error("Erro ao enviar convite:", err);

      let errorMessage = "Erro ao enviar convite. Tente novamente.";

      if (err.response?.status === 409) {
        errorMessage = "Este usuário já é membro do board.";
      } else if (err.response?.status === 404) {
        errorMessage = "Usuário não encontrado com este email.";
      } else if (err.response?.status === 403) {
        errorMessage = "Você não tem permissão para convidar membros.";
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setEmail("");
    setRole("MEMBER");
    setError(null);
    setSuccess(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <UserPlus className="h-6 w-6 text-purple-600 mr-3" />
            <h2 className="text-xl font-bold text-gray-900">Convidar Membro</h2>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {success ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Convite Enviado!
            </h3>
            <p className="text-gray-600">
              O convite foi enviado para <strong>{email}</strong>
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Buscar usuário por email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="bruno@teste.com, luan@teste.com..."
                className="w-full"
                required
                disabled={loading}
              />
              <p className="text-xs text-gray-500 mt-1">
                Digite o email do usuário que você quer convidar
              </p>
            </div>

            <div>
              <label
                htmlFor="role"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Função
              </label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value as "MEMBER" | "ADMIN")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                disabled={loading}
              >
                <option value="MEMBER">Membro</option>
                <option value="ADMIN">Administrador</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Administradores podem convidar outros membros e gerenciar o
                board
              </p>
            </div>

            {error && (
              <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-md">
                <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <div className="flex space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="flex-1"
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-purple-600 hover:bg-purple-700"
                disabled={loading || !email.trim()}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Enviando...
                  </>
                ) : (
                  <>
                    <Mail className="h-4 w-4 mr-2" />
                    Enviar Convite
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
