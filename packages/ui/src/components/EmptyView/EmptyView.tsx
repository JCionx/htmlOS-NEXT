import React from "react";
import { useDevice } from "../DeviceContext/DeviceContext";
import { Icon } from "../Icon/Icon";
import styles from "./EmptyView.module.css";

interface IconComponentProps {
  size?: number | string;
  color?: string;
  strokeWidth?: number | string;
  className?: string;
}

interface IconProps {
  icon: React.ComponentType<IconComponentProps>;
  label: string;
}

export function EmptyView({ icon, label }: IconProps) {
  const { isMobile } = useDevice();

  const finalSize = isMobile ? 64 : 48;

  return (
    <div className={styles.emptyView}>
      <Icon icon={icon} size={finalSize} color={"var(--text-secondary)"} />
      <h2>{label}</h2>
    </div>
  );
}
