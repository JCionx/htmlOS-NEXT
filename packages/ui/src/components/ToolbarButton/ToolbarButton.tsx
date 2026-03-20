import styles from "./ToolbarButton.module.css";

interface ToolbarButtonProps {
  onClick?: (
    e:
      | React.MouseEvent<HTMLButtonElement>
      | React.TouchEvent<HTMLButtonElement>,
  ) => void;
  children: React.ReactNode;
}

export function ToolbarButton({ onClick, children }: ToolbarButtonProps) {
  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        if (onClick) onClick(e);
      }}
      className={styles.toolbarBtn}
    >
      {children}
    </button>
  );
}
