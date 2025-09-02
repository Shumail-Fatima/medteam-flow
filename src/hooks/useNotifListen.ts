// hooks/useNotificationListener.js
import { useEffect } from "react";
import { createNotificationChannel } from "../utils/NotificationChannel";

export const useNotificationListener = (onReceive: any) => {
  useEffect(() => {
    const channel = createNotificationChannel();

    channel.onmessage = (event) => {
      if (event?.data) {
        onReceive(event.data);
      }
    };

    return () => {
      channel.close();
    };
  }, [onReceive]);
};
