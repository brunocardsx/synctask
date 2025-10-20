import { Server, Socket } from 'socket.io';
import prisma from '../config/prisma.js';

interface RoomUser {
  userId: string;
  socketId: string;
  role: 'OWNER' | 'ADMIN' | 'MEMBER';
  joinedAt: Date;
}

interface BoardRoom {
  boardId: string;
  users: Map<string, RoomUser>;
  createdAt: Date;
}

class RoomManager {
  private rooms: Map<string, BoardRoom> = new Map();
  private userSockets: Map<string, string> = new Map();
  private io: Server | null = null;

  setIO(io: Server): void {
    this.io = io;
  }

  async joinBoard(
    socket: Socket,
    boardId: string,
    userId: string
  ): Promise<boolean> {
    try {
      const board = await prisma.board.findUnique({
        where: { id: boardId },
        include: { members: true },
      });

      if (!board) {
        socket.emit('error', { message: 'Board not found' });
        return false;
      }

      const isOwner = board.ownerId === userId;
      const membership = board.members.find(m => m.userId === userId);

      if (!isOwner && !membership) {
        socket.emit('error', { message: 'No permission to access board' });
        return false;
      }

      const role = isOwner ? 'OWNER' : (membership?.role as 'ADMIN' | 'MEMBER');

      if (!this.rooms.has(boardId)) {
        this.rooms.set(boardId, {
          boardId,
          users: new Map(),
          createdAt: new Date(),
        });
      }

      const room = this.rooms.get(boardId)!;
      const existingUser = Array.from(room.users.values()).find(
        u => u.userId === userId
      );

      if (existingUser) {
        room.users.delete(existingUser.socketId);
      }

      const roomUser: RoomUser = {
        userId,
        socketId: socket.id,
        role,
        joinedAt: new Date(),
      };

      room.users.set(socket.id, roomUser);
      this.userSockets.set(socket.id, boardId);

      socket.join(`board-${boardId}`);

      const usersInRoom = Array.from(room.users.values()).map(u => ({
        userId: u.userId,
        role: u.role,
        joinedAt: u.joinedAt,
      }));

      socket.emit('joined_board', { boardId, users: usersInRoom });

      socket.to(`board-${boardId}`).emit('user_joined', {
        userId,
        role,
        users: usersInRoom,
      });

      console.log(`User ${userId} joined board ${boardId} as ${role}`);
      console.log(`Room ${boardId} now has ${room.users.size} users`);

      return true;
    } catch (error) {
      console.error('Error joining board:', error);
      socket.emit('error', { message: 'Failed to join board' });
      return false;
    }
  }

  leaveBoard(socket: Socket): void {
    const boardId = this.userSockets.get(socket.id);
    if (!boardId) return;

    const room = this.rooms.get(boardId);
    if (!room) return;

    const user = room.users.get(socket.id);
    if (!user) return;

    room.users.delete(socket.id);
    this.userSockets.delete(socket.id);

    socket.leave(`board-${boardId}`);

    const usersInRoom = Array.from(room.users.values()).map(u => ({
      userId: u.userId,
      role: u.role,
      joinedAt: u.joinedAt,
    }));

    socket.to(`board-${boardId}`).emit('user_left', {
      userId: user.userId,
      users: usersInRoom,
    });

    if (room.users.size === 0) {
      this.rooms.delete(boardId);
    }

    console.log(`User ${user.userId} left board ${boardId}`);
    console.log(`Room ${boardId} now has ${room.users.size} users`);
  }

  getRoomUsers(boardId: string): RoomUser[] {
    const room = this.rooms.get(boardId);
    return room ? Array.from(room.users.values()) : [];
  }

  getUserRole(boardId: string, userId: string): string | null {
    const room = this.rooms.get(boardId);
    if (!room) return null;

    const user = Array.from(room.users.values()).find(u => u.userId === userId);
    return user ? user.role : null;
  }

  isUserInRoom(boardId: string, userId: string): boolean {
    const room = this.rooms.get(boardId);
    if (!room) return false;

    return Array.from(room.users.values()).some(u => u.userId === userId);
  }

  broadcastToRoom(
    boardId: string,
    event: string,
    data: any,
    excludeSocketId?: string
  ): void {
    const room = this.rooms.get(boardId);
    if (!room) return;

    room.users.forEach((user, socketId) => {
      if (socketId !== excludeSocketId) {
        const socket = this.getSocketById(socketId);
        if (socket) {
          socket.emit(event, data);
        }
      }
    });
  }

  private getSocketById(socketId: string): Socket | null {
    return this.io?.sockets.sockets.get(socketId) || null;
  }
}

export const roomManager = new RoomManager();
