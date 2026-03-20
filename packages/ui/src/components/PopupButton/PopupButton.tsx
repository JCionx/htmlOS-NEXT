import styles from "./PopupButton.module.css";

interface PopupButtonProps {
  type?: "primary" | "secondary";
  onClick?: () => void;
  children: React.ReactNode;
}

export function PopupButton({
  type = "primary",
  onClick,
  children,
}: PopupButtonProps) {
  return (
    <button
      className={`${styles.popupBtn} ${type == "secondary" ? styles.secondary : ""}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
