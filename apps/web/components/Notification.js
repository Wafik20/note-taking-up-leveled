import { useNotification } from '../context/NotificationContext';
import styles from '../styles/Notification.module.css';

export default function Notification() {
  const { notification, hideNotification } = useNotification();

  if (!notification) return null;

  return (
    <div className={`${styles.toast} ${styles[notification.type]}`} onClick={hideNotification}>
      {notification.message}
    </div>
  );
} 