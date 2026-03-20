import styles from "./SettingEntry.module.css";

interface SettingEntryProps {
  children: React.ReactNode;
}

export function SettingEntry({ children }: SettingEntryProps) {
  return <div className={styles.settingEntry}>{children}</div>;
}
