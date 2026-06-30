import jwt from 'jsonwebtoken';
import logger from '../utils/logger.js';

/**
 * Initializes Socket.IO with JWT authentication.
 * Connected users join rooms:
 *   - user:{userId}            — personal notifications
 *   - org:{organizationId}     — organization-wide events
 *   - branch:{branchId}        — branch-level events
 */
const initializeSocket = (io) => {
  // Auth middleware for socket connections
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1];
    if (!token) return next(new Error('Authentication required'));

    try {
      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
      socket.user = decoded;
      next();
    } catch (err) {
      next(new Error('Invalid or expired token'));
    }
  });

  io.on('connection', (socket) => {
    const { id: userId, organizationId, branchId, role } = socket.user;

    // Join relevant rooms
    socket.join(`user:${userId}`);
    if (organizationId) socket.join(`org:${organizationId}`);
    if (branchId) socket.join(`branch:${branchId}`);

    logger.info(`Socket connected: ${userId} (${role}) — rooms: user:${userId}, org:${organizationId}`);

    // ─── Client events ─────────────────────────────────────────
    socket.on('subscribe:member', (memberId) => {
      socket.join(`member:${memberId}`);
    });

    socket.on('ping', () => {
      socket.emit('pong', { timestamp: new Date().toISOString() });
    });

    socket.on('disconnect', (reason) => {
      logger.info(`Socket disconnected: ${userId} — reason: ${reason}`);
    });

    // Send connected confirmation
    socket.emit('connected', { message: 'Real-time connection established.', userId, organizationId });
  });

  return io;
};

/**
 * Emitter helpers — import and call from services after key events
 */
export const emitToUser = (io, userId, event, data) => {
  io.to(`user:${userId}`).emit(event, data);
};

export const emitToOrganization = (io, organizationId, event, data) => {
  io.to(`org:${organizationId}`).emit(event, data);
};

export const emitToBranch = (io, branchId, event, data) => {
  io.to(`branch:${branchId}`).emit(event, data);
};

export const emitToMember = (io, memberId, event, data) => {
  io.to(`member:${memberId}`).emit(event, data);
};

// Pre-defined event names (import in services)
export const SOCKET_EVENTS = {
  NEW_NOTIFICATION: 'notification:new',
  TRANSACTION_COMPLETED: 'transaction:completed',
  LOAN_APPROVED: 'loan:approved',
  LOAN_REJECTED: 'loan:rejected',
  LOAN_DISBURSED: 'loan:disbursed',
  PAYMENT_RECEIVED: 'payment:received',
  LOW_BALANCE_ALERT: 'alert:low_balance',
};

export default initializeSocket;
