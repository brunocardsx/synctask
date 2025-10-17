import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import {
  addMemberSchema,
  updateMemberRoleSchema,
  memberParamsSchema,
  boardMembersParamsSchema,
} from '../../schemas/memberSchema.js';
import * as memberService from './members.service.js';

export const addMember = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const validatedData = addMemberSchema.parse(req.body);
    const validatedParams = boardMembersParamsSchema.parse(req.params);
    const addedByUserId = req.userId;

    if (!addedByUserId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const member = await memberService.addMemberToBoard(
      validatedParams.boardId,
      validatedData,
      addedByUserId
    );

    return res.status(201).json(member);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: 'Validation error',
        errors: error.errors,
      });
    }

    if (error && typeof error === 'object' && 'statusCode' in error) {
      return res.status((error as any).statusCode).json({
        message: (error as any).message,
      });
    }

    next(error);
  }
};

export const getMembers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const validatedParams = boardMembersParamsSchema.parse(req.params);
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const members = await memberService.getBoardMembers(
      validatedParams.boardId,
      userId
    );

    return res.status(200).json(members);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: 'Validation error',
        errors: error.errors,
      });
    }

    if (error && typeof error === 'object' && 'statusCode' in error) {
      return res.status((error as any).statusCode).json({
        message: (error as any).message,
      });
    }

    next(error);
  }
};

export const updateMemberRole = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const validatedData = updateMemberRoleSchema.parse(req.body);
    const validatedParams = memberParamsSchema.parse(req.params);
    const updatedByUserId = req.userId;

    if (!updatedByUserId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const member = await memberService.updateMemberRole(
      validatedParams.boardId,
      validatedParams.userId,
      validatedData.role,
      updatedByUserId
    );

    return res.status(200).json(member);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: 'Validation error',
        errors: error.errors,
      });
    }

    if (error && typeof error === 'object' && 'statusCode' in error) {
      return res.status((error as any).statusCode).json({
        message: (error as any).message,
      });
    }

    next(error);
  }
};

export const removeMember = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const validatedParams = memberParamsSchema.parse(req.params);
    const removedByUserId = req.userId;

    console.log('🔍 Debug removeMember:');
    console.log('- boardId:', validatedParams.boardId);
    console.log('- userId to remove:', validatedParams.userId);
    console.log('- removedByUserId:', removedByUserId);

    if (!removedByUserId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    await memberService.removeMemberFromBoard(
      validatedParams.boardId,
      validatedParams.userId,
      removedByUserId
    );

    return res.status(200).json({ message: 'Member removed successfully' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: 'Validation error',
        errors: error.errors,
      });
    }

    if (error && typeof error === 'object' && 'statusCode' in error) {
      return res.status((error as any).statusCode).json({
        message: (error as any).message,
      });
    }

    next(error);
  }
};
