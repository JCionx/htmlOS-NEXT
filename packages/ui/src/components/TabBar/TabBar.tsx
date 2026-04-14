import styles from "./TabBar.module.css";

interface TabBarProps {
  children: React.ReactNode;
}

export function TabBar({ children }: TabBarProps) {
  return <div className={styles.tabbar}>{children}</div>;
}
