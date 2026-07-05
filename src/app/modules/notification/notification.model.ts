import { model, Schema } from 'mongoose';
import {
  INotification,
  NotificationModel,
  NotificationType,
} from './notification.interface';

const NOTIFICATION_TYPES: NotificationType[] = [
  'GENERAL',
  'SALE',
  'ORDER',
  'ACCOUNT',
  'SYSTEM',
  'ADMIN_ALERT',
];

const notificationSchema = new Schema<INotification, NotificationModel>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: NOTIFICATION_TYPES,
      required: true,
      default: 'GENERAL',
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    relatedId: {
      type: Schema.Types.ObjectId,
      default: null,
    },
    relatedType: {
      type: String,
      default: null,
    },
    meta: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Compound index for efficient "get unread notifications for user" queries
notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

export const Notification = model<INotification, NotificationModel>(
  'Notification',
  notificationSchema
);
