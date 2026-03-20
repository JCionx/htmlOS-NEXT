import styles from "./Button.module.css";

interface ButtonProps {
  type?: "primary" | "secondary";
  disabled?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export function Button({
  disabled = false,
  type = "primary",
  onClick,
  children,
  style,
}: ButtonProps) {
  return (
    <button
      className={`${styles.button} ${type == "secondary" ? styles.secondary : ""}`}
      onClick={onClick}
      disabled={disabled}
      style={style}
    >
      {children}
    </button>
  );
}
