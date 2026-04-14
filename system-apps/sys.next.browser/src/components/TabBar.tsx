//import { useDevice } from "../DeviceContext/DeviceContext";
//import styles from "./TabBar.module.css";

interface TabBarProps {
  expanded?: boolean;
  collapsed?: boolean;
  children: React.ReactNode;
}

export function TabBar({ children }: TabBarProps) {
  //const { isMobile } = useDevice();

  return (
    <div
      //className={`${styles.tabbar} ${expanded || isMobile ? styles.tabbarExpanded : ""} ${isMobile ? styles.tabbarMobile : ""} ${collapsed ? styles.tabbarCollapsed : ""}`}
      className="tabbar"
    >
      {children}
    </div>
  );
}
