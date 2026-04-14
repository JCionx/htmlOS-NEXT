import styles from "./TabContainer.module.css";

interface TabContainerProps {
  children?: React.ReactNode;
}

export function TabContainer({ children }: TabContainerProps) {
  return <div className={styles.tabContainer}>{children}</div>;
}
