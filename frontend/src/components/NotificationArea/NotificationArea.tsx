//import { useSettings } from "../../contexts/SettingsContext";
import styles from "./NotificationArea.module.css";
import { X } from "lucide-react";

interface NotificationAreaProps {
  mobileMode?: boolean;
}

function NotificationArea({ mobileMode }: NotificationAreaProps) {
  if (mobileMode) {
    return <div></div>;
  } else {
    return <></>;
    return (
      <div className={styles.notificationArea}>
        <div className={styles.notification}>
          <button className={styles.notificationClose}>
            <X size={18} />
          </button>
          <img
            src="notification-icon.png"
            alt="Notification Icon"
            className={styles.notificationIcon}
          />
          <div className={styles.notificationText}>
            <span className={styles.notificationTitle}>Notification Title</span>
            <span className={styles.notificationContent}>
              Notification content
            </span>
          </div>
        </div>
        <div className={styles.notification}>
          <button className={styles.notificationClose}>
            <X size={18} />
          </button>
          <img
            src="notification-icon.png"
            alt="Notification Icon"
            className={styles.notificationIcon}
          />
          <div className={styles.notificationText}>
            <span className={styles.notificationTitle}>Notification Title</span>
            <span className={styles.notificationContent}>
              Notification content
            </span>
          </div>
        </div>
        <div className={styles.notification}>
          <button className={styles.notificationClose}>
            <X size={18} />
          </button>
          <img
            src="notification-icon.png"
            alt="Notification Icon"
            className={styles.notificationIcon}
          />
          <div className={styles.notificationText}>
            <span className={styles.notificationTitle}>Notification Title</span>
            <span className={styles.notificationContent}>
              Notification content
            </span>
          </div>
        </div>
      </div>
    );
  }
}

export default NotificationArea;
