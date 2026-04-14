import styles from "./ToolbarButton.module.css";

interface ToolbarButtonProps {
  disabled?: boolean;
  onClick?: (
    e:
      | React.MouseEvent<HTMLButtonElement>
      | React.TouchEvent<HTMLButtonElement>,
  ) => void;
  children: React.ReactNode;
}

export function ToolbarButton({
  disabled = false,
  onClick,
  children,
}: ToolbarButtonProps) {
  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        if (onClick) onClick(e);
      }}
      className={`${styles.toolbarBtn} ${disabled ? styles.toolbarBtnDisabled : ""}`}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
