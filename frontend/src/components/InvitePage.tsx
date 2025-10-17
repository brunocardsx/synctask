import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  Users,
} from "lucide-react";
import apiClient from "../services/api";
import { Button } from "./ui/button";

interface InviteData {
  id: string;
  email: string;
  role: "ADMIN" | "MEMBER";
  status: "PENDING" | "ACCEPTED" | "DECLINED";
  createdAt: string;
  board: {
    id: string;
    name: string;
    description: string;
  };
  inviter: {
    id: string;
    name: string;
    email: string;
  };
}

export function InvitePage() {
  const { inviteId } = useParams<{ inviteId: string }>();
  const navigate = useNavigate();
  const [invite, setInvite] = useState<InviteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [action, setAction] = useState<"accept" | "decline" | null>(null);

  useEffect(() => {
    if (!inviteId) {
      setError("ID do convite não fornecido");
      setLoading(false);
      return;
    }

    // Simular carregamento do convite
    // Em uma implementação real, você faria uma requisição para buscar os dados do convite
    setTimeout(() => {
      setInvite({
        id: inviteId,
        email: "usuario@teste.com",
        role: "MEMBER",
        status: "PENDING",
        createdAt: new Date().toISOString(),
        board: {
          id: "board-123",
          name: "Board de Exemplo",
          description: "Um board para demonstrar o sistema de convites",
        },
        inviter: {
          id: "user-123",
          name: "Bruno Cardoso",
          email: "bruno@teste.com",
        },
      });
      setLoading(false);
    }, 1000);
  }, [inviteId]);

  const handleAccept = async () => {
    if (!inviteId) return;

    setProcessing(true);
    setAction("accept");

    try {
      await apiClient.post(`/api/invites/${inviteId}/accept`);
      setSuccess(true);

      // Redirecionar para o board após 2 segundos
      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
    } catch (err: any) {
      console.error("Erro ao aceitar convite:", err);
      setError(err.response?.data?.message || "Erro ao aceitar convite");
    } finally {
      setProcessing(false);
    }
  };

  const handleDecline = async () => {
    if (!inviteId) return;

    setProcessing(true);
    setAction("decline");

    try {
      await apiClient.post(`/api/invites/${inviteId}/decline`);
      setSuccess(true);

      // Redirecionar para login após 2 segundos
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err: any) {
      console.error("Erro ao recusar convite:", err);
      setError(err.response?.data?.message || "Erro ao recusar convite");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-purple-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Carregando convite...
          </h2>
          <p className="text-gray-600">Verificando detalhes do convite</p>
        </div>
      </div>
    );
  }

  if (error && !invite) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Convite Inválido
            </h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button
              onClick={() => navigate("/login")}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              Ir para Login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            {action === "accept" ? (
              <>
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Convite Aceito!
                </h2>
                <p className="text-gray-600 mb-6">
                  Você foi adicionado ao board "{invite?.board.name}".
                  Redirecionando para o dashboard...
                </p>
              </>
            ) : (
              <>
                <XCircle className="h-16 w-16 text-gray-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Convite Recusado
                </h2>
                <p className="text-gray-600 mb-6">
                  Você recusou o convite para o board "{invite?.board.name}".
                  Redirecionando...
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (!invite) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-lg w-full mx-4">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-purple-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Convite para Board
            </h1>
            <p className="text-gray-600">
              Você foi convidado para participar de um board no SyncTask
            </p>
          </div>

          <div className="space-y-6">
            {/* Informações do Board */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Board</h3>
              <p className="text-lg font-medium text-purple-600">
                {invite.board.name}
              </p>
              {invite.board.description && (
                <p className="text-gray-600 mt-1">{invite.board.description}</p>
              )}
            </div>

            {/* Informações do Convite */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Convite</h3>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Convidado por:</span>{" "}
                  {invite.inviter.name}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Função:</span>{" "}
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      invite.role === "ADMIN"
                        ? "bg-red-100 text-red-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {invite.role === "ADMIN" ? "Administrador" : "Membro"}
                  </span>
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Enviado em:</span>{" "}
                  {new Date(invite.createdAt).toLocaleDateString("pt-BR")}
                </p>
              </div>
            </div>

            {/* Ações */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            )}

            <div className="flex space-x-3">
              <Button
                onClick={handleDecline}
                variant="outline"
                className="flex-1"
                disabled={processing}
              >
                {processing && action === "decline" ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Recusando...
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4 mr-2" />
                    Recusar
                  </>
                )}
              </Button>
              <Button
                onClick={handleAccept}
                className="flex-1 bg-green-600 hover:bg-green-700"
                disabled={processing}
              >
                {processing && action === "accept" ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Aceitando...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Aceitar
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

