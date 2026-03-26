import { useRef, useState, useEffect } from "react";
import Taskbar from "../Taskbar/Taskbar";
import StartMenu from "../StartMenu/StartMenu";
import Windows from "../Windows/Windows";
import FilePicker from "../FilePicker/FilePicker";
import { useSettings } from "../../contexts/SettingsContext";
import "../../App.css";
import "../../assets/fonts/inter.css";
import type { WindowConfig } from "../../types/window";
import NotificationArea from "../NotificationArea/NotificationArea";

interface WindowZIndexes {
  [key: string]: number;
}

interface DesktopProps {
  systemColorScheme: "light" | "dark";
  mobileMode: boolean;
  colorScheme: string;
  username: string;
}

function Desktop({
  systemColorScheme,
  mobileMode,
  colorScheme,
  username,
}: DesktopProps) {
  const {
    language,
    taskbarFloating,
    taskbarEdges,
    wallpaper,
    isLoading: settingsLoading,
  } = useSettings();

  const [installedApps, setInstalledApps] = useState<WindowConfig[]>([]);
  const [windows, setWindows] = useState<WindowConfig[]>([]);
  const [activeWindowId, setActiveWindowId] = useState<string | null>(null);
  const [windowZIndexes, setWindowZIndexes] = useState<WindowZIndexes>({});
  const [windowsOverlappingTaskbar, setWindowsOverlappingTaskbar] =
    useState<boolean>(false);

  const [minimizedWindowIds, setMinimizedWindowIds] = useState<string[]>([]);

  const zIndexRef = useRef(10);
  const [startMenuOpen, setStartMenuOpen] = useState(false);
  const [activitiesOpen, setActivitiesOpen] = useState(false);
  const [filePickerOpen, setFilePickerOpen] = useState(false);
  const [filePickerFormats, setFilePickerFormats] = useState<string[]>([]);
  const [requestedFilePath, setRequestedFilePath] = useState("");

  useEffect(() => {
    if (requestedFilePath !== "") {
      setFilePickerOpen(false);
      const timer = setTimeout(() => {
        setRequestedFilePath("");
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [requestedFilePath]);

  // When there are no running windows, keep recents closed and show all apps
  useEffect(() => {
    if (mobileMode && windows.length === 0) {
      const timeout = window.setTimeout(
        () => {
          setActivitiesOpen(false);
          setStartMenuOpen(true);
        },
        mobileMode ? 250 : 0,
      );
      return () => window.clearTimeout(timeout);
    }
  }, [windows.length, mobileMode]);

  // Apply wallpaper background
  useEffect(() => {
    if (wallpaper) {
      let backgroundUrl: string;

      if (wallpaper.startsWith("builtin:")) {
        // Built-in wallpapers are in the public folder
        const filename = wallpaper.replace("builtin:", "");
        backgroundUrl = `url("./${filename}")`;
      } else {
        // User-uploaded wallpapers are stored in backend
        backgroundUrl = `url("${import.meta.env.VITE_BACKEND_ADDRESS}/wallpapers/user/${wallpaper}")`;
      }

      document.body.style.backgroundImage = backgroundUrl;
    } else {
      document.body.style.backgroundImage = "";
    }
  }, [wallpaper]);

  // Fetch apps and initialize windows
  useEffect(() => {
    const fetchApps = async () => {
      try {
        const res = await fetch(
          import.meta.env.VITE_BACKEND_ADDRESS + "/apps/list",
          {
            credentials: "include",
          },
        );
        const apps = await res.json();
        const configs: WindowConfig[] = apps.map((app: any, _idx: number) => ({
          id: app.id,
          title: app.locale?.[language] ?? app.name,
          url:
            import.meta.env.VITE_BACKEND_ADDRESS +
            "/apps/run/" +
            app.id +
            "/" +
            app.entry_point,
          icon:
            import.meta.env.VITE_BACKEND_ADDRESS +
            "/apps/run/" +
            app.id +
            "/" +
            app.icon_path,
          ...(app.allow_resize != null && {
            allowResize: app.allow_resize === 1,
          }),
          ...(app.allow_maximize != null && {
            allowMaximize: app.allow_maximize === 1,
          }),
          ...(app.default_width != null && { defaultWidth: app.default_width }),
          ...(app.default_height != null && {
            defaultHeight: app.default_height,
          }),
          ...(app.min_width != null && { minWidth: app.min_width }),
          ...(app.min_height != null && { minHeight: app.min_height }),
          ...(app.max_width != null && { maxWidth: app.max_width }),
          ...(app.max_height != null && { maxHeight: app.max_height }),
          ...(app.default_x != null && { defaultX: app.default_x }),
          ...(app.default_y != null && { defaultY: app.default_y }),
          ...(app.borderless != null && { borderless: app.borderless === 1 }),
          permissions: {
            positionManipulation:
              app.permissions?.includes("positionManipulation") ?? false,
            windowSpawning:
              app.permissions?.includes("windowSpawning") ?? false,
            cameraAccess: app.permissions?.includes("cameraAccess") ?? false,
            microphoneAccess:
              app.permissions?.includes("microphoneAccess") ?? false,
            diskAccess: app.permissions?.includes("diskAccess") ?? false,
          },
        }));
        setInstalledApps(configs);
      } catch (e) {
        console.error("Failed to fetch apps:", e);
      }
    };
    fetchApps();

    // Listen for app list refresh requests from App Store
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === "refreshAppList") {
        console.log("Refreshing app list...");
        fetchApps();
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [language]);

  const handleWindowActivate = (id: string) => {
    setActiveWindowId(id);
    setStartMenuOpen(false);
    // Only close activities if actually activating a window (not clearing)
    if (id !== "") {
      setActivitiesOpen(false);
    }
    zIndexRef.current += 1;
    const newZIndex = zIndexRef.current;
    setWindowZIndexes((prevZIndexes) => ({
      ...prevZIndexes,
      [id]: newZIndex,
    }));

    if (minimizedWindowIds.includes(id)) {
      setMinimizedWindowIds((prev) => prev.filter((wId) => wId !== id));
    }

    console.log(`Window ${id} activated, new z-index: ${newZIndex}`);
  };

  const handleSetMinimizeState = (id: string, minimized: boolean) => {
    setMinimizedWindowIds((prev) => {
      if (minimized) {
        return prev.includes(id) ? prev : [...prev, id];
      } else {
        return prev.filter((wId) => wId !== id);
      }
    });
  };

  const handleTaskbarMenuClick = () => {
    setStartMenuOpen(!startMenuOpen);
    setActivitiesOpen(false);
  };

  const handleCenterButtonClick = () => {
    setStartMenuOpen((open) => !open);
    setActivitiesOpen(false);
  };

  const handleActivitiesButtonClick = () => {
    if (windows.length === 0) {
      setActivitiesOpen(false);
      setStartMenuOpen(true);
      return;
    }

    setActivitiesOpen((open) => {
      const next = !open;
      if (next) {
        setStartMenuOpen(false);
      }
      return next;
    });
  };

  const handleOpenFile = async (path: string, appId: string) => {
    const app = installedApps.find((a) => a.id === appId);
    if (!app) {
      console.error(`App ${appId} not found`);
      return;
    }

    try {
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
      const tempUrl = `${import.meta.env.VITE_BACKEND_ADDRESS}${url}`;

      const fileInput = { path, url: tempUrl };

      setWindows((prev) => {
        const index = prev.findIndex((w) => w.id === appId);
        if (index >= 0) {
          // Update existing window
          const newWindows = [...prev];
          newWindows[index] = { ...newWindows[index], fileInput };
          return newWindows;
        } else {
          // Spawn new window
          return [...prev, { ...app, fileInput }];
        }
      });
      handleWindowActivate(appId);
    } catch (err) {
      console.error("Failed to get temp url", err);
    }
  };

  // Don't render until settings are loaded
  if (settingsLoading) {
    return null; // Or a loading spinner
  }

  return (
    <>
      {filePickerOpen && (
        <FilePicker
          formats={filePickerFormats}
          setRequestedFilePath={(path) => setRequestedFilePath(path)}
          mobileMode={mobileMode}
        />
      )}
      <Windows
        windows={windows}
        setWindows={setWindows}
        activeWindowId={activeWindowId}
        onActivate={handleWindowActivate}
        windowZIndexes={windowZIndexes}
        setWindowZIndexes={setWindowZIndexes}
        onAnyTaskbarOverlapChange={(anyOverlapping) =>
          setWindowsOverlappingTaskbar(anyOverlapping)
        }
        onRequestFilePicker={(formats) => {
          setFilePickerFormats(formats);
          setFilePickerOpen(true);
        }}
        requestedFilePath={requestedFilePath}
        mobileMode={mobileMode}
        activitiesOpen={activitiesOpen}
        setActivitiesOpen={(open) => setActivitiesOpen(open)}
        menuOpen={startMenuOpen}
        minimizedWindowIds={minimizedWindowIds}
        setMinimizeState={handleSetMinimizeState}
        systemColorScheme={systemColorScheme}
        colorScheme={colorScheme}
        onOpenFile={handleOpenFile}
      ></Windows>
      <StartMenu
        apps={installedApps}
        menuOpen={startMenuOpen}
        setMenuOpen={(open) => setStartMenuOpen(open)}
        openApp={(appId) => {
          const app = installedApps.find((app) => app.id === appId);
          const isAppOpen = windows.some((win) => win.id === appId);
          if (isAppOpen) {
            handleWindowActivate(appId);
            return;
          }
          if (app) {
            setWindows((prevWindows) => [...prevWindows, app]);
            handleWindowActivate(appId);
          }
        }}
        mobileMode={mobileMode}
        username={username}
      ></StartMenu>
      <Taskbar
        windows={windows}
        activeWindowId={activeWindowId}
        onActivate={handleWindowActivate}
        onTaskbarMenuClick={handleTaskbarMenuClick}
        onCenterButtonClick={handleCenterButtonClick}
        onActivitiesButtonClick={handleActivitiesButtonClick}
        taskbarMenuOpen={startMenuOpen}
        activitiesOpen={activitiesOpen}
        windowsOverlappingTaskbar={windowsOverlappingTaskbar}
        mobileMode={mobileMode}
        minimizedWindowIds={minimizedWindowIds}
        floating={taskbarFloating}
        edges={taskbarEdges}
      ></Taskbar>
      <NotificationArea mobileMode={mobileMode} />
    </>
  );
}

export default Desktop;
