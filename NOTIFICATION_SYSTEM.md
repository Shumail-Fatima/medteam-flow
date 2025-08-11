# Notification System Documentation

## Overview

The notification system provides a comprehensive way to send, manage, and display notifications across the application. It supports real-time notifications via WebSocket, persistent storage, and different notification types.

## Features

- ✅ **Real-time notifications** via WebSocket
- ✅ **Persistent storage** in mock server
- ✅ **Multiple notification types** (appointment, consultation, task, user, followup, general)
- ✅ **Priority levels** (low, medium, high)
- ✅ **Read/unread status** tracking
- ✅ **Redux state management**
- ✅ **Context-based API**

## Architecture

### Components

1. **NotificationProvider** (`src/context/NotifSocketContext.tsx`)
   - Manages WebSocket connection
   - Provides notification context
   - Handles notification CRUD operations

2. **NotificationSlice** (`src/store/slices/NotificationSlice.ts`)
   - Redux state management for notifications
   - Handles notification actions and reducers

3. **NotificationService** (`src/utils/NotificationService.ts`)
   - Utility class for creating different types of notifications
   - Provides templates for common notification scenarios

## Usage Examples

### 1. Basic Notification Setup

```tsx
import { useNotification } from '../context/NotifSocketContext';
import { NotificationService } from '../utils/NotificationService';

const MyComponent = () => {
  const { sendNotification } = useNotification();

  const handleSomeAction = () => {
    // Create and send a notification
    const notification = NotificationService.createSystemNotification(
      'user123', // toUserId
      'Action Completed',
      'Your action has been completed successfully',
      'medium' // priority
    );
    
    sendNotification(notification);
  };
};
```

### 2. Appointment Notifications

```tsx
// When creating an appointment
const handleCreateAppointment = (appointmentData) => {
  // ... create appointment logic ...
  
  // Send notification to doctor
  const notification = NotificationService.createAppointmentNotification(
    appointmentData.doctorId, // toUserId
    currentUser.id, // fromUserId
    appointmentData.id, // appointmentId
    appointmentData.patientName,
    appointmentData.doctorName,
    appointmentData.appointmentSlot,
    'created' // action type
  );
  
  sendNotification(notification);
};
```

### 3. User Management Notifications

```tsx
// When creating a new user
const handleCreateUser = (userData) => {
  // ... create user logic ...
  
  // Send notification to admin
  const notification = NotificationService.createUserNotification(
    currentUser.id, // toUserId (admin)
    currentUser.id, // fromUserId
    userData.name,
    'created' // action type
  );
  
  sendNotification(notification);
};
```

### 4. Task Notifications

```tsx
// When assigning a task
const handleAssignTask = (taskData) => {
  // ... assign task logic ...
  
  // Send notification to assignee
  const notification = NotificationService.createTaskNotification(
    taskData.assigneeId, // toUserId
    currentUser.id, // fromUserId
    taskData.id, // taskId
    taskData.title,
    'assigned' // action type
  );
  
  sendNotification(notification);
};
```

### 5. Consultation Notifications

```tsx
// When completing a consultation
const handleCompleteConsultation = (consultationData) => {
  // ... complete consultation logic ...
  
  // Send notification to patient's doctor
  const notification = NotificationService.createConsultationNotification(
    consultationData.doctorId, // toUserId
    currentUser.id, // fromUserId
    consultationData.id, // consultationId
    consultationData.patientName,
    'completed' // action type
  );
  
  sendNotification(notification);
};
```

### 6. Bulk Notifications

```tsx
// Send notification to multiple users
const handleBulkNotification = () => {
  const userIds = ['user1', 'user2', 'user3'];
  
  const notifications = NotificationService.createBulkNotification(
    userIds,
    currentUser.id,
    'System Maintenance',
    'System will be down for maintenance from 2-4 AM',
    'general',
    'high'
  );
  
  // Send all notifications
  notifications.forEach(notification => {
    sendNotification(notification);
  });
};
```

## Notification Types

### 1. Appointment Notifications
- **Actions**: `created`, `updated`, `cancelled`, `reminder`
- **Context**: Patient name, doctor name, appointment slot
- **Recipients**: Doctor, patient, admin

### 2. Consultation Notifications
- **Actions**: `completed`, `started`, `followup_required`
- **Context**: Patient name, consultation details
- **Recipients**: Doctor, patient

### 3. Task Notifications
- **Actions**: `assigned`, `completed`, `overdue`, `updated`
- **Context**: Task title, assignee
- **Recipients**: Task assignee, task creator

### 4. User Notifications
- **Actions**: `created`, `updated`, `deleted`, `role_changed`
- **Context**: User name, role changes
- **Recipients**: Admin, affected user

### 5. General Notifications
- **Actions**: Custom
- **Context**: Any system message
- **Recipients**: Any user or group

## Priority Levels

- **Low**: Informational messages, completed tasks
- **Medium**: Standard notifications, updates
- **High**: Urgent matters, cancellations, overdue items

## Integration Points

### 1. Layout Component
The notification bell in the header automatically:
- Shows unread count
- Displays notification dropdown
- Handles marking notifications as read
- Navigates to relevant pages when clicked

### 2. Redux Store
Notifications are stored in Redux state and can be:
- Filtered by type, priority, read status
- Sorted by creation date
- Searched by content

### 3. WebSocket
Real-time notifications are delivered via WebSocket for:
- Instant delivery
- Live updates
- Cross-tab synchronization

## Best Practices

### 1. Notification Content
- Keep titles concise and descriptive
- Include relevant context in messages
- Use appropriate priority levels
- Provide actionable information

### 2. Recipient Selection
- Only notify relevant users
- Consider user roles and permissions
- Avoid notification spam
- Use bulk notifications sparingly

### 3. Error Handling
- Always wrap notification calls in try-catch
- Handle WebSocket connection failures gracefully
- Provide fallback for offline scenarios

### 4. Performance
- Batch notifications when possible
- Clean up old notifications periodically
- Limit notification history size

## Configuration

### WebSocket URL
```tsx
// In NotificationProvider
ws.current = new WebSocket('ws://localhost:8000');
```

### Mock Server Endpoints
```tsx
// Notifications CRUD
GET    /Notifications          // Fetch all notifications
POST   /Notifications          // Create notification
PATCH  /Notifications/:id      // Update notification
DELETE /Notifications/:id      // Delete notification
```

### Redux State Structure
```tsx
interface NotificationState {
  notifications: Notification[];
  loading: boolean;
  error: string | null;
}
```

## Troubleshooting

### Common Issues

1. **Notifications not appearing**
   - Check WebSocket connection
   - Verify Redux store is properly configured
   - Ensure NotificationProvider is wrapping the app

2. **Real-time updates not working**
   - Check WebSocket server is running
   - Verify WebSocket URL is correct
   - Check browser console for connection errors

3. **Notifications not persisting**
   - Verify mock server is running
   - Check API endpoints are correct
   - Ensure proper error handling

### Debug Tips

```tsx
// Enable debug logging
const { sendNotification, notifications } = useNotification();

console.log('Current notifications:', notifications);
console.log('Sending notification:', notificationData);
```

## Future Enhancements

- [ ] Email notifications
- [ ] Push notifications
- [ ] Notification preferences
- [ ] Notification templates
- [ ] Advanced filtering
- [ ] Notification analytics
