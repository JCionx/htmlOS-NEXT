import React from "react";
import { useDevice } from "../DeviceContext/DeviceContext";

interface IconComponentProps {
  size?: number | string;
  color?: string;
  strokeWidth?: number | string;
  className?: string;
  fill?: string;
}

interface IconProps {
  icon: React.ComponentType<IconComponentProps>;
  size?: number | "default";
  color?: string | "default" | "selected";
  fill?: string;
  className?: string;
}

export function Icon({
  icon: IconComponent,
  size = "default",
  color = "default",
  fill,
  className,
}: IconProps) {
  const { isMobile } = useDevice();

  const finalSize = size === "default" ? (isMobile ? 24 : 18) : size;
  const finalColor = color === "selected" ? "var(--icon-color)" : color;

  if (fill) {
    if (color === "default")
      return (
        <IconComponent
          size={finalSize}
          className={className}
          strokeWidth={isMobile ? 2.5 : 2}
          fill={fill}
        />
      );

    return (
      <IconComponent
        size={finalSize}
        color={finalColor}
        className={className}
        strokeWidth={isMobile ? 2.5 : 2}
        fill={fill}
      />
    );
  }

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
