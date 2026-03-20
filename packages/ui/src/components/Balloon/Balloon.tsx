import styles from "./Balloon.module.css";
import type { CSSProperties, HTMLAttributes, ReactNode } from "react";

interface BalloonProps extends HTMLAttributes<HTMLDivElement> {
  open: boolean;
  x?: number;
  y?: number;
  children: ReactNode;
}

export function Balloon({
  open,
  x,
  y,
  children,
  className,
  style,
  ...rest
}: BalloonProps) {
  const positionStyle: CSSProperties = {};

  if (typeof x === "number") {
    positionStyle.left = x;
  }

  if (typeof y === "number") {
    positionStyle.top = y;
  }

  const balloonClassName = [
    styles.balloon,
    open ? styles.balloonOpen : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      {...rest}
      className={balloonClassName}
      style={{ ...style, ...positionStyle }}
    >
      {children}
    </div>
  );
}
