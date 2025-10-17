import * as boardsService from '../../api/boards/boards.service.js';

jest.mock('../../config/prisma.js', () => ({
  __esModule: true,
  default: {
    board: {
      findMany: jest.fn(),
    },
  },
}));

// @ts-expect-error - import after mock
import prisma from '../../config/prisma.js';

describe('boards.service.getBoardsForUser', () => {
  it('retorna boards onde o usuário é owner ou membro', async () => {
    (prisma.board.findMany as jest.Mock).mockResolvedValueOnce([
      {
        id: 'b1',
        name: 'Owner Board',
        ownerId: 'u1',
        _count: { members: 1, columns: 0 },
      },
      {
        id: 'b2',
        name: 'Member Board',
        ownerId: 'u2',
        _count: { members: 3, columns: 2 },
      },
    ]);

    const result = await boardsService.getBoardsForUser('u1');

    expect(prisma.board.findMany).toHaveBeenCalledWith({
      where: {
        OR: [{ ownerId: 'u1' }, { members: { some: { userId: 'u1' } } }],
      },
      orderBy: { createdAt: 'desc' },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        _count: { select: { members: true, columns: true } },
      },
    });
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe('b1');
    expect(result[1].id).toBe('b2');
  });
});
