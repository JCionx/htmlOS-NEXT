import Window from "../Window/Window";
import styles from "./Windows.module.css";
import type { WindowConfig } from "../../types/window";
import { useEffect, useState, useRef } from "react";

interface WindowZIndexes {
  [key: string]: number;
}

interface WindowsProps {
  windows: WindowConfig[];
  setWindows: React.Dispatch<React.SetStateAction<WindowConfig[]>>;
  activeWindowId: string | null;
  onActivate: (id: string) => void;
  windowZIndexes: WindowZIndexes;
  setWindowZIndexes: React.Dispatch<React.SetStateAction<WindowZIndexes>>;
  onAnyTaskbarOverlapChange?: (anyOverlapping: boolean) => void;
  onRequestFilePicker: (formats: string[]) => void;
  requestedFilePath: string;
  mobileMode: boolean;
  activitiesOpen?: boolean;
  setActivitiesOpen: (open: boolean) => void;
  menuOpen?: boolean;
  minimizedWindowIds: string[];
  setMinimizeState: (id: string, minimized: boolean) => void;
  systemColorScheme: "light" | "dark";
  colorScheme: string;
  onOpenFile: (path: string, appId: string) => void;
}

function Windows({
  windows,
  setWindows,
  activeWindowId,
  onActivate,
  windowZIndexes,
  setWindowZIndexes,
  onAnyTaskbarOverlapChange,
  onRequestFilePicker,
  requestedFilePath,
  mobileMode,
  activitiesOpen,
  setActivitiesOpen,
  menuOpen,
  minimizedWindowIds,
  setMinimizeState,
  systemColorScheme,
  colorScheme,
  onOpenFile,
}: WindowsProps) {
  const handleWindowClose = (id: string) => {
    const remainingWindows = windows.filter((window) => window.id !== id);

    // In mobile mode, smoothly scroll to the next window before removing
    if (mobileMode && activitiesOpen && remainingWindows.length > 0) {
      // Find the index of the closed window
      const closedIndex = windows.findIndex((w) => w.id === id);
      // Get the next window (or previous if closing the last one)
      const nextWindow =
        closedIndex < remainingWindows.length
          ? remainingWindows[closedIndex]
          : remainingWindows[remainingWindows.length - 1];

      // Smoothly scroll to it
      if (nextWindow) {
        const element = document.getElementById(`window-${nextWindow.id}`);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", inline: "center" });
        }
      }

      // Delay window removal to allow scroll animation to complete
      setTimeout(() => {
        setWindows(remainingWindows);
      }, 300);
    } else {
      setWindows(remainingWindows);
    }

    // Optional: Clean up z-index for the closed window
    setWindowZIndexes((prevZIndexes) => {
      const { [id]: _, ...rest } = prevZIndexes;
      return rest;
    });
    // Optional: If the closed window was active, reset activeWindowId
    // In mobile mode, don't activate another window to prevent auto-zoom
    if (activeWindowId === id) {
      if (mobileMode && remainingWindows.length > 0) {
        // Clear active window but don't trigger zoom on another
        onActivate("");
      } else {
        onActivate("");
      }
    }
    // UPDATE TO USE PROP FUNCTION
    setMinimizeState(id, false);
    console.log(`Window ${id} closed`);
  };

  const handleSpawnWindow = (
    id: string,
    title: string,
    url: string,
    icon: string,
    defaultX: number,
    defaultY: number,
    borderless: boolean,
    defaultWidth: number,
    defaultHeight: number,
    minWidth: number,
    minHeight: number,
    maxWidth: number,
    maxHeight: number,
    allowResize: boolean,
    allowMaximize: boolean,
    permissions: {
      positionManipulation: boolean;
      windowSpawning: boolean;
      cameraAccess: boolean;
      microphoneAccess: boolean;
      diskAccess: boolean;
    },
  ) => {
    const newWindow: WindowConfig = {
      id,
      title,
      url,
      icon,
      defaultX,
      defaultY,
      borderless,
      defaultWidth,
      defaultHeight,
      minWidth,
      minHeight,
      maxWidth,
      maxHeight,
      allowResize,
      allowMaximize,
      permissions,
    };

    if (windows.some((window) => window.id === id)) {
      console.log(`Window ${id} already exists`);
      return;
    }

    setWindows((prevWindows) => [...prevWindows, newWindow]);
    onActivate(id);
    console.log(`Window ${id} spawned`);
  };

  const getWindowZIndex = (id: string) => {
    return windowZIndexes[id] || 0;
  };

  const [overlappingIds, setOverlappingIds] = useState<string[]>([]);
  const windowsEmpty = windows.length === 0;
  const prevWindowsLengthRef = useRef(windows.length);

  useEffect(() => {
    const windowClosed = prevWindowsLengthRef.current > windows.length;
    prevWindowsLengthRef.current = windows.length;

    // Don't auto-scroll when a window is closed in mobile mode
    if (mobileMode && activeWindowId && !windowClosed) {
      const element = document.getElementById(`window-${activeWindowId}`);
      if (element) {
        element.scrollIntoView({ behavior: "auto", inline: "center" });
      }
    }
  }, [activeWindowId, mobileMode, windows.length]);

  useEffect(() => {
    if (onAnyTaskbarOverlapChange) {
      onAnyTaskbarOverlapChange(overlappingIds.length > 0);
    }
  }, [overlappingIds, onAnyTaskbarOverlapChange]);

  const handleTaskbarOverlapChange = (id: string, isOverlapping: boolean) => {
    setOverlappingIds((prev) => {
      if (isOverlapping) {
        // Add id if not already present
        return prev.includes(id) ? prev : [...prev, id];
      } else {
        // Remove id if present
        return prev.filter((winId) => winId !== id);
      }
    });

    // Optional: Logging
    if (isOverlapping) {
      console.log(`Window ${id} is overlapping with the taskbar`);
    } else {
      console.log(`Window ${id} is no longer overlapping with the taskbar`);
    }
  };

  return (
    <>
      <div
        className={`${
          mobileMode ? styles.mobileWindowsContainer : styles.windowsContainer
        }
        ${activitiesOpen ? styles.windowsContainerActivitiesOpen : ""}
        ${mobileMode && menuOpen && !windowsEmpty ? styles.windowsContainerMenuOpen : ""}
        ${mobileMode && windowsEmpty ? styles.mobileWindowsContainerEmpty : ""}`}
        id="windowsContainer"
      >
        {windows.map((windowConfig) => (
          <Window
            key={windowConfig.id} // React needs a unique key for list items
            id={windowConfig.id}
            isActive={activeWindowId === windowConfig.id}
            onActivate={onActivate}
            onClose={handleWindowClose}
            onSpawnWindow={handleSpawnWindow}
            zIndex={getWindowZIndex(windowConfig.id)}
            title={windowConfig.title}
            url={windowConfig.url}
            icon={windowConfig.icon}
            defaultX={windowConfig.defaultX}
            defaultY={windowConfig.defaultY}
            borderless={windowConfig.borderless}
            defaultWidth={windowConfig.defaultWidth}
            defaultHeight={windowConfig.defaultHeight}
            minWidth={windowConfig.minWidth}
            minHeight={windowConfig.minHeight}
            maxWidth={windowConfig.maxWidth}
            maxHeight={windowConfig.maxHeight}
            allowResize={windowConfig.allowResize}
            allowMaximize={windowConfig.allowMaximize}
            permissions={windowConfig.permissions}
            onTaskbarOverlapChange={handleTaskbarOverlapChange}
            onRequestFilePicker={(formats) =>
              onRequestFilePicker(formats || [])
            }
            requestedFilePath={requestedFilePath}
            mobileMode={mobileMode}
            activitiesOpen={activitiesOpen}
            setActivitiesOpen={setActivitiesOpen}
            isMinimized={minimizedWindowIds.includes(windowConfig.id)}
            setMinimizeState={(minimized) =>
              setMinimizeState(windowConfig.id, minimized)
            }
            systemColorScheme={systemColorScheme}
            colorScheme={colorScheme}
            fileInput={windowConfig.fileInput}
            onOpenFile={onOpenFile}
          />
        ))}
      </div>
    </>
  );
}

export default Windows;
