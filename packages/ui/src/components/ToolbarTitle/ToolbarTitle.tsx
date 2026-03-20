import styles from "./ToolbarTitle.module.css";

interface ToolbarTitleProps {
  children: React.ReactNode;
}

export function ToolbarTitle({ children }: ToolbarTitleProps) {
  return <h3 className={styles.toolbarTitle}>{children}</h3>;
}
