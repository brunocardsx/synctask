import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import prisma from '../../config/prisma.js';
import type { Prisma } from '@prisma/client';
import { securityConfig } from '../../config/env.js';
import { generateAccessToken } from '../../utils/jwt.js';

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirm {
  token: string;
  newPassword: string;
}

// Generate password reset token
export const generatePasswordResetToken = async (
  email: string
): Promise<string> => {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    // Don't reveal if user exists or not
    throw new Error('Se o email existir, você receberá um link de reset');
  }

  // Generate secure random token
  const resetToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Set expiration to 1 hour
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

  // Store reset token in database
  await prisma.passwordReset.create({
    data: {
      userId: user.id,
      token: hashedToken,
      expiresAt,
    },
  });

  // In a real app, you would send this via email
  console.log(`Password reset token for ${email}: ${resetToken}`);
  console.log(
    `Reset link: http://localhost:3000/reset-password?token=${resetToken}`
  );

  return resetToken;
};

// Verify and use password reset token
export const resetPasswordWithToken = async (
  token: string,
  newPassword: string
): Promise<{ accessToken: string; userId: string }> => {
  // Hash the provided token to compare with stored hash
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  // Find valid reset token
  const resetRecord = await prisma.passwordReset.findFirst({
    where: {
      token: hashedToken,
      expiresAt: { gt: new Date() },
      used: false,
    },
    include: { user: true },
  });

  if (!resetRecord) {
    throw new Error('Token de reset inválido ou expirado');
  }

  // Hash new password
  const hashedPassword = await bcrypt.hash(
    newPassword,
    securityConfig.bcryptRounds
  );

  // Update user password and increment token version
  const updatedUser = await prisma.$transaction(
    async (tx: Prisma.TransactionClient) => {
      // Update user password
      const user = await tx.user.update({
        where: { id: resetRecord.userId },
        data: {
          password: hashedPassword,
          tokenVersion: { increment: 1 },
        },
      });

      // Mark reset token as used
      await tx.passwordReset.update({
        where: { id: resetRecord.id },
        data: { used: true },
      });

      // Delete all other reset tokens for this user
      await tx.passwordReset.deleteMany({
        where: {
          userId: resetRecord.userId,
          id: { not: resetRecord.id },
        },
      });

      return user;
    }
  );

  // Generate new access token
  const accessToken = generateAccessToken(updatedUser.id);

  return {
    accessToken,
    userId: updatedUser.id,
  };
};

// Clean up expired reset tokens
export const cleanupExpiredResetTokens = async (): Promise<number> => {
  const result = await prisma.passwordReset.deleteMany({
    where: {
      OR: [{ expiresAt: { lt: new Date() } }, { used: true }],
    },
  });

  return result.count;
};

// Check if user has pending reset tokens
export const hasPendingResetToken = async (
  userId: string
): Promise<boolean> => {
  const pendingToken = await prisma.passwordReset.findFirst({
    where: {
      userId,
      expiresAt: { gt: new Date() },
      used: false,
    },
  });

  return !!pendingToken;
};
