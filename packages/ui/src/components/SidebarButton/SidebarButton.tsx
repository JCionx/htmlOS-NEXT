import React from "react";
import styles from "./SidebarButton.module.css";

interface SidebarButtonProps {
  onClick?: () => void;
  children: React.ReactNode;
}

export function SidebarButton({ onClick, children }: SidebarButtonProps) {
  return (
    <button className={styles.sidebarMainBtn} onClick={onClick}>
      {children}
    </button>
  );
}
