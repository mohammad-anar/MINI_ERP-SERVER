import colors from 'colors';
import { Server, Socket } from 'socket.io';
import config from '../config';
import { logger } from '../shared/logger';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface SocketUser {
  userId: string;
  role?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// State
// ─────────────────────────────────────────────────────────────────────────────

let _io: Server | null = null;

/**
 * Tracks all active socket IDs per userId to support multi-tab/multi-device.
 *
 * NOTE: This is an in-memory map. For horizontal scaling (multiple server
 * instances behind a load balancer), migrate to @socket.io/redis-adapter.
 */
const socketMap = new Map<string, Set<string>>();

// ─────────────────────────────────────────────────────────────────────────────
// Initialisation
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Bootstraps Socket.IO on the given HTTP server. Call this once in server.ts
 * after `app.listen()`.
 *
 * Events handled:
 *   Client → `register`    : associate socket with a userId
 *   Client → `join_room`   : join an arbitrary named room
 *   Client → `leave_room`  : leave a named room
 *   Client → `disconnect`  : clean up socketMap
 */
const init = (server: any): Server => {
  _io = new Server(server, {
    pingTimeout: config.socket.ping_timeout,
    cors: {
      origin: config.socket.cors_origin,
      methods: ['GET', 'POST'],
    },
  });

  _io.on('connection', (socket: Socket) => {
    logger.info(colors.cyan(`🔌 Socket connected  [id=${socket.id}]`));

    // ── register ─────────────────────────────────────────────────────
    socket.on('register', ({ userId, role }: SocketUser) => {
      if (!userId) return;

      // Track socket
      if (!socketMap.has(userId)) socketMap.set(userId, new Set());
      socketMap.get(userId)!.add(socket.id);
      (socket as any)._userId = userId;
      (socket as any)._role = role;

      // Admins join the shared admin room
      if (role === 'ADMIN' || role === 'SUPER_ADMIN') {
        socket.join('admin');
        logger.info(
          colors.yellow(`👑 Admin socket joined admin room [userId=${userId}]`)
        );
      }

      logger.info(
        colors.green(`✅ Registered socket [id=${socket.id}] → [userId=${userId}]`)
      );
    });

    // ── join_room ─────────────────────────────────────────────────────
    socket.on('join_room', (room: string) => {
      if (!room) return;
      socket.join(room);
      logger.info(colors.blue(`📥 Socket [id=${socket.id}] joined room: ${room}`));
    });

    // ── leave_room ────────────────────────────────────────────────────
    socket.on('leave_room', (room: string) => {
      if (!room) return;
      socket.leave(room);
      logger.info(colors.blue(`📤 Socket [id=${socket.id}] left room: ${room}`));
    });

    // ── disconnect ────────────────────────────────────────────────────
    socket.on('disconnect', () => {
      logger.info(colors.red(`❌ Socket disconnected [id=${socket.id}]`));
      _cleanupSocket(socket.id);
    });
  });

  return _io;
};

// ─────────────────────────────────────────────────────────────────────────────
// Internal helpers
// ─────────────────────────────────────────────────────────────────────────────

const _cleanupSocket = (socketId: string): void => {
  for (const [userId, sockets] of socketMap.entries()) {
    if (sockets.has(socketId)) {
      sockets.delete(socketId);
      if (sockets.size === 0) socketMap.delete(userId);
      break;
    }
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Public getters
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns the active Socket.IO server instance.
 * Returns `null` and logs a warning if not yet initialised.
 */
const getIO = (): Server | null => {
  if (!_io) {
    logger.warn('⚠️  Socket.IO not initialised — call socketHelper.init(server) first');
    return null;
  }
  return _io;
};

/**
 * Returns all socket IDs currently associated with a userId.
 * Useful for targeted per-user emissions.
 */
const getSocketIds = (userId: string): string[] =>
  Array.from(socketMap.get(userId) ?? []);

/**
 * Returns whether a user has at least one active socket connection.
 */
const isOnline = (userId: string): boolean =>
  (socketMap.get(userId)?.size ?? 0) > 0;

// ─────────────────────────────────────────────────────────────────────────────
// Emission helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Emit an event to every active socket of a specific user (all tabs/devices).
 */
const emitToUser = (userId: string, event: string, data: unknown): void => {
  const io = getIO();
  if (!io) return;

  const ids = getSocketIds(userId);
  ids.forEach(id => io.to(id).emit(event, data));
};

/**
 * Emit a `notification` event to a specific user.
 * Convenience wrapper around `emitToUser`.
 */
const emitNotification = (userId: string, data: unknown): void =>
  emitToUser(userId, 'notification', data);

/**
 * Emit an event to all connected admins (via the `admin` room).
 */
const emitToAdmins = (event: string, data: unknown): void => {
  try {
    const io = getIO();
    if (!io) return;
    io.to('admin').emit(event, data);
    logger.info(colors.magenta(`📢 Emitted "${event}" to admin room`));
  } catch (err) {
    logger.error(`❌ Failed to emit to admin room: ${(err as Error).message}`);
  }
};

/**
 * Emit an event to all sockets in a named room.
 * e.g. emitToRoom('chat:123', 'message', { text: 'Hello' })
 */
const emitToRoom = (room: string, event: string, data: unknown): void => {
  const io = getIO();
  if (!io) return;
  io.to(room).emit(event, data);
};

/**
 * Broadcast an event to all connected clients (no room filter).
 */
const broadcastAll = (event: string, data: unknown): void => {
  const io = getIO();
  if (!io) return;
  io.emit(event, data);
};

// ─────────────────────────────────────────────────────────────────────────────
// Exports
// ─────────────────────────────────────────────────────────────────────────────

export const socketHelper = {
  init,
  getIO,
  getSocketIds,
  isOnline,
  emitToUser,
  emitNotification,
  emitToAdmins,
  emitToRoom,
  broadcastAll,
};
