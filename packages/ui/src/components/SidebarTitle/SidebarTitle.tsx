import React from "react";
import styles from "./SidebarTitle.module.css";

interface SidebarTitleProps {
  children: React.ReactNode;
}

export function SidebarTitle({ children }: SidebarTitleProps) {
  return <h2 className={styles.sidebarTitle}>{children}</h2>;
}
