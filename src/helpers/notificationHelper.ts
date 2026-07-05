import { Types } from 'mongoose';
import { Notification } from '../app/modules/notification/notification.model';
import { NotificationType } from '../app/modules/notification/notification.interface';
import { socketHelper } from './socketHelper';
import { errorLogger, logger } from '../shared/logger';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface SendNotificationParams {
  /** The recipient's MongoDB user ID */
  userId: string | Types.ObjectId;
  /** Category of notification — drives icon/colour on the client */
  type: NotificationType;
  title: string;
  message: string;
  /** Optional related document ID (e.g. Order ID, Sale ID) */
  relatedId?: string | Types.ObjectId;
  /** Optional related document type string (e.g. "Order", "Sale") */
  relatedType?: string;
  /** Any extra metadata to persist and forward to the client */
  meta?: Record<string, unknown>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Core function
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Creates a persisted Notification document and immediately delivers it
 * to the recipient via Socket.IO (real-time, all their active tabs/devices).
 *
 * Usage:
 * ```ts
 * await notificationHelper.send({
 *   userId: order.userId,
 *   type: 'SALE',
 *   title: 'New Sale',
 *   message: `Sale #${sale.id} of $${sale.total} created.`,
 *   relatedId: sale._id,
 *   relatedType: 'Sale',
 *   meta: { amount: sale.total, currency: 'USD' },
 * });
 * ```
 */
const send = async (params: SendNotificationParams) => {
  const {
    userId,
    type,
    title,
    message,
    relatedId,
    relatedType,
    meta = {},
  } = params;

  try {
    // 1️⃣ Persist to database
    const notification = await Notification.create({
      userId: new Types.ObjectId(userId.toString()),
      type,
      title,
      message,
      relatedId: relatedId ? new Types.ObjectId(relatedId.toString()) : undefined,
      relatedType,
      meta,
    });

    // 2️⃣ Real-time delivery via Socket.IO
    socketHelper.emitNotification(userId.toString(), {
      _id: notification._id,
      type,
      title,
      message,
      isRead: false,
      relatedId: notification.relatedId,
      relatedType: notification.relatedType,
      meta: notification.meta,
      createdAt: notification.createdAt,
    });

    logger.info(
      `🔔 Notification [${type}] sent to userId=${userId} — "${title}"`
    );

    return notification;
  } catch (error) {
    errorLogger.error(
      `❌ Failed to send notification [${type}] to userId=${userId}:`,
      error
    );
    throw error;
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Admin broadcast
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Broadcasts an admin-alert event to all connected admins.
 * Does NOT persist to the database (use `send` for per-user persistence).
 *
 * Usage:
 * ```ts
 * notificationHelper.notifyAdmins('NEW_SALE', {
 *   saleId: sale._id,
 *   amount: sale.total,
 * });
 * ```
 */
const notifyAdmins = (event: string, data: unknown): void => {
  socketHelper.emitToAdmins(event, data);
};

// ─────────────────────────────────────────────────────────────────────────────
// Exports
// ─────────────────────────────────────────────────────────────────────────────

export const notificationHelper = { send, notifyAdmins };
