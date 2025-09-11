import request from 'supertest';
import app from '../app.js';
import prisma from '../config/prisma.js';
import jwt from 'jsonwebtoken';

/**
 * Limpa as tabelas antes de cada conjunto de testes para garantir um estado limpo.
 */
beforeAll(async () => {
  // Limpa na ordem correta: primeiro filhos, depois pais
  await prisma.column.deleteMany({});
  await prisma.board.deleteMany({});
  await prisma.user.deleteMany({});
});


afterAll(async () => {
  await prisma.$disconnect();
});

describe('POST /api/boards/:boardId/columns', () => {
  let token: string;
  let boardId: string;
  let userId: string;

  // Cria um usuário e um board padrão antes de cada teste neste bloco
  beforeEach(async () => {
    const user = await prisma.user.create({
      data: {
        name: 'Column Tester',
        email: `tester-${Date.now()}-${Math.random()}@example.com`,
        password: 'password123',
      },
    });
    userId = user.id;
    token = jwt.sign({ userId }, process.env.JWT_SECRET || 'default-secret');

    const board = await prisma.board.create({
      data: {
        name: 'Test Board for Columns',
        ownerId: userId,
      },
    });
    boardId = board.id;
  });

  it('should allow an authenticated board owner to create a column', async () => {
    // Arrange
    const columnData = { title: 'To Do' };

    // Act
    const res = await request(app)
      .post(`/api/boards/${boardId}/columns`)
      .set('Authorization', `Bearer ${token}`)
      .send(columnData);

    // Assert
    expect(res.statusCode).toEqual(201);
    expect(res.body.title).toBe(columnData.title);
    expect(res.body).toHaveProperty('id');
    expect(res.body.boardId).toBe(boardId);
  });

  it('should return 401 Unauthorized if no token is provided', async () => {
    // Act
    const res = await request(app)
      .post(`/api/boards/${boardId}/columns`)
      .send({ title: 'Unauthorized Column' });

    // Assert
    expect(res.statusCode).toEqual(401);
  });

  it('should return 404 Not Found if a user tries to add a column to a board they do not own', async () => {
    // Arrange: Crie um segundo usuário (o "invasor")
    const intruder = await prisma.user.create({
      data: {
        name: 'Intruder',
        email: `intruder-${Date.now()}@example.com`,
        password: 'password123',
      },
    });
    const intruderToken = jwt.sign({ userId: intruder.id }, process.env.JWT_SECRET || 'default-secret');

    // Act: O "invasor" tenta adicionar uma coluna ao board do primeiro usuário
    const res = await request(app)
      .post(`/api/boards/${boardId}/columns`)
      .set('Authorization', `Bearer ${intruderToken}`)
      .send({ title: 'Malicious Column' });

    // Assert
    expect(res.statusCode).toEqual(404);
  });

  it('should return 404 Not Found if the board does not exist', async () => {
    // Arrange
    const nonExistentBoardId = 'clq0m0000000000000000000'; // ID com formato válido, mas inexistente

    // Act
    const res = await request(app)
      .post(`/api/boards/${nonExistentBoardId}/columns`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Column for Ghost Board' });

    // Assert
    expect(res.statusCode).toEqual(404);
  });
});