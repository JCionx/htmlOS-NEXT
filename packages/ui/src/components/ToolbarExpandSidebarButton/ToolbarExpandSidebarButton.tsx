import styles from "./ToolbarExpandSidebarButton.module.css";

import { Menu } from "lucide-react";
import { ToolbarButton } from "../ToolbarButton/ToolbarButton";
import { useDevice } from "../DeviceContext/DeviceContext";

interface ToolbarExpandSidebarButtonProps {
  onToggleSidebar?: () => void;
  expanded?: boolean;
}

export function ToolbarExpandSidebarButton({
  onToggleSidebar,
  expanded = false,
}: ToolbarExpandSidebarButtonProps) {
  const { isMobile } = useDevice();

  return (
    <ToolbarButton onClick={onToggleSidebar}>
      <Menu
        size={isMobile ? 24 : 18}
        className={`${styles.sidebarIcon} ${expanded ? styles.sidebarIconExpanded : ""}`}
      />
    </ToolbarButton>
  );
}
