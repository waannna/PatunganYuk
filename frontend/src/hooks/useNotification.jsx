// src/hooks/useNotification.jsx
import { useState, useCallback, createContext, useContext } from 'react';
import { NotifPopup } from '../components/ui/NotifPopup';

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);

  const addNotification = useCallback((message, type = 'info', duration = 4000, title = null) => {
    const id = Date.now() + Math.random();
    const newNotification = { id, message, type, duration, title };
    setNotifications(prev => [newNotification, ...prev]);
    
    if (duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, duration);
    }
    
    return id;
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  return (
    <NotificationContext.Provider value={{ notifications, addNotification, removeNotification }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
}

export function NotificationContainer() {
  const { notifications, removeNotification } = useNotification();
  
  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-50 w-96 max-w-[calc(100%-2rem)] space-y-2 pointer-events-none">
      <div className="pointer-events-auto space-y-2">
        {notifications.map((n) => (
          <NotifPopup
            key={n.id}
            message={n.message}
            type={n.type}
            duration={n.duration}
            title={n.title}
            onClose={() => removeNotification(n.id)}
          />
        ))}
      </div>
    </div>
  );
}