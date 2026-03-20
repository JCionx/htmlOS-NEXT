import React, { useLayoutEffect, useRef, useState } from "react";
import styles from "./ContextMenu.module.css";
import { useDevice } from "../DeviceContext/DeviceContext";

type FromType =
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right"
  | "auto";

interface ContextMenuProps {
  open: boolean;
  x?: number;
  y?: number;
  from?: FromType;
  children: React.ReactNode;
}

// Define a specific type for our internal coordinate state
interface MenuCoords {
  top: number | "auto";
  bottom: number | "auto";
  left: number | "auto";
  right: number | "auto";
}

export function ContextMenu({
  open,
  x = 20,
  y = 20,
  from = "auto",
  children,
}: ContextMenuProps) {
  const { isMobile } = useDevice();
  const menuRef = useRef<HTMLDivElement>(null);

  const [calculatedFrom, setCalculatedFrom] =
    useState<Exclude<FromType, "auto">>("top-left");
  const [coords, setCoords] = useState<MenuCoords>({
    top: y,
    left: x,
    bottom: "auto",
    right: "auto",
  });

  useLayoutEffect(() => {
    if (!open || !menuRef.current) return;

    if (from === "auto") {
      const menuRect = menuRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let finalLeft = x;
      let finalTop = y;
      let vertical: "top" | "bottom" = "top";
      let horizontal: "left" | "right" = "left";

      if (x + menuRect.width > viewportWidth) {
        finalLeft = x - menuRect.width;
        horizontal = "right";
      }

      if (y + menuRect.height > viewportHeight) {
        finalTop = y - menuRect.height;
        vertical = "bottom";
      }

      setCalculatedFrom(
        `${vertical}-${horizontal}` as Exclude<FromType, "auto">,
      );
      setCoords({
        top: Math.max(5, finalTop),
        left: Math.max(5, finalLeft),
        bottom: "auto",
        right: "auto",
      });
    } else {
      setCalculatedFrom(from);
      setCoords({
        top: from.includes("top") ? y : "auto",
        bottom: from.includes("bottom") ? y : "auto",
        left: from.includes("left") ? x : "auto",
        right: from.includes("right") ? x : "auto",
      });
    }
  }, [open, x, y, from]);

  const multipliers = {
    "top-left": { tx: "-10%", ty: "-10%", origin: "top left" },
    "top-right": { tx: "10%", ty: "-10%", origin: "top right" },
    "bottom-left": { tx: "-10%", ty: "10%", origin: "bottom left" },
    "bottom-right": { tx: "10%", ty: "10%", origin: "bottom right" },
  };

  const { tx, ty, origin } = multipliers[calculatedFrom];

  const positionStyle = {
    position: "fixed",
    top: typeof coords.top === "number" ? `${coords.top}px` : "auto",
    bottom: typeof coords.bottom === "number" ? `${coords.bottom}px` : "auto",
    left: typeof coords.left === "number" ? `${coords.left}px` : "auto",
    right: typeof coords.right === "number" ? `${coords.right}px` : "auto",
    "--tx-start": tx,
    "--ty-start": ty,
    "--origin": origin,
  } as React.CSSProperties;

  return (
    <div
      ref={menuRef}
      className={`
        ${styles.contextMenu}
        ${open ? styles.contextMenuOpen : ""}
        ${isMobile ? styles.contextMenuMobile : ""}
      `}
      style={positionStyle}
    >
      {children}
    </div>
  );
}
