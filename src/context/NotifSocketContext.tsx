// NotificationSocketContext.tsx
import React, { createContext, useContext, useEffect, useRef } from 'react';

const NotificationSocketContext = createContext<WebSocket | null>(null);

export const NotificationSocketProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    ws.current = new WebSocket('ws://localhost:8000');
    ws.current.onopen = () => console.log('WebSocket connected');
    ws.current.onclose = () => console.log('WebSocket disconnected');
    return () => ws.current?.close();
  }, []);

  return (
    <NotificationSocketContext.Provider value={ws.current}>
      {children}
    </NotificationSocketContext.Provider>
  );
};

export const useNotificationSocket = () => useContext(NotificationSocketContext);