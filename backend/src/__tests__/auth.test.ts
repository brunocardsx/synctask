import request from 'supertest';
import app from '../app.js';
import { describe, it, expect, beforeEach } from '@jest/globals';
import { PrismaClient } from '@prisma/client';

import prisma from '../config/prisma.js';

/**
 * Limpa a tabela de usuários antes de cada teste para garantir isolamento.
 * Sem isso, os testes podem interferir uns com os outros.
 */
beforeAll(async () => {
    await prisma.comment.deleteMany({});
    await prisma.cardAssignee.deleteMany({});
    await prisma.card.deleteMany({});
    await prisma.column.deleteMany({});
    await prisma.activity.deleteMany({});
    await prisma.boardMember.deleteMany({});
    await prisma.board.deleteMany({});
    await prisma.user.deleteMany({});
});

afterAll(async () => {
    await prisma.$disconnect();
});

describe('POST /api/auth/register', () => {
    it('should register a user successfully with valid data', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({
                name: 'Test User',
                email: 'test@example.com',
                password: 'password123',
            });
        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('token');
    });

    it('should fail to register with an existing email', async () => {
        await request(app).post('/api/auth/register').send({
            name: 'Existing User',
            email: 'existing@example.com',
            password: 'password123',
        });

        const res = await request(app).post('/api/auth/register').send({
            name: 'Another User',
            email: 'existing@example.com',
            password: 'password456',
        });

        expect(res.statusCode).toEqual(409);
    });

    describe('POST /api/auth/login', () => {
        it('should login a registered user and return a token', async () => {
            const userCredentials = {
                name: 'Login User',
                email: 'login@example.com',
                password: 'password123',
            };
            await request(app).post('/api/auth/register').send(userCredentials);

            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: userCredentials.email,
                    password: userCredentials.password,
                });

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('token');
        });

  

  it('should fail to login with a non-existent email', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'nouser@example.com',
        password: 'password123',
      });

    // 401 Unauthorized é o status correto para falha de autenticação
    expect(res.statusCode).toEqual(401);
    expect(res.body.message).toBe('Credenciais inválidas.');
  });

  it('should fail to login with an incorrect password', async () => {
    const userCredentials = {
      name: 'Login User',
      email: 'login@example.com',
      password: 'correct-password',
    };
    await request(app).post('/api/auth/register').send(userCredentials);

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: userCredentials.email,
        password: 'wrong-password',
      });

    // Assert: A resposta deve ser a mesma de um email inexistente
    expect(res.statusCode).toEqual(401);
    expect(res.body.message).toBe('Credenciais inválidas.');
  });

  it('should fail with validation error if password is missing', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
      });
    
    expect(res.statusCode).toEqual(400);
    expect(res.body.errors).toHaveProperty('password');
    expect(res.body.errors.password).toContain('A senha é obrigatória.');
  });
    });

    describe('Validation Errors', () => {
        test.each([
            {
                payload: { name: 'Test', email: 'test@test.com' },
                expectedField: 'password',
                expectedMessage: 'A senha é obrigatória.',
            },
            {
                payload: { name: 'Test', password: 'password123' },
                expectedField: 'email',
                expectedMessage: 'O email é obrigatório.',
            },
            {
                payload: { email: 'test@test.com', password: 'password123' },
                expectedField: 'name',
                expectedMessage: 'O nome é obrigatório.',
            },
            {
                payload: { name: 'Test', email: 'not-an-email', password: 'password123' },
                expectedField: 'email',
                expectedMessage: 'Formato de email inválido.',
            },
            {
                payload: { name: 'Test', email: 'test@test.com', password: '123' },
                expectedField: 'password',
                expectedMessage: 'A senha deve ter no mínimo 6 caracteres.',
            },
        ])('should return 400 when %s', async ({ payload, expectedField, expectedMessage }) => {
            const res = await request(app)
                .post('/api/auth/register')
                .send(payload);

            expect(res.statusCode).toEqual(400);
            expect(res.body.errors).toHaveProperty(expectedField);
            expect(res.body.errors[expectedField]).toContain(expectedMessage);
        });
    });
});