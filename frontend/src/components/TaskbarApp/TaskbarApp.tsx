import styles from "./TaskbarApp.module.css";
import DefaultIcon from "./assets/default.png";
import type { WindowConfig } from "../../types/window";
import { useState } from "react";

interface TaskbarProps {
  window: WindowConfig;
  runningApp: boolean;
  isActive: boolean;
  onActivate: (id: string) => void;
  isMinimized: boolean;
}

function TaskbarApp({
  window,
  runningApp,
  isActive,
  onActivate,
  isMinimized,
}: TaskbarProps) {
  const [clicked, setClicked] = useState(false);
  const [focused, setFocused] = useState(false);

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
    }
  }

  return (
    <div className={styles.taskbarAppContainer} data-window-id={window.id}>
      <div
        key={window.id}
        className={`${styles.taskbarApp}
          ${clicked ? styles.taskbarAppClicked : ""}
          ${focused ? styles.taskbarAppFocused : ""}
          ${isActive ? styles.taskbarAppActive : ""}
          ${isMinimized ? styles.taskbarAppMinimized : ""}
        }`}
        style={isMinimized ? { transform: "scale(0.8)", opacity: 0.8 } : {}}
        onClick={() => {
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
