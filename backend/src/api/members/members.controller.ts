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
  }
};
