import request from 'supertest';
import app from '../app.js';
import { PrismaClient } from '@prisma/client';
import { describe, it, expect, beforeEach } from '@jest/globals';
import jwt from 'jsonwebtoken';

import prisma from '../config/prisma.js';

/**
 * Limpa as tabelas de board e user antes de cada teste para garantir isolamento.
 */
beforeAll(async () => {
  await prisma.board.deleteMany({});
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('POST /api/boards', () => {
  it('should allow an authenticated user to create a board', async () => {
    // --- Arrange ---
    // 1. Registre um usuário via API para garantir que ele exista e esteja autenticado.
    const userCredentials = {
        name: 'Board Creator',
        email: 'creator@example.com',
        password: 'password123',
    };
    const registerRes = await request(app).post('/api/auth/register').send(userCredentials);
    const token = registerRes.body.token;
    const user = { id: registerRes.body.userId }; // Assuming the register response returns userId

    // 3. Prepare os dados para o novo board.
    const boardData = { name: 'My New Project Board' };

    // --- Act ---
    // 4. Faça a requisição para criar o board, enviando o token no header.
    const res = await request(app)
      .post('/api/boards')
      .set('Authorization', `Bearer ${token}`)
      .send(boardData);

    // --- Assert ---
    // 5. Verifique se a resposta está correta.
    expect(res.statusCode).toEqual(201);
    expect(res.body.name).toBe(boardData.name);
    expect(res.body).toHaveProperty('id');
    expect(res.body.ownerId).toBe(user.id); // Confirma que o board tem o ownerId correto.
  });

  it('should return 401 Unauthorized if no token is provided', async () => {
    const res = await request(app)
      .post('/api/boards')
      .send({ name: 'Unauthorized Board' });

    expect(res.statusCode).toEqual(401);
  });
});

// --- INÍCIO DO NOVO BLOCO DE TESTES PARA GET ---

describe('GET /api/boards', () => {
  it('should return only the boards belonging to the authenticated user', async () => {
    // --- Arrange ---
    // 1. Criar User A diretamente com Prisma
    const userA = await prisma.user.create({
      data: {
        name: 'User A',
        email: 'user.a@test.com',
        password: 'hashedpasswordA'
      },
    });
    const tokenA = jwt.sign({ userId: userA.id }, process.env.JWT_SECRET || 'default-secret');

    // 2. Criar User B diretamente com Prisma
    const userB = await prisma.user.create({
      data: {
        name: 'User B',
        email: 'user.b@test.com',
        password: 'hashedpasswordB'
      },
    });
    const tokenB = jwt.sign({ userId: userB.id }, process.env.JWT_SECRET || 'default-secret');
    
    // 3. User A cria dois boards
    await request(app).post('/api/boards').set('Authorization', `Bearer ${tokenA}`).send({ name: 'Board A1' });
    await request(app).post('/api/boards').set('Authorization', `Bearer ${tokenA}`).send({ name: 'Board A2' });
    
    // 4. User B cria um board
    await request(app).post('/api/boards').set('Authorization', `Bearer ${tokenB}`).send({ name: 'Board B1' });

    // --- Act ---
    // 5. Fazer a requisição para listar os boards LOGADO COMO USER A
    const res = await request(app)
      .get('/api/boards')
      .set('Authorization', `Bearer ${tokenA}`);

    // --- Assert ---
    // 6. Verifique se a API retornou apenas os boards do User A
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(2); // A asserção mais importante!

    // 7. Verificação extra para garantir que os boards corretos foram retornados
    const boardNames = res.body.map((board: { name: string }) => board.name);
    expect(boardNames).toContain('Board A1');
    expect(boardNames).toContain('Board A2');
    expect(boardNames).not.toContain('Board B1');
  });

  it('should return 401 Unauthorized if no token is provided', async () => {
    const res = await request(app).get('/api/boards');
    expect(res.statusCode).toEqual(401);
  });
});

describe('GET /api/boards/:id', () => {
  it('should return a single board with its columns and cards correctly ordered', async () => {
  // --- Arrange ---
  // 1. Crie um usuário e seu token
  const user = await prisma.user.create({
    data: {
      name: 'Deep Fetch User',
      email: `deepfetch-${Date.now()}@example.com`,
      password: 'hashedpassword',
    },
  });
  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'default-secret');

  // 2. Crie um board para este usuário
  const board = await prisma.board.create({
    data: { name: 'My Detailed Board', ownerId: user.id },
  });

  // 3. Crie colunas e cards em uma ordem específica para testar a ordenação
  const column2 = await prisma.column.create({
    data: { boardId: board.id, title: 'In Progress', order: 1 },
  });
  const column1 = await prisma.column.create({
    data: { boardId: board.id, title: 'To Do', order: 0 },
  });

  const card2_col1 = await prisma.card.create({
    data: { columnId: column1.id, title: 'Task 2', order: 1 },
  });
  const card1_col1 = await prisma.card.create({
    data: { columnId: column1.id, title: 'Task 1', order: 0 },
  });

  // --- Act ---
  // 4. Busque o board pela API
  const res = await request(app)
    .get(`/api/boards/${board.id}`)
    .set('Authorization', `Bearer ${token}`);

  // --- Assert ---
  // 5. Verifique a estrutura completa da resposta
  expect(res.statusCode).toEqual(200);
  expect(res.body.id).toBe(board.id);
  
  // 5a. Verifique se as colunas estão presentes e ordenadas
  expect(res.body).toHaveProperty('columns');
  expect(res.body.columns).toHaveLength(2);
  expect(res.body.columns[0].title).toBe('To Do'); // Ordem correta (0)
  expect(res.body.columns[1].title).toBe('In Progress'); // Ordem correta (1)

  // 5b. Verifique se os cards estão presentes, aninhados e ordenados
  const toDoColumn = res.body.columns[0];
  expect(toDoColumn).toHaveProperty('cards');
  expect(toDoColumn.cards).toHaveLength(2);
  expect(toDoColumn.cards[0].title).toBe('Task 1'); // Ordem correta (0)
  expect(toDoColumn.cards[1].title).toBe('Task 2'); // Ordem correta (1)
});

  it('should return 404 if the board does not exist', async () => {
    // Arrange: Create a user and token
    const user = await prisma.user.create({
      data: {
        name: 'NonExistent Board User',
        email: 'nonexistent@example.com',
        password: 'hashedpassword'
      },
    });
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'default-secret');

    const nonExistentBoardId = 'clq0m0000000000000000000'; // A valid-looking but non-existent UUID

    // Act: Request a non-existent board
    const res = await request(app)
      .get(`/api/boards/${nonExistentBoardId}`)
      .set('Authorization', `Bearer ${token}`);

    // Assert: Check the response
    expect(res.statusCode).toEqual(404);
    expect(res.body).toHaveProperty('message', 'Board not found.');
  });

  it('should return 404 if the board exists but belongs to another user', async () => {
    // Arrange: Create User A and their board
    const userA = await prisma.user.create({
      data: {
        name: 'User A for Board',
        email: 'user.a.board@test.com',
        password: 'hashedpasswordA'
      },
    });
    const boardA = await prisma.board.create({
      data: { name: 'User A\'s Board', ownerId: userA.id },
    });

    // Arrange: Create User B and their token
    const userB = await prisma.user.create({
      data: {
        name: 'User B for Board',
        email: 'user.b.board@test.com',
        password: 'hashedpasswordB'
      },
    });
    const tokenB = jwt.sign({ userId: userB.id }, process.env.JWT_SECRET || 'default-secret');

    // Act: User B tries to get User A\'s board
    const res = await request(app)
      .get(`/api/boards/${boardA.id}`)
      .set('Authorization', `Bearer ${tokenB}`);

    // Assert: Should return 404 (to prevent enumeration attacks)
    expect(res.statusCode).toEqual(404);
    expect(res.body).toHaveProperty('message', 'Board not found.');
  });

  it('should return 401 Unauthorized if no token is provided', async () => {
    const res = await request(app).get('/api/boards/some-id');
    expect(res.statusCode).toEqual(401);
  });
});

