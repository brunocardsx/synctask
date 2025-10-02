<<<<<<< HEAD
import { Request, Response } from 'express';
import { z } from 'zod';
import { addMemberSchema, updateMemberRoleSchema } from '../../schemas/memberSchema.js';
import * as memberService from './members.service.js';

// Adicionar membro ao board
export const addMember = async (req: Request, res: Response) => {
  try {
    const { boardId } = req.params;
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized: User ID not found.' });
    }

    if (!boardId) {
      return res.status(400).json({ message: 'Board ID is required.' });
    }

    const validatedData = addMemberSchema.parse(req.body);
    const { userEmail, role } = validatedData;

    const result = await memberService.addMemberToBoard(boardId, userEmail, role || 'MEMBER', userId);

    if (!result.success) {
      return res.status(400).json({ message: result.message });
    }

    return res.status(201).json(result.member);

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: 'Invalid input data.',
        errors: error.flatten().fieldErrors,
      });
    }

    console.error('Erro ao adicionar membro:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Listar membros do board
export const getBoardMembers = async (req: Request, res: Response) => {
  try {
    const { boardId } = req.params;
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized: User ID not found.' });
    }

    if (!boardId) {
      return res.status(400).json({ message: 'Board ID is required.' });
    }

    const members = await memberService.getBoardMembers(boardId, userId);

    if (!members) {
      return res.status(404).json({ message: 'Board not found or you do not have access.' });
    }

    return res.status(200).json(members);

  } catch (error) {
    console.error('Erro ao buscar membros:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Atualizar role do membro
export const updateMemberRole = async (req: Request, res: Response) => {
  try {
    const { boardId, memberId } = req.params;
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized: User ID not found.' });
    }

    if (!boardId || !memberId) {
      return res.status(400).json({ message: 'Board ID and Member ID are required.' });
    }

    const validatedData = updateMemberRoleSchema.parse(req.body);
    const { role } = validatedData;

    const result = await memberService.updateMemberRole(boardId, memberId, role, userId);

    if (!result.success) {
      return res.status(400).json({ message: result.message });
    }

    return res.status(200).json(result.member);

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: 'Invalid input data.',
        errors: error.flatten().fieldErrors,
      });
    }

    console.error('Erro ao atualizar role do membro:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Remover membro do board
export const removeMember = async (req: Request, res: Response) => {
  try {
    const { boardId, memberId } = req.params;
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized: User ID not found.' });
    }

    if (!boardId || !memberId) {
      return res.status(400).json({ message: 'Board ID and Member ID are required.' });
    }

    const result = await memberService.removeMemberFromBoard(boardId, memberId, userId);

    if (!result.success) {
      return res.status(400).json({ message: result.message });
    }

    return res.status(200).json({ message: 'Member removed successfully.' });

  } catch (error) {
    console.error('Erro ao remover membro:', error);
    return res.status(500).json({ message: 'Server error' });
=======
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
>>>>>>> feature/board-members-system
  }
};
