import { Request, Response } from 'express';
import { z } from 'zod';
import { registerUser, loginUser } from '../../api/auth/auth.controller';
import * as authService from '../../api/auth/auth.service';
import { mockRegisterData, mockLoginData } from '../mocks/test-data';
import {
  createMockRequest,
  createMockResponse,
  expectSuccessResponse,
  expectValidationErrorResponse,
} from '../utils/test-helpers';

// Mock do auth service
jest.mock('../../api/auth/auth.service');

const mockedAuthService = authService as jest.Mocked<typeof authService>;

describe('Auth Controller', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRequest = createMockRequest();
    mockResponse = createMockResponse();
  });

  describe('registerUser', () => {
    it('registers user successfully with valid data', async () => {
      mockRequest.body = mockRegisterData;

      mockedAuthService.registerNewUser.mockResolvedValue({
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
        userId: 'user-123',
        expiresIn: '15m',
      });

      await registerUser(mockRequest as Request, mockResponse as Response);

      expect(mockedAuthService.registerNewUser).toHaveBeenCalledWith(
        mockRegisterData
      );
      expectSuccessResponse(mockResponse, 201, {
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
        userId: 'user-123',
        expiresIn: '15m',
      });
    });

    it('returns validation errors for invalid data', async () => {
      mockRequest.body = {
        name: '', // Nome muito curto
        email: 'invalid-email', // Email inválido
        password: '123', // Senha muito curta
      };

      await registerUser(mockRequest as Request, mockResponse as Response);

      expect(mockedAuthService.registerNewUser).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Dados de entrada inválidos.',
          errors: expect.any(Object),
        })
      );
    });

    it('handles service errors with status code', async () => {
      mockRequest.body = mockRegisterData;

      const serviceError = new Error('Este email já está em uso.') as any;
      serviceError.statusCode = 409;
      mockedAuthService.registerNewUser.mockRejectedValue(serviceError);

      await registerUser(mockRequest as Request, mockResponse as Response);

      expect(mockedAuthService.registerNewUser).toHaveBeenCalledWith(
        mockRegisterData
      );
      expect(mockResponse.status).toHaveBeenCalledWith(409);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Este email já está em uso.',
      });
    });

    it('handles unexpected service errors', async () => {
      mockRequest.body = mockRegisterData;

      mockedAuthService.registerNewUser.mockRejectedValue(
        new Error('Database connection failed')
      );

      await registerUser(mockRequest as Request, mockResponse as Response);

      expect(mockedAuthService.registerNewUser).toHaveBeenCalledWith(
        mockRegisterData
      );
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Erro interno do servidor.',
      });
    });

    it('handles Zod validation errors with detailed messages', async () => {
      mockRequest.body = {
        name: 'Jo', // Nome muito curto
        email: 'not-an-email',
        password: '123', // Senha muito curta
      };

      await registerUser(mockRequest as Request, mockResponse as Response);

      expect(mockedAuthService.registerNewUser).not.toHaveBeenCalled();

      const responseCall = (mockResponse.json as jest.Mock).mock.calls[0][0];
      expect(responseCall.message).toBe('Dados de entrada inválidos.');
      expect(responseCall.errors).toHaveProperty('name');
      expect(responseCall.errors).toHaveProperty('email');
      expect(responseCall.errors).toHaveProperty('password');
    });
  });

  describe('loginUser', () => {
    it('logs in user successfully with valid credentials', async () => {
      mockRequest.body = mockLoginData;

      mockedAuthService.loginUser.mockResolvedValue({
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
        userId: 'user-123',
        expiresIn: '15m',
      });

      await loginUser(mockRequest as Request, mockResponse as Response);

      expect(mockedAuthService.loginUser).toHaveBeenCalledWith(mockLoginData);
      expectSuccessResponse(mockResponse, 200, {
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
        userId: 'user-123',
        expiresIn: '15m',
      });
    });

    it('returns validation errors for invalid login data', async () => {
      mockRequest.body = {
        email: 'invalid-email',
        password: '123', // Senha muito curta
      };

      await loginUser(mockRequest as Request, mockResponse as Response);

      expect(mockedAuthService.loginUser).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Dados de entrada inválidos.',
          errors: expect.any(Object),
        })
      );
    });

    it('handles authentication failures', async () => {
      mockRequest.body = mockLoginData;

      const authError = new Error('Credenciais inválidas.') as any;
      authError.statusCode = 401;
      mockedAuthService.loginUser.mockRejectedValue(authError);

      await loginUser(mockRequest as Request, mockResponse as Response);

      expect(mockedAuthService.loginUser).toHaveBeenCalledWith(mockLoginData);
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Credenciais inválidas.',
      });
    });

    it('handles missing request body', async () => {
      mockRequest.body = {};

      await loginUser(mockRequest as Request, mockResponse as Response);

      expect(mockedAuthService.loginUser).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });

    it('handles malformed request body', async () => {
      mockRequest.body = {
        email: 123, // Tipo errado
        password: ['not', 'a', 'string'], // Tipo errado
      };

      await loginUser(mockRequest as Request, mockResponse as Response);

      expect(mockedAuthService.loginUser).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });
  });

  describe('Error handling edge cases', () => {
    it('handles non-Zod errors during registration', async () => {
      mockRequest.body = mockRegisterData;

      const nonZodError = new Error('Non-Zod error');
      mockedAuthService.registerNewUser.mockRejectedValue(nonZodError);

      await registerUser(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Erro interno do servidor.',
      });
    });

    it('handles undefined request body', async () => {
      mockRequest.body = undefined;

      await registerUser(mockRequest as Request, mockResponse as Response);

      expect(mockedAuthService.registerNewUser).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });

    it('logs errors for debugging', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      mockRequest.body = mockRegisterData;
      mockedAuthService.registerNewUser.mockRejectedValue(
        new Error('Test error')
      );

      await registerUser(mockRequest as Request, mockResponse as Response);

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });
});



