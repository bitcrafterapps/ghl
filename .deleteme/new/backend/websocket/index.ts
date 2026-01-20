import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { db } from '../db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';
import { LoggerFactory } from '../logger';

const logger = LoggerFactory.getLogger('WebSocket');

let io: Server;

export const initializeWebSocket = (httpServer: HttpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3003',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // Authentication middleware
  io.use(async (socket: Socket, next: (err?: Error) => void) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication required'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
      
      // Get user info - users table has firstName/lastName not name
      const [user] = await db.select({
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email
      }).from(users).where(eq(users.id, Number(decoded.userId)));

      if (!user) {
        return next(new Error('User not found'));
      }

      socket.data.userId = decoded.userId;
      socket.data.user = {
        ...user,
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User'
      };
      next();
    } catch (error) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const user = socket.data.user;
    logger.info(`Client connected: ${socket.id} (user: ${user?.name || socket.data.userId})`);

    // Join user-specific room for notifications
    if (socket.data.userId) {
      const userRoom = `user:${socket.data.userId}`;
      socket.join(userRoom);
      logger.debug(`Socket ${socket.id} joined ${userRoom}`);
    }

    // Project Room
    socket.on('join:project', async (projectId: string) => {
      socket.join(`project:${projectId}`);
      logger.info(`Socket ${socket.id} joined project:${projectId}`);
      
      // Emit presence update to room
      io.to(`project:${projectId}`).emit('presence:update', {
        userId: socket.data.userId,
        name: user?.name || 'Anonymous',
        status: 'online'
      });
    });

    socket.on('leave:project', async (projectId: string) => {
      socket.leave(`project:${projectId}`);
      logger.debug(`Socket ${socket.id} left project:${projectId}`);
    });

    // Typing indicator
    socket.on('chat:typing', (data: { projectId: string; isTyping: boolean }) => {
      socket.to(`project:${data.projectId}`).emit('chat:typing', {
        odId: socket.id,
        userId: socket.data.userId,
        name: user?.name,
        isTyping: data.isTyping,
      });
    });

    socket.on('disconnect', async () => {
      logger.info(`Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('WebSocket not initialized');
  }
  return io;
};

// Helper to emit to a project room
export const emitToProject = (projectId: string, event: string, data: any) => {
  if (!io) {
    logger.warn(`WebSocket not initialized, cannot emit ${event} to project ${projectId}`);
    return;
  }
  const room = `project:${projectId}`;
  const clients = io.sockets.adapter.rooms.get(room);
  const clientCount = clients ? clients.size : 0;
  
  if (event === 'generation:log') {
    logger.info(`[WS] Emitting ${event} to ${room} (${clientCount} clients): ${data.message?.substring(0, 50)}`);
  }
  
  io.to(room).emit(event, data);
};

// Helper to emit to a specific user
export const emitToUser = (userId: string, event: string, data: any) => {
  if (!io) {
    return;
  }
  io.to(`user:${userId}`).emit(event, data);
};
