import { Notification } from './notification.model';

const getMyNotificationsFromDB = async (userId: string) => {
  const result = await Notification.find({ userId }).sort({ createdAt: -1 });
  return result;
};

const markAllReadInDB = async (userId: string) => {
  const result = await Notification.updateMany(
    { userId, isRead: false },
    { $set: { isRead: true } }
  );
  return result;
};

const markReadInDB = async (userId: string, id: string) => {
  const result = await Notification.findOneAndUpdate(
    { _id: id, userId },
    { $set: { isRead: true } },
    { new: true }
  );
  return result;
};

export const NotificationService = {
  getMyNotificationsFromDB,
  markAllReadInDB,
  markReadInDB,
};
