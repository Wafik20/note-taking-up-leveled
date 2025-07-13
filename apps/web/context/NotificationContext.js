import { createContext, useContext, useState, useCallback } from 'react';

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const [notification, setNotification] = useState(null);
  const [timeoutId, setTimeoutId] = useState(null);

  const showNotification = useCallback((message, type = 'info', duration = 3000) => {
    setNotification({ message, type });
    if (timeoutId) clearTimeout(timeoutId);
    const id = setTimeout(() => setNotification(null), duration);
    setTimeoutId(id);
  }, [timeoutId]);

  const hideNotification = useCallback(() => {
    setNotification(null);
    if (timeoutId) clearTimeout(timeoutId);
  }, [timeoutId]);

  return (
    <NotificationContext.Provider value={{ notification, showNotification, hideNotification }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  return useContext(NotificationContext);
} 