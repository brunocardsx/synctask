import request from 'supertest';
import app from '../app.js';
import prisma from '../config/prisma.js';
import jwt from 'jsonwebtoken';

beforeAll(async () => {
  // Limpeza em ordem de dependência para evitar erros de chave estrangeira
  await prisma.card.deleteMany({});
  await prisma.column.deleteMany({});
  await prisma.board.deleteMany({});
  await prisma.user.deleteMany({});
});


afterAll(async () => {
  await prisma.$disconnect();
});

describe('PATCH /api/cards/:cardId/move', () => {
  let token: string;
  let userId: string;
  let boardId: string;
  let columnAId: string;
  let columnBId: string;
  let cardToMoveId: string;

  // Cria um cenário completo com usuário, board, colunas e cards antes dos testes
  beforeEach(async () => {
    // 1. Criar Usuário e Token
    const user = await prisma.user.create({
      data: {
        name: 'Card Mover',
        email: `mover-${Date.now()}-${Math.random()}@example.com`,
        password: 'password',
      },
    });
    userId = user.id;
    token = jwt.sign({ userId }, process.env.JWT_SECRET || 'default-secret');

    // 2. Criar Board
    const board = await prisma.board.create({
      data: { name: 'Board for Moving Cards', ownerId: userId },
    });
    boardId = board.id;

    // 3. Criar Colunas
    const columnA = await prisma.column.create({
      data: { boardId, title: 'Column A', order: 0 },
    });
    columnAId = columnA.id;
    const columnB = await prisma.column.create({
      data: { boardId, title: 'Column B', order: 1 },
    });
    columnBId = columnB.id;

    // 4. Criar Cards na Coluna A
    await prisma.card.create({ data: { columnId: columnAId, title: 'Card A1', order: 0 } });
    const cardA2 = await prisma.card.create({ data: { columnId: columnAId, title: 'Card A2', order: 1 } });
    cardToMoveId = cardA2.id;
    await prisma.card.create({ data: { columnId: columnAId, title: 'Card A3', order: 2 } });
  });

  it('should allow a user to move a card to a different column', async () => {
    // Arrange: Mover Card A2 para o topo (ordem 0) da Coluna B
    const moveData = {
      newColumnId: columnBId,
      newOrder: 0,
    };

    // Act
    const res = await request(app)
      .patch(`/api/cards/${cardToMoveId}/move`)
      .set('Authorization', `Bearer ${token}`)
      .send(moveData);

    // Assert
    expect(res.statusCode).toEqual(200);

    // Assert DB State: Verifique se o card está na nova coluna e com a nova ordem
    const movedCard = await prisma.card.findUnique({ where: { id: cardToMoveId } });
    expect(movedCard?.columnId).toBe(columnBId);
    expect(movedCard?.order).toBe(moveData.newOrder);
  });

  it('should NOT allow a user to move a card they do not own', async () => {
    // Arrange: Crie um "invasor"
    const intruder = await prisma.user.create({
      data: { name: 'Intruder', email: `intruder-${Date.now()}@example.com`, password: 'p' },
    });
    const intruderToken = jwt.sign({ userId: intruder.id }, process.env.JWT_SECRET || 'default-secret');

    // Act: Invasor tenta mover um card do usuário original
    const res = await request(app)
      .patch(`/api/cards/${cardToMoveId}/move`)
      .set('Authorization', `Bearer ${intruderToken}`)
      .send({ newColumnId: columnAId, newOrder: 0 });

    // Assert
    expect(res.statusCode).toEqual(404); // Retorna 404 para não vazar informação
  });
  
  it('should return 401 Unauthorized if no token is provided', async () => {
    const res = await request(app)
      .patch(`/api/cards/${cardToMoveId}/move`)
      .send({ newColumnId: columnBId, newOrder: 0 });
      
    expect(res.statusCode).toEqual(401);
  });
});