import styles from "./Taskbar.module.css";
import TaskbarApp from "../TaskbarApp/TaskbarApp";
import TaskbarMenu from "../TaskbarMenu/TaskbarMenu";
import ActivitiesButton from "../ActivitiesButton/ActivitiesButton";
import type { WindowConfig } from "../../types/window";
import type { MouseEvent, TouchEvent } from "react";
import { useRef, useLayoutEffect, useState } from "react";
import StatusBar from "../Statusbar/StatusBar";
import ContextMenu from "../ContextMenu/ContextMenu";
import { Pin, PinOff, X } from "lucide-react";

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
  hasContinuityLaunch?: boolean;
  onOpenContinuityLaunch?: () => void;
  continuityLaunchIcon?: string;
  installedApps?: WindowConfig[];
  pinnedAppIds?: string[];
  onOpenApp?: (appId: string) => void;
  onPinApp?: (appId: string) => void;
  onUnpinApp?: (appId: string) => void;
  onCloseApp?: (appId: string) => void;
  onReorderPinnedApps?: (appIds: string[]) => void;
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
  hasContinuityLaunch = false,
  onOpenContinuityLaunch,
  continuityLaunchIcon,
  installedApps = [],
  pinnedAppIds = [],
  onOpenApp,
  onPinApp,
  onUnpinApp,
  onCloseApp,
  onReorderPinnedApps,
}: TaskbarProps) {
  const taskbarRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState<string | undefined>(undefined);
  const [contextMenu, setContextMenu] = useState<{
    open: boolean;
    x: number;
    y: number;
    appId: string | null;
  }>({ open: false, x: 0, y: 0, appId: null });
  const draggedPinnedAppIdRef = useRef<string | null>(null);

  const openWindowById = new Map(windows.map((window) => [window.id, window]));
  const appById = new Map(installedApps.map((app) => [app.id, app]));
  const pinnedAppIdSet = new Set(pinnedAppIds);
  const pinnedItems = pinnedAppIds
    .map((appId) => openWindowById.get(appId) ?? appById.get(appId))
    .filter((app): app is WindowConfig => Boolean(app));
  const unpinnedRunningItems = windows.filter(
    (window) => !pinnedAppIdSet.has(window.id),
  );
  const taskbarItems = [...pinnedItems, ...unpinnedRunningItems];

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
      taskbarRef.current.getBoundingClientRect();
      taskbarRef.current.style.transition = "";

      setWidth(`${newWidth}px`);
    }
  }, [windows.length, pinnedAppIds.length]);

  const handleAppContextMenu = (
    appId: string,
    e: MouseEvent<HTMLDivElement> | TouchEvent<HTMLDivElement>,
  ) => {
    let x: number;
    let y: number;

    if ("clientX" in e) {
      x = e.clientX;
      y = e.clientY;
    } else {
      x = e.touches[0].clientX;
      y = e.touches[0].clientY;
    }

    e.stopPropagation();
    setContextMenu({ open: true, x, y, appId });
  };

  const handlePinnedDrop = (targetAppId: string, placeAfter: boolean) => {
    const draggedAppId = draggedPinnedAppIdRef.current;
    draggedPinnedAppIdRef.current = null;

    if (!draggedAppId || draggedAppId === targetAppId) {
      return;
    }

    const nextPinnedAppIds = pinnedAppIds.filter((id) => id !== draggedAppId);
    const targetIndex = nextPinnedAppIds.indexOf(targetAppId);

    if (targetIndex < 0) {
      return;
    }

    nextPinnedAppIds.splice(
      targetIndex + (placeAfter ? 1 : 0),
      0,
      draggedAppId,
    );
    onReorderPinnedApps?.(nextPinnedAppIds);
  };

  const contextAppId = contextMenu.appId;
  const contextAppIsPinned = contextAppId
    ? pinnedAppIdSet.has(contextAppId)
    : false;
  const contextAppIsRunning = contextAppId
    ? openWindowById.has(contextAppId)
    : false;

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
          hasContinuityLaunch={hasContinuityLaunch}
          onOpenContinuityLaunch={onOpenContinuityLaunch}
          continuityLaunchIcon={continuityLaunchIcon}
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
            {taskbarItems.map((window) => {
              const isPinned = pinnedAppIdSet.has(window.id);
              const isRunning = openWindowById.has(window.id);
              return (
                <TaskbarApp
                  key={window.id}
                  window={window}
                  runningApp={isRunning}
                  isActive={activeWindowId === window.id}
                  onActivate={onActivate}
                  onOpenApp={onOpenApp}
                  onContextMenu={handleAppContextMenu}
                  onDragStart={(appId) => {
                    draggedPinnedAppIdRef.current = appId;
                  }}
                  onDropPinned={handlePinnedDrop}
                  isMinimized={minimizedWindowIds.includes(window.id)}
                  isPinned={isPinned}
                />
              );
            })}
          </div>
          <div className={styles.taskbarInfo}></div>
          <ContextMenu
            open={contextMenu.open}
            x={contextMenu.x}
            y={contextMenu.y}
            onClose={() => setContextMenu((prev) => ({ ...prev, open: false }))}
          >
            {contextAppId && (
              <>
                <button
                  className={styles.contextMenuItem}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (contextAppIsPinned) {
                      onUnpinApp?.(contextAppId);
                    } else {
                      onPinApp?.(contextAppId);
                    }
                    setContextMenu((prev) => ({ ...prev, open: false }));
                  }}
                >
                  {contextAppIsPinned ? (
                    <PinOff size={16} />
                  ) : (
                    <Pin size={16} />
                  )}
                  <span>
                    {contextAppIsPinned
                      ? "Unpin from taskbar"
                      : "Pin to taskbar"}
                  </span>
                </button>
                {contextAppIsRunning && (
                  <button
                    className={styles.contextMenuItem}
                    onClick={(e) => {
                      e.stopPropagation();
                      onCloseApp?.(contextAppId);
                      setContextMenu((prev) => ({ ...prev, open: false }));
                    }}
                  >
                    <X size={16} />
                    <span>Close</span>
                  </button>
                )}
              </>
            )}
          </ContextMenu>
        </div>
        <StatusBar
          mobileMode={mobileMode}
          overlapping={windowsOverlappingTaskbar}
          floating={!floating}
          edges={edges}
          hasContinuityLaunch={hasContinuityLaunch}
          onOpenContinuityLaunch={onOpenContinuityLaunch}
          continuityLaunchIcon={continuityLaunchIcon}
        />
      </div>
    );
  }
}

export default Taskbar;
