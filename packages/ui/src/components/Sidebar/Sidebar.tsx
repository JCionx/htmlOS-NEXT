import React from "react";
import styles from "./Sidebar.module.css";
import { useDevice } from "../DeviceContext/DeviceContext";

interface SidebarProps {
  open: boolean;
  footer?: React.ReactNode;
  children: React.ReactNode;
}

export function Sidebar({ open, footer, children }: SidebarProps) {
  const { isMobile } = useDevice();

  return (
    <div
      className={`
        ${styles.sidebar}
        ${open ? "" : styles.sidebarCollapsed}
        ${isMobile ? styles.sidebarMobile : ""}
        ${!open && isMobile ? styles.sidebarMobileHidden : ""}`}
    >
      <div className={styles.sidebarContent}>{children}</div>
      {footer && <div className={styles.sidebarFooter}>{footer}</div>}
    </div>
  );
}
