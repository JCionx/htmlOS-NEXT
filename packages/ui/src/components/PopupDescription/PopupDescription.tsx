import styles from "./PopupDescription.module.css";

interface PopupDescriptionProps {
  children: React.ReactNode;
}

export function PopupDescription({ children }: PopupDescriptionProps) {
  return <span className={styles.popupDescription}>{children}</span>;
}
