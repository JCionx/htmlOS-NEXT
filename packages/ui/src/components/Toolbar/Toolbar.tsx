import { useDevice } from "../DeviceContext/DeviceContext";
import styles from "./Toolbar.module.css";

interface ToolbarProps {
  expanded?: boolean;
  collapsed?: boolean;
  children: React.ReactNode;
}

export function Toolbar({
  expanded = true,
  collapsed = false,
  children,
}: ToolbarProps) {
  const { isMobile } = useDevice();

  return (
    <div
      className={`${styles.toolbar} ${expanded || isMobile ? styles.toolbarExpanded : ""} ${isMobile ? styles.toolbarMobile : ""} ${collapsed ? styles.toolbarCollapsed : ""}`}
    >
      {children}
    </div>
  );
}