describe('PUT /api/boards/:id', () => {
  it('should allow a user to update the name of a board they own', async () => {
    // Arrange: Create a user and a board for that user
    const user = await prisma.user.create({
      data: {
        name: 'Update User',
        email: 'update@example.com',
        password: 'hashedpassword'
      },
    });
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'default-secret');

    const board = await prisma.board.create({
      data: { name: 'Original Board Name', ownerId: user.id },
    });

    const updatedName = 'Updated Board Name';

    // Act: Send PUT request to update the board
    const res = await request(app)
      .put(`/api/boards/${board.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: updatedName });

    // Assert: Check the response
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('id', board.id);
    expect(res.body).toHaveProperty('name', updatedName);
    expect(res.body).toHaveProperty('ownerId', user.id);

    // Assert: Check if the board was updated in the database
    const updatedBoardInDb = await prisma.board.findUnique({ where: { id: board.id } });
    expect(updatedBoardInDb).not.toBeNull();
    expect(updatedBoardInDb?.name).toBe(updatedName);
  });

  it('should NOT allow a user to update a board that belongs to another user', async () => {
    // Arrange: Create User A and their board
    const userA = await prisma.user.create({
      data: {
        name: 'User A Update',
        email: 'user.a.update@test.com',
        password: 'hashedpasswordA'
      },
    });
    const boardA = await prisma.board.create({
      data: { name: 'User A\'s Board', ownerId: userA.id },
    });

    // Arrange: Create User B and their token
    const userB = await prisma.user.create({
      data: {
        name: 'User B Update',
        email: 'user.b.update@test.com',
        password: 'hashedpasswordB'
      },
    });
    const tokenB = jwt.sign({ userId: userB.id }, process.env.JWT_SECRET || 'default-secret');

    const originalName = boardA.name;
    const maliciousUpdateName = 'Maliciously Updated Name';

    // Act: User B tries to update User A\'s board
    const res = await request(app)
      .put(`/api/boards/${boardA.id}`)
      .set('Authorization', `Bearer ${tokenB}`)
      .send({ name: maliciousUpdateName });

    // Assert: Should return 404 (to prevent enumeration attacks)
    expect(res.statusCode).toEqual(404);
    expect(res.body).toHaveProperty('message', 'Board not found.');

    // Assert: Ensure the board was NOT updated in the database
    const boardInDb = await prisma.board.findUnique({ where: { id: boardA.id } });
    expect(boardInDb).not.toBeNull();
    expect(boardInDb?.name).toBe(originalName); // Name should remain unchanged
  });

  it('should return 401 Unauthorized if no token is provided', async () => {
    // Arrange: Create a board (owner doesn\'t matter for this test)
    const user = await prisma.user.create({
      data: {
        name: 'No Token User',
        email: 'notoken@example.com',
        password: 'hashedpassword'
      },
    });
    const board = await prisma.board.create({
      data: { name: 'Board for No Token Test', ownerId: user.id },
    });

    const updatedName = 'Should Not Update';

    // Act: Send PUT request without token
    const res = await request(app)
      .put(`/api/boards/${board.id}`)
      .send({ name: updatedName });

    // Assert: Check the response
    expect(res.statusCode).toEqual(401);
  });
});
