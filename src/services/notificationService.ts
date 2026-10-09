import { notificationRepository, activityRepository } from '../repositories/dexie/dexieRepositories';
import { Notification, Activity } from '../types/entities';
import { UserRole } from '../types/roles';

export class NotificationService {
  async sendNotification(
    recipientUserId: string,
    title: string,
    message: string,
    type: Notification['type'] = 'info',
    link?: string
  ): Promise<Notification> {
    const notif: Notification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      recipientUserId,
      title,
      message,
      link,
      type,
      read: false,
      timestamp: new Date().toISOString(),
    };
    await notificationRepository.create(notif);
    return notif;
  }

  async getUserNotifications(userId: string): Promise<Notification[]> {
    return notificationRepository.getByUser(userId);
  }

  async markAsRead(id: string): Promise<void> {
    await notificationRepository.markAsRead(id);
  }

  async markAllAsRead(userId: string): Promise<void> {
    await notificationRepository.markAllAsRead(userId);
  }
}

export class ActivityService {
  async logActivity(
    projectId: string,
    userId: string,
    userName: string,
    userRole: UserRole,
    actionType: string,
    entityType: string,
    entityId: string,
    entityKey: string,
    description: string
  ): Promise<Activity> {
    const act: Activity = {
      id: `act-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      projectId,
      userId,
      userName,
      userRole,
      actionType,
      entityType,
      entityId,
      entityKey,
      description,
      timestamp: new Date().toISOString(),
    };
    await activityRepository.create(act);
    return act;
  }

  async getProjectActivities(projectId: string, limit = 50): Promise<Activity[]> {
    return activityRepository.getByProject(projectId, limit);
  }

  async getRecentActivities(limit = 20): Promise<Activity[]> {
    return activityRepository.getRecent(limit);
  }
}

export const notificationService = new NotificationService();
export const activityService = new ActivityService();
