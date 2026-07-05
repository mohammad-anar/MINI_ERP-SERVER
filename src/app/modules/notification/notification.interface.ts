import { Model, Types } from 'mongoose';

export type NotificationType =
  | 'GENERAL'
  | 'SALE'
  | 'ORDER'
  | 'ACCOUNT'
  | 'SYSTEM'
  | 'ADMIN_ALERT';

export interface INotification {
  userId: Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  relatedId?: Types.ObjectId;
  relatedType?: string;
  meta?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export type NotificationModel = Model<INotification>;
