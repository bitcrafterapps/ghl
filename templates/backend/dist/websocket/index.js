"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.emitToUser = exports.emitToProject = exports.getIO = exports.initializeWebSocket = void 0;
const socket_io_1 = require("socket.io");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = require("../db");
const schema_1 = require("../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
const logger_1 = require("../logger");
const logger = logger_1.LoggerFactory.getLogger('WebSocket');
let io;
const initializeWebSocket = (httpServer) => {
    io = new socket_io_1.Server(httpServer, {
        cors: {
            origin: process.env.FRONTEND_URL || 'http://localhost:3003',
            methods: ['GET', 'POST'],
            credentials: true,
        },
    });
    // Authentication middleware
    io.use((socket, next) => __awaiter(void 0, void 0, void 0, function* () {
        const token = socket.handshake.auth.token;
        if (!token) {
            return next(new Error('Authentication required'));
        }
        try {
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
            // Get user info - users table has firstName/lastName not name
            const [user] = yield db_1.db.select({
                id: schema_1.users.id,
                firstName: schema_1.users.firstName,
                lastName: schema_1.users.lastName,
                email: schema_1.users.email
            }).from(schema_1.users).where((0, drizzle_orm_1.eq)(schema_1.users.id, Number(decoded.userId)));
            if (!user) {
                return next(new Error('User not found'));
            }
            socket.data.userId = decoded.userId;
            socket.data.user = Object.assign(Object.assign({}, user), { name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User' });
            next();
        }
        catch (error) {
            next(new Error('Invalid token'));
        }
    }));
    io.on('connection', (socket) => {
        const user = socket.data.user;
        logger.info(`Client connected: ${socket.id} (user: ${(user === null || user === void 0 ? void 0 : user.name) || socket.data.userId})`);
        // Join user-specific room for notifications
        if (socket.data.userId) {
            const userRoom = `user:${socket.data.userId}`;
            socket.join(userRoom);
            logger.debug(`Socket ${socket.id} joined ${userRoom}`);
        }
        // Project Room
        socket.on('join:project', (projectId) => __awaiter(void 0, void 0, void 0, function* () {
            socket.join(`project:${projectId}`);
            logger.info(`Socket ${socket.id} joined project:${projectId}`);
            // Emit presence update to room
            io.to(`project:${projectId}`).emit('presence:update', {
                userId: socket.data.userId,
                name: (user === null || user === void 0 ? void 0 : user.name) || 'Anonymous',
                status: 'online'
            });
        }));
        socket.on('leave:project', (projectId) => __awaiter(void 0, void 0, void 0, function* () {
            socket.leave(`project:${projectId}`);
            logger.debug(`Socket ${socket.id} left project:${projectId}`);
        }));
        // Typing indicator
        socket.on('chat:typing', (data) => {
            socket.to(`project:${data.projectId}`).emit('chat:typing', {
                odId: socket.id,
                userId: socket.data.userId,
                name: user === null || user === void 0 ? void 0 : user.name,
                isTyping: data.isTyping,
            });
        });
        socket.on('disconnect', () => __awaiter(void 0, void 0, void 0, function* () {
            logger.info(`Client disconnected: ${socket.id}`);
        }));
    });
    return io;
};
exports.initializeWebSocket = initializeWebSocket;
const getIO = () => {
    if (!io) {
        throw new Error('WebSocket not initialized');
    }
    return io;
};
exports.getIO = getIO;
// Helper to emit to a project room
const emitToProject = (projectId, event, data) => {
    var _a;
    if (!io) {
        logger.warn(`WebSocket not initialized, cannot emit ${event} to project ${projectId}`);
        return;
    }
    const room = `project:${projectId}`;
    const clients = io.sockets.adapter.rooms.get(room);
    const clientCount = clients ? clients.size : 0;
    if (event === 'generation:log') {
        logger.info(`[WS] Emitting ${event} to ${room} (${clientCount} clients): ${(_a = data.message) === null || _a === void 0 ? void 0 : _a.substring(0, 50)}`);
    }
    io.to(room).emit(event, data);
};
exports.emitToProject = emitToProject;
// Helper to emit to a specific user
const emitToUser = (userId, event, data) => {
    if (!io) {
        return;
    }
    io.to(`user:${userId}`).emit(event, data);
};
exports.emitToUser = emitToUser;
