import styles from "./PopupTitle.module.css";

interface PopupTitleProps {
  children: React.ReactNode;
}

export function PopupTitle({ children }: PopupTitleProps) {
  return <span className={styles.popupTitle}>{children}</span>;
}
