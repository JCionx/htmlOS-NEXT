import styles from "./ToolbarActions.module.css";

interface ToolbarActionsProps {
  children: React.ReactNode;
}

export function ToolbarActions({ children }: ToolbarActionsProps) {
  return <div className={styles.toolbarActions}>{children}</div>;
}
