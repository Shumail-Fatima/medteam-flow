// NotificationContext.tsx
import React, { createContext, useContext, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../store/Store';
import { addNotification, markNotificationAsRead } from '../store/slices/NotificationSlice';
import { createNotificationChannel } from '../utils/NotificationChannel';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'appointment' | 'consultation' | 'task' | 'user' | 'followup' | 'general';
  toUserId: string;
  fromUserId?: string;
  isRead: boolean;
  createdAt: string;
  // Additional context data
  appointmentId?: string;
  consultationId?: string;
  taskId?: string;
  patientId?: string;
  doctorId?: string;
  priority?: 'low' | 'medium' | 'high';
}

interface NotificationContextType {
  sendNotification: (notification: Omit<Notification, 'id' | 'isRead' | 'createdAt'>) => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  getUnreadCount: () => number;
  notifications: Notification[];
  isLoading: boolean;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const dispatch = useDispatch<AppDispatch>();
  const notifications = useSelector((state: RootState) => state.notifications.notifications);
  const [isLoading, setIsLoading] = useState(false);
  const ws = useRef<WebSocket | null>(null);
  const channel = createNotificationChannel();

  /* check before this commit to see the websocket implementation in branch fastApiBackend the commit in question is below 
     the commit = feat: add new user account and notification entries for Robert Dale; update WebSocket implementation comments in NotifSocketContext
  */


  // Send notification function
  const sendNotification = async (notification: Omit<Notification, 'id' | 'isRead' | 'createdAt'>) => {
    setIsLoading(true);
    try {
      const newNotification: Notification = {
        ...notification,
        id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        isRead: false,
        createdAt: new Date().toISOString(),
      };

      // Add to Redux store
      dispatch(addNotification(newNotification));

      // Send via WebSocket if connected
      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        ws.current.send(JSON.stringify({
          type: 'notification',
          payload: newNotification
        }));
      }
      
      // Send notification to doctor
      channel.postMessage(notification);

      // Save to backend server (for persistence)
      await fetch('http://localhost:8000/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newNotification),
      });

    } catch (error) {
      console.error('Error sending notification:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      dispatch(markNotificationAsRead(notificationId));
      
      // Update on server
      await fetch(`http://localhost:8000/notifications/${notificationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isRead: true }),
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.isRead);
      await Promise.all(unreadNotifications.map(n => markAsRead(n.id)));
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Get unread count
  const getUnreadCount = () => {
    return notifications.filter(n => !n.isRead).length;
  };

  const value: NotificationContextType = {
    sendNotification,
    markAsRead,
    markAllAsRead,
    getUnreadCount,
    notifications,
    isLoading,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};