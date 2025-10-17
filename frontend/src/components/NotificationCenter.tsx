import React, {
  useEffect,
  useMemo,
  useState,
  useCallback,
  useContext,
} from "react";
import { Bell, Check, X, Loader2, Inbox } from "lucide-react";
import apiClient from "../services/api";
import { SocketContext } from "../context/SocketContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

type InviteRole = "MEMBER" | "ADMIN";
type InviteStatus = "PENDING" | "ACCEPTED" | "DECLINED" | "EXPIRED";

interface PendingInvite {
  id: string;
  email: string;
  role: InviteRole;
  status: InviteStatus;
  createdAt: string;
  board: {
    id: string;
    name: string;
  };
  inviter: {
    id: string;
    name: string;
    email: string;
  };
}

export function NotificationCenter() {
  const navigate = useNavigate();
  const socket = useContext(SocketContext);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [invites, setInvites] = useState<PendingInvite[]>([]);

  const pendingCount = useMemo(() => invites.length, [invites]);

  const loadInvites = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get<PendingInvite[]>("/invites/pending");
      setInvites(data || []);
    } catch (err: any) {
      // silencioso para não poluir a UI
      console.error("Erro ao carregar convites pendentes:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    loadInvites();
  }, [open, loadInvites]);

  useEffect(() => {
    if (!socket) return;

    const onNotification = (notification: any) => {
      // Quando chegar uma notificação, recarregar a lista se o centro estiver aberto
      if (open) {
        loadInvites();
      }
    };

    const onInviteSent = () => {
      if (open) {
        loadInvites();
      }
    };

    socket.on("notification", onNotification);
    socket.on("invite:sent", onInviteSent);

    return () => {
      socket.off("notification", onNotification);
      socket.off("invite:sent", onInviteSent);
    };
  }, [socket, open, loadInvites]);

  const handleAccept = async (inviteId: string, boardId: string) => {
    setActionLoadingId(inviteId);
    try {
      await apiClient.post(`/invites/${inviteId}/accept`);
      toast.success("Convite aceito! Você foi adicionado ao board.");
      // Remover da lista local
      setInvites((prev) => prev.filter((i) => i.id !== inviteId));
      // Navegar para o board
      if (boardId) navigate(`/board/${boardId}`);
    } catch (err: any) {
      const message =
        err?.response?.data?.message || "Erro ao aceitar convite.";
      toast.error(message);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDecline = async (inviteId: string) => {
    setActionLoadingId(inviteId);
    try {
      await apiClient.post(`/invites/${inviteId}/decline`);
      toast.message("Convite recusado.");
      setInvites((prev) => prev.filter((i) => i.id !== inviteId));
    } catch (err: any) {
      const message =
        err?.response?.data?.message || "Erro ao recusar convite.";
      toast.error(message);
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="relative">
      <button
        aria-label="Notificações"
        className="relative inline-flex items-center justify-center h-9 w-9 rounded-md border border-gray-200 bg-white hover:bg-gray-50"
        onClick={() => setOpen((v) => !v)}
      >
        <Bell className="h-5 w-5 text-gray-700" />
        {pendingCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center">
            {pendingCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-96 max-w-[92vw] rounded-md border border-gray-200 bg-white shadow-lg z-50">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <div className="font-semibold text-gray-800">Notificações</div>
            <button
              className="text-sm text-gray-500 hover:text-gray-700"
              onClick={loadInvites}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Atualizar"
              )}
            </button>
          </div>

          <div className="max-h-96 overflow-auto">
            {loading ? (
              <div className="p-6 flex items-center text-gray-600">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Carregando convites...
              </div>
            ) : invites.length === 0 ? (
              <div className="p-8 flex flex-col items-center text-gray-500">
                <Inbox className="h-8 w-8 mb-2" />
                <span>Sem convites pendentes</span>
              </div>
            ) : (
              invites.map((invite) => (
                <div key={invite.id} className="p-4 border-b border-gray-100">
                  <div className="text-sm text-gray-800">
                    <span className="font-medium">{invite.inviter.name}</span>{" "}
                    convidou você para o board
                    <span className="font-semibold">
                      {" "}
                      "{invite.board.name}"
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Papel:{" "}
                    {invite.role === "ADMIN" ? "Administrador" : "Membro"}
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <button
                      className="inline-flex items-center px-3 py-1.5 rounded-md bg-green-600 text-white text-sm hover:bg-green-700 disabled:opacity-60"
                      onClick={() => handleAccept(invite.id, invite.board.id)}
                      disabled={actionLoadingId === invite.id}
                    >
                      {actionLoadingId === invite.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Check className="h-4 w-4 mr-1" /> Aceitar
                        </>
                      )}
                    </button>
                    <button
                      className="inline-flex items-center px-3 py-1.5 rounded-md border border-gray-300 text-gray-700 text-sm hover:bg-gray-50 disabled:opacity-60"
                      onClick={() => handleDecline(invite.id)}
                      disabled={actionLoadingId === invite.id}
                    >
                      {actionLoadingId === invite.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <X className="h-4 w-4 mr-1" /> Recusar
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
