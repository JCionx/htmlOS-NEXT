import styles from "./Taskbar.module.css";
import TaskbarApp from "../TaskbarApp/TaskbarApp";
import TaskbarMenu from "../TaskbarMenu/TaskbarMenu";
import ActivitiesButton from "../ActivitiesButton/ActivitiesButton";
import type { WindowConfig } from "../../types/window";
import { useRef, useLayoutEffect, useState } from "react";
import StatusBar from "../Statusbar/StatusBar";

interface TaskbarProps {
  windows: WindowConfig[];
  activeWindowId: string | null;
  onActivate: (id: string) => void;
  onTaskbarMenuClick: () => void;
  onCenterButtonClick: () => void;
  onActivitiesButtonClick: () => void;
  taskbarMenuOpen?: boolean;
  activitiesOpen?: boolean;
  windowsOverlappingTaskbar?: boolean;
  mobileMode?: boolean;
  minimizedWindowIds: string[];
  floating?: boolean;
  edges?: boolean;
}

function Taskbar({
  windows,
  activeWindowId,
  onActivate,
  onTaskbarMenuClick,
  // onCenterButtonClick,
  onActivitiesButtonClick,
  taskbarMenuOpen = false,
  activitiesOpen = false,
  windowsOverlappingTaskbar,
  mobileMode = false,
  minimizedWindowIds = [],
  floating = false,
  edges = false,
}: TaskbarProps) {
  const taskbarRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState<string | undefined>(undefined);

  useLayoutEffect(() => {
    if (taskbarRef.current) {
      const oldWidth = taskbarRef.current.style.width;
      // Temporarily unset width to measure natural size
      taskbarRef.current.style.transition = "none";
      taskbarRef.current.style.width = "auto";
      const newWidth = taskbarRef.current.scrollWidth;

      // Restore old width to animate from
      taskbarRef.current.style.width = oldWidth;
      // Force reflow
      taskbarRef.current.offsetHeight;
      taskbarRef.current.style.transition = "";

      setWidth(`${newWidth}px`);
    }
  }, [windows.length]);

  if (mobileMode) {
    return (
      <div className={styles.mobileTaskbar}>
        <TaskbarMenu
          onClick={onTaskbarMenuClick}
          menuOpen={taskbarMenuOpen}
          mobileMode={mobileMode}
        />
        <StatusBar
          mobileMode={mobileMode}
          overlapping={windowsOverlappingTaskbar}
          floating={!floating}
          edges={edges}
        />
        <ActivitiesButton
          onClick={onActivitiesButtonClick}
          activitiesOpen={activitiesOpen}
        />
      </div>
    );
  } else {
    return (
      <div
        className={`${styles.taskbarContainer} ${!floating ? styles.taskbarContainerExpanded : ""} ${windowsOverlappingTaskbar ? styles.taskbarContainerCollapsed : ""} ${edges ? styles.taskbarContainerEdges : ""}`}
      >
        <div
          className={`
            ${styles.taskbar}
            ${windowsOverlappingTaskbar ? styles.taskbarCollapsed : ""}
            ${!floating ? styles.taskbarExpanded : ""}
            ${edges ? styles.taskbarEdges : ""}
          `}
          ref={taskbarRef}
          style={{ width: width }}
        >
          <div className={styles.startButton}></div>
          <div className={styles.taskbarApps}>
            <TaskbarMenu
              onClick={onTaskbarMenuClick}
              menuOpen={taskbarMenuOpen}
              mobileMode={mobileMode}
            />
            {windows.map((window) => (
              <TaskbarApp
                key={window.id}
                window={window}
                runningApp={true}
                isActive={activeWindowId === window.id}
                onActivate={onActivate}
                isMinimized={minimizedWindowIds.includes(window.id)}
              />
            ))}
          </div>
          <div className={styles.taskbarInfo}></div>
        </div>
        <StatusBar
          mobileMode={mobileMode}
          overlapping={windowsOverlappingTaskbar}
          floating={!floating}
          edges={edges}
        />
      </div>
    );
  }
}

export default Taskbar;
