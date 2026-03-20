import React, { useRef } from "react";
import styles from "./SidebarItem.module.css";

interface SidebarItemProps {
  onClick?: () => void;
  onContextMenu?: (
    e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>,
  ) => void;
  selected?: boolean;
  children: React.ReactNode;
}

export function SidebarItem({
  onClick,
  onContextMenu,
  selected = false,
  children,
}: SidebarItemProps) {
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    timerRef.current = setTimeout(() => {
      if (onContextMenu) {
        e.preventDefault();
        onContextMenu(e);
      }
    }, 500);
  };

  const handleTouchEnd = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
  };

  return (
    <div
      className={`${styles.sidebarItem} ${selected ? styles.selected : ""}`}
      onClick={onClick}
      onContextMenu={(e) => {
        e.preventDefault();
        if (onContextMenu) onContextMenu(e);
      }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchEnd}
    >
      {children}
    </div>
  );
}
