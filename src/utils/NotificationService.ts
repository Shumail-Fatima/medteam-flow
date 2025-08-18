// NotificationService.ts
import type { Notification } from '../context/NotifSocketContext';

export interface NotificationTemplate {
  title: string;
  message: string;
  type: Notification['type'];
  priority?: Notification['priority'];
}

export class NotificationService {
  // Appointment notifications
  static createAppointmentNotification(
    toUserId: string,
    fromUserId: string,
    //appointmentId: string,
    patientId: string,
    patientName: string,
    doctorName: string,
    appointmentSlot: string,
    action: 'created' | 'updated' | 'cancelled' | 'reminder'
  ): Omit<Notification, 'id' | 'isRead' | 'createdAt'> {
    const templates: Record<string, NotificationTemplate> = {
      created: {
        title: 'New Appointment Scheduled',
        message: `A new appointment has been scheduled with ${patientName} on ${new Date(appointmentSlot).toLocaleDateString()}`,
        type: 'appointment',
        priority: 'medium'
      },
      updated: {
        title: 'Appointment Updated',
        message: `Appointment with ${patientName} has been updated`,
        type: 'appointment',
        priority: 'medium'
      },
      cancelled: {
        title: 'Appointment Cancelled',
        message: `Appointment with ${patientName} has been cancelled`,
        type: 'appointment',
        priority: 'high'
      },
      reminder: {
        title: 'Appointment Reminder',
        message: `You have an upcoming appointment with ${patientName} tomorrow`,
        type: 'appointment',
        priority: 'high'
      }
    };

    const template = templates[action];
    return {
      title: template.title,
      message: template.message,
      type: template.type,
      toUserId,
      fromUserId,
      //appointmentId,
      patientId,
      priority: template.priority,
    };
  }

  // Consultation notifications
  static createConsultationNotification(
    toUserId: string,
    fromUserId: string,
    consultationId: string,
    patientName: string,
    action: 'completed' | 'started' | 'followup_required'
  ): Omit<Notification, 'id' | 'isRead' | 'createdAt'> {
    const templates: Record<string, NotificationTemplate> = {
      completed: {
        title: 'Consultation Completed',
        message: `Consultation with ${patientName} has been completed`,
        type: 'consultation',
        priority: 'medium'
      },
      started: {
        title: 'Consultation Started',
        message: `Consultation with ${patientName} has started`,
        type: 'consultation',
        priority: 'medium'
      },
      followup_required: {
        title: 'Follow-up Required',
        message: `Follow-up consultation required for ${patientName}`,
        type: 'followup',
        priority: 'high'
      }
    };

    const template = templates[action];
    return {
      title: template.title,
      message: template.message,
      type: template.type,
      toUserId,
      fromUserId,
      consultationId,
      //patientId: consultationId, // You might want to extract patientId from consultation
      priority: template.priority,
    };
  }

  // Task notifications
  static createTaskNotification(
    toUserId: string,
    fromUserId: string,
    taskId: string,
    taskTitle: string,
    action: 'assigned' | 'completed' | 'overdue' | 'updated'
  ): Omit<Notification, 'id' | 'isRead' | 'createdAt'> {
    const templates: Record<string, NotificationTemplate> = {
      assigned: {
        title: 'New Task Assigned',
        message: `You have been assigned a new task: ${taskTitle}`,
        type: 'task',
        priority: 'medium'
      },
      completed: {
        title: 'Task Completed',
        message: `Task "${taskTitle}" has been completed`,
        type: 'task',
        priority: 'low'
      },
      overdue: {
        title: 'Task Overdue',
        message: `Task "${taskTitle}" is overdue`,
        type: 'task',
        priority: 'high'
      },
      updated: {
        title: 'Task Updated',
        message: `Task "${taskTitle}" has been updated`,
        type: 'task',
        priority: 'medium'
      }
    };

    const template = templates[action];
    return {
      title: template.title,
      message: template.message,
      type: template.type,
      toUserId,
      fromUserId,
      taskId,
      priority: template.priority,
    };
  }

  // User management notifications
  static createUserNotification(
    toUserId: string,
    fromUserId: string,
    userName: string,
    action: 'created' | 'updated' | 'deleted' | 'role_changed'
  ): Omit<Notification, 'id' | 'isRead' | 'createdAt'> {
    const templates: Record<string, NotificationTemplate> = {
      created: {
        title: 'New User Account Created',
        message: `New user account has been created for ${userName}`,
        type: 'user',
        priority: 'medium'
      },
      updated: {
        title: 'User Account Updated',
        message: `User account for ${userName} has been updated`,
        type: 'user',
        priority: 'medium'
      },
      deleted: {
        title: 'User Account Deleted',
        message: `User account for ${userName} has been deleted`,
        type: 'user',
        priority: 'high'
      },
      role_changed: {
        title: 'User Role Changed',
        message: `Role for ${userName} has been changed`,
        type: 'user',
        priority: 'medium'
      }
    };

    const template = templates[action];
    return {
      title: template.title,
      message: template.message,
      type: template.type,
      toUserId,
      fromUserId,
      priority: template.priority,
    };
  }

  // General system notifications
  static createSystemNotification(
    toUserId: string,
    title: string,
    message: string,
    priority: Notification['priority'] = 'medium'
  ): Omit<Notification, 'id' | 'isRead' | 'createdAt'> {
    return {
      title,
      message,
      type: 'general',
      toUserId,
      priority,
    };
  }

  // Bulk notification for multiple users
  static createBulkNotification(
    toUserIds: string[],
    fromUserId: string,
    title: string,
    message: string,
    type: Notification['type'] = 'general',
    priority: Notification['priority'] = 'medium'
  ): Omit<Notification, 'id' | 'isRead' | 'createdAt'>[] {
    return toUserIds.map(toUserId => ({
      title,
      message,
      type,
      toUserId,
      fromUserId,
      priority,
    }));
  }
}
