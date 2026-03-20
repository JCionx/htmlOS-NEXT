import styles from "./Popup.module.css";

interface PopupProps {
  open?: boolean;
  children: React.ReactNode;
}

export function Popup({ open = false, children }: PopupProps) {
  return (
    <div
      className={`${styles.popupContainer} ${open ? "" : styles.popupClosed}`}
    >
      <div className={styles.popup}>
        <div className={styles.popupContent}>{children}</div>
      </div>
    </div>
  );
}
