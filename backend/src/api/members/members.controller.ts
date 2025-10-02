import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import {
  addMemberSchema,
  updateMemberRoleSchema,
  memberParamsSchema,
  boardMembersParamsSchema,
} from '../../schemas/memberSchema.js';
import * as memberService from './members.service.js';

export const addMember = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = addMemberSchema.parse(req.body);
    const validatedParams = boardMembersParamsSchema.parse(req.params);
    
    const addedByUserId = req.userId;
    
    if (!addedByUserId) {
      return res.status(401).json({ message: 'Unauthorized: User ID not found' });
    }

    const member = await memberService.addMemberToBoard(
      validatedParams.boardId,
      validatedData,
      addedByUserId
    );

    return res.status(201).json(member);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: { [key: string]: string[] } = {};
      error.issues.forEach(issue => {
        const path = issue.path.join('.');
        if (!errors[path]) {
          errors[path] = [];
        }
        errors[path].push(issue.message);
      });

      return res.status(400).json({
        message: 'Dados de entrada inválidos',
        errors,
      });
    }

    if (error instanceof Error) {
      if (error.message === 'Usuário não encontrado') {
        return res.status(404).json({ message: error.message });
      }
      
      if (error.message === 'Board não encontrado') {
        return res.status(404).json({ message: error.message });
      }
      
      if (error.message === 'Apenas o proprietário do board pode adicionar membros') {
        return res.status(403).json({ message: error.message });
      }
      
      if (error.message === 'Usuário já é membro deste board') {
        return res.status(409).json({ message: error.message });
      }
    }

    console.error(error);
    next(error);
  }
};

export const getMembers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedParams = boardMembersParamsSchema.parse(req.params);
    
    const members = await memberService.getBoardMembers(validatedParams.boardId);

    return res.status(200).json(members);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: { [key: string]: string[] } = {};
      error.issues.forEach(issue => {
        const path = issue.path.join('.');
        if (!errors[path]) {
          errors[path] = [];
        }
        errors[path].push(issue.message);
      });

      return res.status(400).json({
        message: 'Parâmetros inválidos',
        errors,
      });
    }

    console.error(error);
    next(error);
  }
};

export const updateMemberRole = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = updateMemberRoleSchema.parse(req.body);
    const validatedParams = memberParamsSchema.parse(req.params);
    
    const updatedByUserId = req.userId;
    
    if (!updatedByUserId) {
      return res.status(401).json({ message: 'Unauthorized: User ID not found' });
    }

    const member = await memberService.updateMemberRole(
      validatedParams.boardId,
      validatedParams.userId,
      validatedData,
      updatedByUserId
    );

    return res.status(200).json(member);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: { [key: string]: string[] } = {};
      error.issues.forEach(issue => {
        const path = issue.path.join('.');
        if (!errors[path]) {
          errors[path] = [];
        }
        errors[path].push(issue.message);
      });

      return res.status(400).json({
        message: 'Dados de entrada inválidos',
        errors,
      });
    }

    if (error instanceof Error) {
      if (error.message === 'Board não encontrado') {
        return res.status(404).json({ message: error.message });
      }
      
      if (error.message === 'Apenas o proprietário do board pode alterar roles') {
        return res.status(403).json({ message: error.message });
      }
      
      if (error.message === 'Membro não encontrado no board') {
        return res.status(404).json({ message: error.message });
      }
    }

    console.error(error);
    next(error);
  }
};

export const removeMember = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedParams = memberParamsSchema.parse(req.params);
    
    const removedByUserId = req.userId;
    
    if (!removedByUserId) {
      return res.status(401).json({ message: 'Unauthorized: User ID not found' });
    }

    const result = await memberService.removeMemberFromBoard(
      validatedParams.boardId,
      validatedParams.userId,
      removedByUserId
    );

    return res.status(200).json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: { [key: string]: string[] } = {};
      error.issues.forEach(issue => {
        const path = issue.path.join('.');
        if (!errors[path]) {
          errors[path] = [];
        }
        errors[path].push(issue.message);
      });

      return res.status(400).json({
        message: 'Parâmetros inválidos',
        errors,
      });
    }

    if (error instanceof Error) {
      if (error.message === 'Board não encontrado') {
        return res.status(404).json({ message: error.message });
      }
      
      if (error.message === 'Apenas o proprietário do board pode remover membros') {
        return res.status(403).json({ message: error.message });
      }
      
      if (error.message === 'Membro não encontrado no board') {
        return res.status(404).json({ message: error.message });
      }
      
      if (error.message === 'Não é possível remover o proprietário do board') {
        return res.status(400).json({ message: error.message });
      }
    }

    console.error(error);
    next(error);
  }
};
