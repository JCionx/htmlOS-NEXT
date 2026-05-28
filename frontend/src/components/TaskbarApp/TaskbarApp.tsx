import styles from "./TaskbarApp.module.css";
import DefaultIcon from "./assets/default.png";
import type { WindowConfig } from "../../types/window";
import type { MouseEvent, TouchEvent } from "react";
import { useEffect, useRef, useState } from "react";

interface TaskbarProps {
  window: WindowConfig;
  runningApp: boolean;
  isActive: boolean;
  onActivate: (id: string) => void;
  onOpenApp?: (id: string) => void;
  onContextMenu?: (
    id: string,
    e: MouseEvent<HTMLDivElement> | TouchEvent<HTMLDivElement>,
  ) => void;
  onDragStart?: (id: string) => void;
  onDropPinned?: (id: string, placeAfter: boolean) => void;
  isMinimized: boolean;
  isPinned?: boolean;
}

function TaskbarApp({
  window,
  runningApp,
  isActive,
  onActivate,
  onOpenApp,
  onContextMenu,
  onDragStart,
  onDropPinned,
  isMinimized,
  isPinned = false,
}: TaskbarProps) {
  const [clicked, setClicked] = useState(false);
  const [focused, setFocused] = useState(false);
  const touchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressTriggeredRef = useRef(false);
  const draggingRef = useRef(false);
  const taskbarAppRef = useRef<HTMLDivElement>(null);

  function handleClick() {
    if (runningApp) {
      setFocused(true);
      setTimeout(() => {
        setFocused(false);
      }, 300);
      onActivate(window.id);
    } else {
      setClicked(true);
      setTimeout(() => {
        setClicked(false);
      }, 300);
      onOpenApp?.(window.id);
    }
  }

  function clearTouchTimer() {
    if (touchTimerRef.current) {
      clearTimeout(touchTimerRef.current);
      touchTimerRef.current = null;
    }
  }

  function openContextMenu(
    event: MouseEvent<HTMLDivElement> | TouchEvent<HTMLDivElement>,
  ) {
    onContextMenu?.(window.id, event);
  }

  useEffect(() => {
    const element = taskbarAppRef.current;
    if (!element) {
      return;
    }

    const handleContextMenu = (event: globalThis.MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();
      openContextMenu(event as unknown as MouseEvent<HTMLDivElement>);
    };

    const handleMouseDown = (event: globalThis.MouseEvent) => {
      if (event.button === 2) {
        event.preventDefault();
        event.stopPropagation();
        openContextMenu(event as unknown as MouseEvent<HTMLDivElement>);
      }
    };

    element.addEventListener("contextmenu", handleContextMenu, true);
    element.addEventListener("mousedown", handleMouseDown, true);

    return () => {
      element.removeEventListener("contextmenu", handleContextMenu, true);
      element.removeEventListener("mousedown", handleMouseDown, true);
    };
  }, [window.id, onContextMenu]);

  return (
    <div
      ref={taskbarAppRef}
      className={`${styles.taskbarAppContainer} ${isPinned && !runningApp ? styles.taskbarAppContainerPinnedClosed : ""}`}
      data-window-id={window.id}
      draggable={isPinned}
      onDragStart={() => {
        draggingRef.current = true;
        onDragStart?.(window.id);
      }}
      onDragEnd={() => {
        globalThis.setTimeout(() => {
          draggingRef.current = false;
        }, 0);
      }}
      onDragOver={(e) => {
        if (isPinned) {
          e.preventDefault();
        }
      }}
      onDrop={(e) => {
        if (isPinned) {
          e.preventDefault();
          const rect = e.currentTarget.getBoundingClientRect();
          onDropPinned?.(window.id, e.clientX > rect.left + rect.width / 2);
        }
      }}
      onTouchStart={(e) => {
        longPressTriggeredRef.current = false;
        touchTimerRef.current = setTimeout(() => {
          longPressTriggeredRef.current = true;
          e.preventDefault();
          onContextMenu?.(window.id, e);
        }, 500);
      }}
      onTouchEnd={clearTouchTimer}
      onTouchMove={clearTouchTimer}
    >
      <div
        key={window.id}
        className={`${styles.taskbarApp}
          ${clicked ? styles.taskbarAppClicked : ""}
          ${focused ? styles.taskbarAppFocused : ""}
          ${isActive ? styles.taskbarAppActive : ""}
          ${isMinimized ? styles.taskbarAppMinimized : ""}
          ${isPinned && !runningApp ? styles.taskbarAppPinnedClosed : ""}
        }`}
        style={isMinimized ? { transform: "scale(0.8)", opacity: 0.8 } : {}}
        onClick={() => {
          clearTouchTimer();
          if (longPressTriggeredRef.current) {
            longPressTriggeredRef.current = false;
            return;
          }
          if (draggingRef.current) {
            return;
          }
          handleClick();
        }}
      >
        <img
          src={window.icon ? window.icon : DefaultIcon}
          alt={`${window.title}'s app icon`}
          onError={(e) => {
            e.currentTarget.src = DefaultIcon;
            e.currentTarget.onerror = null;
          }}
        />
      </div>
      <div
        className={`${styles.taskbarAppFocusIndicator}
                    ${isActive ? "" : styles.taskbarAppFocusIndicatorHidden}
        `}
      ></div>
    </div>
  );
}

export default TaskbarApp;
