import request from 'supertest';
import app from '../app';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

import prisma from '../config/prisma';

/**
 * Limpa as tabelas de board e user antes de cada teste para garantir isolamento.
 */
beforeEach(async () => {
  await prisma.board.deleteMany({});
  // await prisma.user.deleteMany({}); // Temporarily comment out this line
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('POST /api/boards', () => {
  it('should allow an authenticated user to create a board', async () => {
    // --- Arrange ---
    // 1. Crie um usuário diretamente com Prisma para garantir que ele exista.
    const user = await prisma.user.create({
      data: {
        name: 'Board Creator',
        email: 'creator@example.com',
        password: 'hashedpassword',
      },
    });


    // 2. Gere um token JWT válido para este usuário.
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'default-secret');

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
  it('should return a single board by ID for an authenticated owner', async () => {
    // Arrange: Create a user and a board for that user
    const user = await prisma.user.create({
      data: {
        name: 'Single Board User',
        email: 'single@example.com',
        password: 'hashedpassword'
      },
    });
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'default-secret');

    const board = await prisma.board.create({
      data: { name: 'My Specific Board', ownerId: user.id },
    });

    // Act: Request the specific board
    const res = await request(app)
      .get(`/api/boards/${board.id}`)
      .set('Authorization', `Bearer ${token}`);

    // Assert: Check the response
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('id', board.id);
    expect(res.body).toHaveProperty('name', board.name);
    expect(res.body).toHaveProperty('ownerId', user.id);
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
