import React from "react";
import { useDevice } from "../DeviceContext/DeviceContext";

interface IconComponentProps {
  size?: number | string;
  color?: string;
  strokeWidth?: number | string;
  className?: string;
}

interface IconProps {
  icon: React.ComponentType<IconComponentProps>;
  size?: number | "default";
  color?: string | "default" | "selected";
  className?: string;
}

export function Icon({
  icon: IconComponent,
  size = "default",
  color = "default",
  className,
}: IconProps) {
  const { isMobile } = useDevice();

  const finalSize = size === "default" ? (isMobile ? 24 : 18) : size;
  const finalColor = color === "selected" ? "var(--icon-color)" : color;

  if (color === "default")
    return (
      <IconComponent
        size={finalSize}
        className={className}
        strokeWidth={isMobile ? 2.5 : 2}
      />
    );

  return (
    <IconComponent
      size={finalSize}
      color={finalColor}
      className={className}
      strokeWidth={isMobile ? 2.5 : 2}
    />
  );
}
