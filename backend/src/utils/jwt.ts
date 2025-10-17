import jwt from 'jsonwebtoken';
import { securityConfig } from '../config/env.js';
import { JwtPayload } from '../types/index.js';

export interface RefreshTokenPayload {
  userId: string;
  tokenVersion: number;
}

export interface AccessTokenPayload {
  userId: string;
}

// Generate access token
export const generateAccessToken = (userId: string): string => {
  const payload: AccessTokenPayload = { userId };

  return jwt.sign(payload, securityConfig.jwtSecret, {
    expiresIn: securityConfig.jwtExpiresIn,
    issuer: 'synctask-api',
    audience: 'synctask-client',
  } as jwt.SignOptions);
};

// Generate refresh token
export const generateRefreshToken = (
  userId: string,
  tokenVersion: number
): string => {
  const payload: RefreshTokenPayload = { userId, tokenVersion };

  return jwt.sign(payload, securityConfig.jwtRefreshSecret, {
    expiresIn: securityConfig.jwtRefreshExpiresIn,
    issuer: 'synctask-api',
    audience: 'synctask-client',
  } as jwt.SignOptions);
};

// Verify access token
export const verifyAccessToken = (token: string): JwtPayload => {
  try {
    return jwt.verify(token, securityConfig.jwtSecret, {
      issuer: 'synctask-api',
      audience: 'synctask-client',
    } as jwt.VerifyOptions) as JwtPayload;
  } catch (error) {
    throw new Error('Token de acesso inválido ou expirado');
  }
};

// Verify refresh token
export const verifyRefreshToken = (token: string): RefreshTokenPayload => {
  try {
    return jwt.verify(token, securityConfig.jwtRefreshSecret, {
      issuer: 'synctask-api',
      audience: 'synctask-client',
    } as jwt.VerifyOptions) as RefreshTokenPayload;
  } catch (error) {
    throw new Error('Refresh token inválido ou expirado');
  }
};

// Generate token pair
export const generateTokenPair = (userId: string, tokenVersion: number) => {
  const accessToken = generateAccessToken(userId);
  const refreshToken = generateRefreshToken(userId, tokenVersion);

  return {
    accessToken,
    refreshToken,
    expiresIn: securityConfig.jwtExpiresIn,
  };
};

// Extract token from header
export const extractTokenFromHeader = (
  authHeader: string | undefined
): string | null => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  return authHeader.split(' ')[1] || null;
};

// Check if token is expired
export const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = jwt.decode(token) as any;
    if (!decoded || !decoded.exp) return true;

    return Date.now() >= decoded.exp * 1000;
  } catch {
    return true;
  }
};

// Get token expiration time
export const getTokenExpiration = (token: string): Date | null => {
  try {
    const decoded = jwt.decode(token) as any;
    if (!decoded || !decoded.exp) return null;

    return new Date(decoded.exp * 1000);
  } catch {
    return null;
  }
};
