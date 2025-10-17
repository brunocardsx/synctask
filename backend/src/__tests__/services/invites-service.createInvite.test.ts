import * as inviteService from '../../api/invites/invite.service.js';

jest.mock('../../config/prisma.js', () => ({
  __esModule: true,
  default: {
    board: { findUnique: jest.fn(), findFirst: jest.fn() },
    boardMember: { findUnique: jest.fn() },
    user: { findUnique: jest.fn() },
    $transaction: (fn: any) =>
      fn({
        boardInvite: { findFirst: jest.fn(), create: jest.fn() },
        notification: { create: jest.fn() },
      }),
  },
}));

// @ts-expect-error - import after mock
import prisma from '../../config/prisma.js';

jest.mock('../../socket.js', () => ({
  __esModule: true,
  getIO: () => ({
    sockets: { adapter: { rooms: new Map() } },
    to: () => ({ emit: jest.fn() }),
  }),
}));

describe('invite.service.createInvite', () => {
  const board = {
    id: 'b1',
    name: 'Board',
    ownerId: 'owner1',
    owner: { id: 'owner1', name: 'Owner', email: 'owner@x.com' },
  };

  beforeEach(() => {
    (prisma.board.findUnique as jest.Mock).mockReset();
    (prisma.boardMember.findUnique as jest.Mock).mockReset();
    (prisma.user.findUnique as jest.Mock).mockReset();
  });

  it('lança 404 se usuário convidado não existe', async () => {
    (prisma.board.findUnique as jest.Mock).mockResolvedValue(board);
    (prisma.board.findFirst as jest.Mock).mockResolvedValue({ id: 'b1' });
    (prisma.boardMember.findUnique as jest.Mock).mockResolvedValue({
      userId: 'owner1',
      boardId: 'b1',
      role: 'ADMIN',
    });
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

    await expect(
      inviteService.createInvite('b1', 'no@user.com', 'MEMBER', 'owner1')
    ).rejects.toMatchObject({ statusCode: 404 });
  });

  it('lança 409 se usuário já é membro', async () => {
    (prisma.board.findUnique as jest.Mock).mockResolvedValue(board);
    (prisma.board.findFirst as jest.Mock).mockResolvedValue({ id: 'b1' });
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: 'u2',
      email: 'u2@x.com',
    });
    // Sequência: 1) checkInvitePermission -> boardMember.findUnique (ADMIN), 2) checkIfUserIsMember -> boardMember.findUnique (membro já existe)
    (prisma.boardMember.findUnique as jest.Mock)
      .mockResolvedValueOnce({ userId: 'owner1', boardId: 'b1', role: 'ADMIN' })
      .mockResolvedValueOnce({ userId: 'u2', boardId: 'b1', role: 'MEMBER' });

    await expect(
      inviteService.createInvite('b1', 'u2@x.com', 'MEMBER', 'owner1')
    ).rejects.toMatchObject({ statusCode: 409 });
  });
});
