import { Rnd } from "react-rnd";
import { motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import styles from "./Window.module.css";
import { setupMessageHandler } from "./MessageHandler";
import { useSettings } from "../../contexts/SettingsContext";
import closeButtonIcon from "./assets/icons/close-button.svg";
import maximizeButtonIcon from "./assets/icons/maximize-button.svg";
import restoreButtonIcon from "./assets/icons/restore-button.svg";
import minimizeButtonIcon from "./assets/icons/minimize-button.svg";
import reloadButtonIcon from "./assets/icons/reload-button.png";
import inspectButtonIcon from "./assets/icons/inspect-button.svg";

import DefaultIcon from "./assets/default.png";

declare module "react" {
  interface CSSProperties {
    "--window-border-radius"?: string; // Define --window-border-radius as a CSS variable
  }
}

// Window props
interface WindowProps {
  id: string;
  isActive: boolean;
  onActivate: (id: string) => void;
  onClose?: (id: string) => void;
  onSpawnWindow: (
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
  ) => void;
  zIndex?: number;
  title?: string;
  url?: string;
  icon?: string;
  allowResize?: boolean;
  allowMaximize?: boolean;
  defaultWidth?: number;
  defaultHeight?: number;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
  defaultX?: number;
  defaultY?: number;
  borderless?: boolean;
  permissions?: {
    positionManipulation: boolean;
    windowSpawning: boolean;
    cameraAccess: boolean;
    microphoneAccess: boolean;
    diskAccess: boolean;
  };
  onTaskbarOverlapChange: (id: string, isOverlapping: boolean) => void;
  onRequestFilePicker: (formats: string[]) => void;
  requestedFilePath: string;
  mobileMode: boolean;
  activitiesOpen?: boolean;
  setActivitiesOpen: (open: boolean) => void;
  // Add isMinimized to interface
  isMinimized: boolean;
  setMinimizeState: (minimized: boolean) => void;
  systemColorScheme: "light" | "dark";
  colorScheme: string;
  fileInput?: {
    path: string;
    url: string;
  };
  onOpenFile: (path: string, appId: string) => void;
}

function Window({
  id,
  isActive,
  onActivate,
  onClose,
  onSpawnWindow,
  zIndex = 10,
  title = "Window",
  url = "https://example.com",
  icon,
  allowResize = true,
  allowMaximize = true,
  defaultWidth = 600,
  defaultHeight = 400,
  minWidth = 300,
  minHeight = 200,
  maxWidth = window.innerWidth,
  maxHeight = window.innerHeight,
  defaultX = 30,
  defaultY = 30,
  borderless = false,
  permissions = {
    positionManipulation: false,
    windowSpawning: false,
    cameraAccess: false,
    microphoneAccess: false,
    diskAccess: false,
  },
  onTaskbarOverlapChange,
  onRequestFilePicker,
  requestedFilePath,
  mobileMode,
  activitiesOpen = false,
  setActivitiesOpen,
  isMinimized,
  setMinimizeState,
  systemColorScheme,
  colorScheme,
  fileInput,
  onOpenFile,
}: WindowProps) {
  const {
    language,
    setLanguage,
    timezone,
    setTimezone,
    taskbarFloating,
    setTaskbarFloating,
    taskbarEdges,
    setTaskbarEdges,
    setColorScheme,
    twentyFourHourClock,
    setTwentyFourHourClock,
    showSeconds,
    setShowSeconds,
    showDeveloperOptions,
    setShowDeveloperOptions,
    showReloadButton,
    setShowReloadButton,
    showInspectButton,
    setShowInspectButton,
    wallpaper,
    setWallpaper,
  } = useSettings();

  const [isDragging, setIsDragging] = useState(false);
  const [isMaximized, setIsMaximised] = useState(false);
  const [isClosing, setIsClosing] = useState(false); // Mobile: Add toggle for exit animation

  const [currentTitle, setCurrentTitle] = useState(title);
  const [currentXPosition, setCurrentXPosition] = useState(defaultX);
  const [currentYPosition, setCurrentYPosition] = useState(defaultY);
  const [currentWidth, setCurrentWidth] = useState(defaultWidth);
  const [currentHeight, setCurrentHeight] = useState(defaultHeight);
  const [taskbarOverlapping, setTaskbarOverlapping] = useState(false);

  const [isAnimationMaximized, enableSizePositionAnimation] = useState(false);
  const [pendingFilePick, setPendingFilePick] = useState(false);

  const rndRef = useRef<Rnd>(null); // Reference to the Rnd component
  const iframeRef = useRef<HTMLIFrameElement>(null!); // Reference to the iframe

  const iframeURL =
    url +
    (url.includes("?") ? "&" : "?") +
    "theme=" +
    (colorScheme !== "system" ? colorScheme : systemColorScheme) +
    "&mobile=" +
    mobileMode +
    "&lang=" +
    encodeURIComponent(language) +
    (fileInput
      ? "&fileInputPath=" +
        encodeURIComponent(fileInput.path) +
        "&fileInputUrl=" +
        encodeURIComponent(fileInput.url)
      : "");

  useEffect(() => {
    if (isMinimized) {
      enableSizePositionAnimation(true);
    } else {
      const timer = setTimeout(() => {
        enableSizePositionAnimation(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isMinimized]);

  // handle window close
  const handleClose = () => {
    onTaskbarOverlapChange?.(id, false);
    onClose?.(id);
  };

  useEffect(() => {
    let ignore = false;

    if (!ignore) onActivate(id);
    return () => {
      ignore = true;
    };
  }, []);

  // State to manage z-indexes of windows
  useEffect(() => {
    const handleDragOver = (event: DragEvent) => {
      onActivate(id);
      console.log(event);
    };

    window.addEventListener("dragover", handleDragOver);

    return () => {
      window.removeEventListener("dragover", handleDragOver);
    };
  }, []);

  useEffect(() => {
    const cleanup = setupMessageHandler({
      id,
      iframeRef,
      permissions,
      isMaximized,
      currentHeight,
      currentWidth,
      rndRef,
      onSpawnWindow,
      onOpenFile,
      onClose: handleClose,
      onMaximize,
      onRequestFilePicker: handleFilePick,
      setCurrentTitle,
      setCurrentXPosition,
      setCurrentYPosition,
      setCurrentWidth,
      setCurrentHeight,
      enableSizePositionAnimation,
      requestTempUrl,
      handleFilePick,
      handleClose,
      // Pass settings from context
      language,
      setLanguage,
      timezone,
      setTimezone,
      taskbarFloating,
      setTaskbarFloating,
      taskbarEdges,
      setTaskbarEdges,
      colorScheme,
      setColorScheme,
      twentyFourHourClock,
      setTwentyFourHourClock,
      showSeconds,
      setShowSeconds,
      showDeveloperOptions,
      setShowDeveloperOptions,
      showReloadButton,
      setShowReloadButton,
      showInspectButton,
      setShowInspectButton,
      wallpaper,
      setWallpaper,
    });

    return cleanup;
  }, [
    id,
    currentXPosition,
    currentYPosition,
    currentWidth,
    currentHeight,
    isMaximized,
    // Add settings to dependencies
    language,
    timezone,
    taskbarFloating,
    taskbarEdges,
    colorScheme,
    twentyFourHourClock,
    showSeconds,
    showDeveloperOptions,
    showReloadButton,
    showInspectButton,
    wallpaper,
    setWallpaper,
  ]);

  useEffect(() => {
    if (iframeRef.current) {
      iframeRef.current.src = iframeURL;
    }
  }, [colorScheme, systemColorScheme, language, mobileMode, fileInput]);

  useEffect(() => {
    if (requestedFilePath !== "" && pendingFilePick) {
      (async () => {
        const tempUrl =
          requestedFilePath === "/cancel"
            ? "cancel"
            : await requestTempUrl(requestedFilePath);
        iframeRef.current?.contentWindow?.postMessage(
          {
            type: "file",
            url: tempUrl,
          },
          "*",
        );
      })();
      setPendingFilePick(false);
    }
  }, [requestedFilePath, pendingFilePick]);

  function handleFilePick(formats: string[]) {
    setPendingFilePick(true);
    onRequestFilePicker(formats);
  }

  const updateTaskbarOverlap = () => {
    const y = rndRef.current?.getDraggablePosition().y ?? currentYPosition;
    //const width = currentWidth;
    let heightValue = currentHeight;
    if (typeof heightValue === "function") {
      heightValue = currentHeight;
    }

    const windowBottom = y + heightValue;
    const taskbarTop = window.innerHeight - 50;

    const isOverlapping = windowBottom > taskbarTop && y < window.innerHeight;
    setTaskbarOverlapping(isOverlapping);

    onTaskbarOverlapChange?.(id, isOverlapping);
  };

  const handleDragResizeStart = () => {
    setIsDragging(true);
    onActivate(id);
  };

  const handleDragResizeStop = () => {
    setIsDragging(false);
    onActivate(id);
    updateTaskbarOverlap();
  };

  const handleOverlayClick = () => {
    if (!isDragging && !activitiesOpen) {
      onActivate(id);
    }
  };

  const onMinimize = () => {
    onActivate(id);

    if (!isMinimized) {
      // Find the taskbar icon element
      const taskbarIcon = document.querySelector(`[data-window-id="${id}"]`);

      if (
        taskbarIcon &&
        rndRef.current &&
        rndRef.current.resizableElement.current
      ) {
        const iconRect = taskbarIcon.getBoundingClientRect();

        // Calculate the center point of the icon
        const destX = iconRect.left + iconRect.width / 2;
        const destY = iconRect.top + iconRect.height / 2;

        // Set CSS variables on the element so the CSS class knows where to go
        // We set these on the internal resizable element of the Rnd component
        rndRef.current.resizableElement.current.style.setProperty(
          "--minimize-dest-x",
          `${destX}px`,
        );
        rndRef.current.resizableElement.current.style.setProperty(
          "--minimize-dest-y",
          `${destY}px`,
        );
      }
      // Use Prop
      setMinimizeState(true);
    } else {
      // Use Prop
      setMinimizeState(false);
    }
  };

  const onMaximize = () => {
    onActivate(id);

    enableSizePositionAnimation(true);
    setTimeout(() => {
      enableSizePositionAnimation(false);
    }, 300);

    if (!isMaximized) {
      // Save current position and size before maximizing
      setCurrentXPosition(rndRef.current?.getDraggablePosition().x || 0);
      setCurrentYPosition(rndRef.current?.getDraggablePosition().y || 0);
    }

    setIsMaximised(!isMaximized);
    const maximizedWidth = "100vw";
    const maximizedHeight = "100vh";

    rndRef.current?.updateSize({
      width: isMaximized ? currentWidth : maximizedWidth,
      height: isMaximized ? currentHeight : maximizedHeight,
    });

    rndRef.current?.updatePosition({
      x: isMaximized ? currentXPosition : 0,
      y: isMaximized ? currentYPosition : 0,
    });

    if (isMaximized) {
      if (taskbarOverlapping) {
        onTaskbarOverlapChange?.(id, true);
      } else {
        onTaskbarOverlapChange?.(id, false);
      }
    } else {
      onTaskbarOverlapChange?.(id, true);
    }
  };

  const overlayPointerEvents = isActive && !isDragging ? "none" : "auto";

  async function requestTempUrl(path: string) {
    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_ADDRESS}/data/temp`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path }),
        credentials: "include",
      },
    );

    const { url } = await response.json();

    return `${import.meta.env.VITE_BACKEND_ADDRESS}${url}`;
  }

  if (mobileMode) {
    return (
      <motion.div
        id={`window-${id}`}
        className={`${styles.mobileWindow} ${
          activitiesOpen ? styles.mobileWindowActivitiesOpen : ""
        }`}
        style={{
          zIndex: zIndex,
        }}
        animate={
          isClosing
            ? { y: -1000, opacity: 0 } // Fly off screen if closing
            : {
                scale: activitiesOpen ? 0.7 : 1,
                y: 0,
              }
        }
        transition={{ duration: 0.3, ease: "easeOut" }}
        onTap={() => {
          if (activitiesOpen) {
            setActivitiesOpen(false);
          } else {
            onActivate(id);
          }
        }}
        drag={activitiesOpen ? "y" : false}
        // 2. Limit how far it can be dragged (optional, creates resistance)
        dragConstraints={{ top: -300, bottom: 0 }}
        // 3. Snap back to origin if not closed
        dragSnapToOrigin
        onDragStart={() => setIsDragging(true)}
        // 4. The Logic
        onDragEnd={(_event, info) => {
          setTimeout(() => setIsDragging(false), 50);
          // If dragged up more than 200px OR flicked up fast
          if (info.offset.y < -200 || info.velocity.y < -500) {
            setIsClosing(true);
          }
        }}
        // 5. Actually destroy the window after the animation finishes
        onAnimationComplete={() => {
          if (isClosing) {
            handleClose();
          }
        }}
      >
        <div className={styles.mobileHeader}>
          <img
            src={icon ? icon : DefaultIcon}
            alt=""
            className={styles.windowIcon}
            draggable={false}
            onError={(e) => {
              e.currentTarget.src = DefaultIcon;
              e.currentTarget.onerror = null;
            }}
          />
          <p className={styles.mobileTitle}>{title}</p>
        </div>
        <div className={styles.windowContent}>
          <iframe
            ref={iframeRef}
            src={iframeURL}
            frameBorder="0"
            className={`${styles.windowFrame} ${styles.mobileWindowFrame}`}
            allow={[
              "autoplay",
              "fullscreen",
              "clipboard-read",
              "clipboard-write",
              permissions.cameraAccess ? "camera" : "",
              permissions.microphoneAccess ? "microphone" : "",
            ]
              .filter(Boolean)
              .join(";")}
          ></iframe>
          <div
            className={styles.contentOverlay}
            style={{
              // backgroundColor: debuggingColor,
              pointerEvents: overlayPointerEvents,
            }}
            onClick={handleOverlayClick}
          />
        </div>
      </motion.div>
    );
  } else {
    return (
      <Rnd
        ref={rndRef}
        minWidth={minWidth}
        minHeight={minHeight}
        maxWidth={maxWidth}
        maxHeight={maxHeight}
        default={{
          x: defaultX,
          y: defaultY,
          width: defaultWidth,
          height: defaultHeight,
        }}
        onDragStart={handleDragResizeStart}
        onDragStop={handleDragResizeStop}
        onResize={(_e, _direction, ref, _delta, _position) => {
          setCurrentWidth(ref.offsetWidth);
          setCurrentHeight(ref.offsetHeight);
        }}
        onResizeStart={handleDragResizeStart}
        onResizeStop={handleDragResizeStop}
        dragHandleClassName={styles.windowDescription}
        enableResizing={allowResize && !isMaximized}
        disableDragging={isMaximized}
        bounds={"body"}
        // Combine animation classes. We use .windowTransition for general movement smoothing
        className={`${isAnimationMaximized || isMinimized ? styles.windowTransition : ""} ${isMinimized ? styles.windowMinimized : ""}`}
        style={{
          zIndex: zIndex,
          "--window-border-radius": isMaximized ? "0px" : "14px",
          transformOrigin: "top left", // Critical for the coordinate calculation to work
        }}
      >
        <div className={styles.window}>
          {/* only render if borderless is false */}
          {!(borderless && permissions.positionManipulation) && (
            <div className={styles.windowHeader}>
              <div className={styles.windowDescription}>
                {icon && (
                  <img
                    src={icon ? icon : DefaultIcon}
                    alt=""
                    className={styles.windowIcon}
                    draggable={false}
                    onError={(e) => {
                      e.currentTarget.src = DefaultIcon;
                      e.currentTarget.onerror = null;
                    }}
                  />
                )}
                <div
                  className={
                    icon
                      ? styles.windowTitle
                      : `${styles.windowTitle} ${styles.windowTitleIconless}`
                  }
                >
                  {currentTitle}
                </div>
              </div>
              <div className={styles.windowControls}>
                {showInspectButton && (
                  <>
                    <button
                      className={styles.minimizeButton}
                      onClick={() => {
                        alert(`
Window ID: ${id}
Title: ${currentTitle}
URL: ${iframeURL}
Position: (${rndRef.current?.getDraggablePosition().x}, ${rndRef.current?.getDraggablePosition().y})
Size: (${currentWidth} x ${currentHeight})
Is Maximized: ${isMaximized}
Is Minimized: ${isMinimized}
Permissions: ${JSON.stringify(permissions, null, 2)}
${
  fileInput &&
  `Input file path: ${fileInput.path}
Input file URL: ${fileInput.url}`
}

                          `);
                      }}
                    >
                      <img
                        src={inspectButtonIcon}
                        alt="Window dev inspect button"
                        draggable={false}
                      />
                    </button>
                  </>
                )}
                {showReloadButton && (
                  <button
                    className={styles.minimizeButton}
                    onClick={() => {
                      if (iframeRef.current) {
                        const src = iframeRef.current.src;
                        iframeRef.current.src = src;
                      }
                    }}
                  >
                    <img
                      src={reloadButtonIcon}
                      alt="Window dev reload button"
                      draggable={false}
                    />
                  </button>
                )}
                <button className={styles.minimizeButton} onClick={onMinimize}>
                  <img
                    src={minimizeButtonIcon}
                    alt="Window minimize button"
                    draggable={false}
                  />
                </button>
                {allowMaximize && (
                  <button
                    className={styles.maximizeButton}
                    onClick={onMaximize}
                  >
                    <img
                      src={isMaximized ? restoreButtonIcon : maximizeButtonIcon}
                      alt="Window maximize button"
                      draggable={false}
                    />
                  </button>
                )}
                <button
                  className={styles.closeButton}
                  onClick={() => handleClose()}
                >
                  <img
                    src={closeButtonIcon}
                    alt="Window close button"
                    draggable={false}
                  />
                </button>
              </div>
            </div>
          )}
          <div className={styles.windowContent}>
            <iframe
              ref={iframeRef}
              src={iframeURL}
              frameBorder="0"
              className={styles.windowFrame}
              allow={[
                "autoplay",
                "fullscreen",
                "clipboard-read",
                "clipboard-write",
                permissions.cameraAccess ? "camera" : "",
                permissions.microphoneAccess ? "microphone" : "",
              ]
                .filter(Boolean)
                .join(";")}
            ></iframe>
            <div
              className={styles.contentOverlay}
              style={{
                // backgroundColor: debuggingColor,
                pointerEvents: overlayPointerEvents,
              }}
              onClick={handleOverlayClick}
            />
          </div>
        </div>
      </Rnd>
    );
  }
}

export default Window;
