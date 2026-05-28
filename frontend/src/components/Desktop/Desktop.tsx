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
import { runtime } from "../../runtimeConfig";

import InstallPopup from "../InstallPopup/InstallPopup";
interface WindowZIndexes {
  [key: string]: number;
}

interface DesktopProps {
  systemColorScheme: "light" | "dark";
  mobileMode: boolean;
  colorScheme: string;
  username: string;
  continuityLaunch: {
    appId: string;
    data: Record<string, unknown>;
  } | null;
  onConsumeContinuity: () => void;
}

type ContinuityByApp = Record<string, Record<string, unknown>>;

function Desktop({
  systemColorScheme,
  mobileMode,
  colorScheme,
  username,
  continuityLaunch,
  onConsumeContinuity,
}: DesktopProps) {
  const {
    language,
    taskbarFloating,
    taskbarEdges,
    wallpaper,
    isLoading: settingsLoading,
  } = useSettings();

  const [installedApps, setInstalledApps] = useState<WindowConfig[]>([]);
  const [pinnedAppIds, setPinnedAppIds] = useState<string[]>([]);
  const [windows, setWindows] = useState<WindowConfig[]>([]);
  const [activeWindowId, setActiveWindowId] = useState<string | null>(null);
  const [windowZIndexes, setWindowZIndexes] = useState<WindowZIndexes>({});
  const [windowsOverlappingTaskbar, setWindowsOverlappingTaskbar] =
    useState<boolean>(false);

  const [minimizedWindowIds, setMinimizedWindowIds] = useState<string[]>([]);
  const [continuityByApp, setContinuityByApp] = useState<ContinuityByApp>({});
  const lastPublishedAppIdRef = useRef<string | null>(null);
  const lastPublishedDataKeyRef = useRef<string>("");

  const zIndexRef = useRef(10);
  const [startMenuOpen, setStartMenuOpen] = useState(false);
  const [activitiesOpen, setActivitiesOpen] = useState(false);
  const [filePickerOpen, setFilePickerOpen] = useState(false);
  const [filePickerFormats, setFilePickerFormats] = useState<string[]>([]);
  const [requestedFilePath, setRequestedFilePath] = useState("");

  const [installPopupOpen, setInstallPopupOpen] = useState(false);
  const [pendingInstallApp, setPendingInstallApp] = useState<any>(null);
  const [isUpdateMode, setIsUpdateMode] = useState(false);

  // Helper to compare versions (returns 1 if v1 > v2, -1 if v1 < v2, 0 if equal)
  const compareVersions = (v1: string, v2: string): number => {
    const parts1 = v1.split(".").map(Number);
    const parts2 = v2.split(".").map(Number);
    for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
      const p1 = parts1[i] || 0;
      const p2 = parts2[i] || 0;
      if (p1 > p2) return 1;
      if (p1 < p2) return -1;
    }
    return 0;
  };

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
        backgroundUrl = `url("${runtime.VITE_BACKEND_ADDRESS}/wallpapers/user/${wallpaper}")`;
      }

      document.body.style.backgroundImage = backgroundUrl;
    } else {
      document.body.style.backgroundImage = "";
    }
  }, [wallpaper]);

  // Listen for app installation requests from Browser
  useEffect(() => {
    const handleInstallAppMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === "browserInstallApp") {
        const incomingApp = event.data.app;

        // Check if app is already installed
        const installedApp = installedApps.find((a) => a.id === incomingApp.id);

        if (installedApp) {
          // App is installed - check version
          const versionCmp = compareVersions(
            incomingApp.version || "0.0.0",
            installedApp.version || "0.0.0",
          );

          // Only show popup if new version is greater
          if (versionCmp > 0) {
            setPendingInstallApp(incomingApp);
            setIsUpdateMode(true);
            setInstallPopupOpen(true);
          }
          // If same or older version, silently do nothing
        } else {
          // App is not installed - show popup for fresh install
          setPendingInstallApp(incomingApp);
          setIsUpdateMode(false);
          setInstallPopupOpen(true);
        }
      }
    };

    window.addEventListener("message", handleInstallAppMessage);
    return () => window.removeEventListener("message", handleInstallAppMessage);
  }, [installedApps, compareVersions]);

  const handleInstallRequest = async (appArg?: any) => {
    const appToInstall = appArg || pendingInstallApp;

    if (!appToInstall?.packageUrl) {
      console.error("Invalid install request", appToInstall);
      setInstallPopupOpen(false);
      setPendingInstallApp(null);
      return;
    }

    try {
      const response = await fetch(
        `${runtime.VITE_BACKEND_ADDRESS}/apps/install`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            app: appToInstall,
            packageUrl: appToInstall.packageUrl,
            callerAppId: "sys.next.browser",
          }),
        },
      );

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to install app");
      }

      window.postMessage({ type: "refreshAppList" }, "*");
    } catch (error) {
      console.error("Failed to install app from browser prompt:", error);
    } finally {
      setInstallPopupOpen(false);
      setPendingInstallApp(null);
    }
  };

  const handleCancelInstall = () => {
    setInstallPopupOpen(false);
    setPendingInstallApp(null);
  };

  // Fetch apps and initialize windows
  useEffect(() => {
    const fetchApps = async () => {
      try {
        const appsRes = await fetch(
          runtime.VITE_BACKEND_ADDRESS + "/apps/list",
          {
            credentials: "include",
          },
        );
        const apps = await appsRes.json();
        const configs: WindowConfig[] = apps.map((app: any, _idx: number) => ({
          id: app.id,
          title: app.locale?.[language] ?? app.name,
          url: `${runtime.VITE_BACKEND_ADDRESS}/apps/run/${app.id}/${app.entry_point}`,
          icon: `${runtime.VITE_BACKEND_ADDRESS}/apps/run/${app.id}/${app.icon_path}`,
          version: app.version,
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

      try {
        const pinnedRes = await fetch(
          runtime.VITE_BACKEND_ADDRESS + "/apps/pinned",
          {
            credentials: "include",
          },
        );
        const pinnedApps = await pinnedRes.json();

        if (Array.isArray(pinnedApps)) {
          setPinnedAppIds(
            pinnedApps
              .map((pinnedApp: { appId?: unknown }) => pinnedApp.appId)
              .filter(
                (appId: unknown): appId is string => typeof appId === "string",
              ),
          );
        }
      } catch (e) {
        console.error("Failed to fetch pinned apps:", e);
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

  const openAppById = (appId: string) => {
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
  };

  const applyPinnedRows = (rows: unknown) => {
    if (!Array.isArray(rows)) {
      return;
    }

    setPinnedAppIds(
      rows
        .map((pinnedApp: { appId?: unknown }) => pinnedApp.appId)
        .filter((appId: unknown): appId is string => typeof appId === "string"),
    );
  };

  const handlePinApp = async (appId: string) => {
    if (!pinnedAppIds.includes(appId)) {
      setPinnedAppIds((prev) => [...prev, appId]);
    }

    try {
      const res = await fetch(`${runtime.VITE_BACKEND_ADDRESS}/apps/pinned`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ appId }),
      });
      applyPinnedRows(await res.json());
    } catch (err) {
      console.error("Failed to pin app:", err);
    }
  };

  const handleUnpinApp = async (appId: string) => {
    setPinnedAppIds((prev) => prev.filter((id) => id !== appId));

    try {
      const res = await fetch(
        `${runtime.VITE_BACKEND_ADDRESS}/apps/pinned/${encodeURIComponent(appId)}`,
        {
          method: "DELETE",
          credentials: "include",
        },
      );
      applyPinnedRows(await res.json());
    } catch (err) {
      console.error("Failed to unpin app:", err);
    }
  };

  const handleReorderPinnedApps = async (appIds: string[]) => {
    setPinnedAppIds(appIds);

    try {
      const res = await fetch(
        `${runtime.VITE_BACKEND_ADDRESS}/apps/pinned/reorder`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ appIds }),
        },
      );
      applyPinnedRows(await res.json());
    } catch (err) {
      console.error("Failed to reorder pinned apps:", err);
    }
  };

  const handleCloseApp = (appId: string) => {
    handleDismissContinuity(appId);
    setWindows((prev) =>
      prev.filter((windowConfig) => windowConfig.id !== appId),
    );
    setMinimizedWindowIds((prev) => prev.filter((id) => id !== appId));
    setWindowZIndexes((prev) => {
      const next = { ...prev };
      delete next[appId];
      return next;
    });

    if (activeWindowId === appId) {
      handleWindowActivate("");
    }
  };

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
        `${runtime.VITE_BACKEND_ADDRESS}/data/temp`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ path }),
          credentials: "include",
        },
      );
      const { url } = await response.json();
      const tempUrl = `${runtime.VITE_BACKEND_ADDRESS}${url}`;

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

  const dismissContinuityForApp = async (appId: string) => {
    try {
      const continuitySocketId = (
        window as typeof window & {
          __continuitySocketId?: string;
        }
      ).__continuitySocketId;

      await fetch(`${runtime.VITE_BACKEND_ADDRESS}/continuity/dismiss`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(continuitySocketId
            ? { "x-continuity-socket-id": continuitySocketId }
            : {}),
        },
        credentials: "include",
        body: JSON.stringify({ appId }),
      });
    } catch (err) {
      console.error("Failed to dismiss continuity state", err);
    }
  };

  const startContinuityForApp = async (
    appId: string,
    data: Record<string, unknown>,
  ) => {
    try {
      const continuitySocketId = (
        window as typeof window & {
          __continuitySocketId?: string;
        }
      ).__continuitySocketId;

      await fetch(`${runtime.VITE_BACKEND_ADDRESS}/continuity/start`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(continuitySocketId
            ? { "x-continuity-socket-id": continuitySocketId }
            : {}),
        },
        credentials: "include",
        body: JSON.stringify({ appId, data }),
      });
    } catch (err) {
      console.error("Failed to publish continuity state", err);
    }
  };

  const handleStartContinuity = (
    appId: string,
    data: Record<string, unknown>,
  ) => {
    setContinuityByApp((prev) => ({
      ...prev,
      [appId]: data,
    }));
  };

  const handleDismissContinuity = (appId: string) => {
    setContinuityByApp((prev) => {
      if (!(appId in prev)) {
        return prev;
      }

      const next = { ...prev };
      delete next[appId];
      return next;
    });
  };

  useEffect(() => {
    const openWindowIds = new Set(
      windows.map((windowConfig) => windowConfig.id),
    );
    setContinuityByApp((prev) => {
      let changed = false;
      const next: ContinuityByApp = {};

      for (const [appId, data] of Object.entries(prev)) {
        if (openWindowIds.has(appId)) {
          next[appId] = data;
        } else {
          changed = true;
        }
      }

      return changed ? next : prev;
    });
  }, [windows]);

  useEffect(() => {
    const handleContinuityConsumed = (event: Event) => {
      const customEvent = event as CustomEvent<{ appId?: unknown }>;
      const appId =
        typeof customEvent.detail?.appId === "string"
          ? customEvent.detail.appId
          : null;

      if (!appId) {
        return;
      }

      const isWindowOpen = windows.some(
        (windowConfig) => windowConfig.id === appId,
      );
      if (!isWindowOpen) {
        return;
      }

      if (mobileMode) {
        setActivitiesOpen(false);
        setStartMenuOpen(true);
        setActiveWindowId("");
        return;
      }

      window.dispatchEvent(
        new CustomEvent("htmlos:force-minimize-window", {
          detail: { appId },
        }),
      );
    };

    window.addEventListener(
      "htmlos:continuity-consumed",
      handleContinuityConsumed as EventListener,
    );

    return () => {
      window.removeEventListener(
        "htmlos:continuity-consumed",
        handleContinuityConsumed as EventListener,
      );
    };
  }, [mobileMode, windows]);

  useEffect(() => {
    const continuityAppIds = Object.keys(continuityByApp);

    const isEligibleWindow = (id: string) => {
      return (
        windows.some((windowConfig) => windowConfig.id === id) &&
        !minimizedWindowIds.includes(id) &&
        continuityByApp[id] !== undefined
      );
    };

    let selectedAppId: string | null = null;

    if (activeWindowId && isEligibleWindow(activeWindowId)) {
      selectedAppId = activeWindowId;
    } else if (continuityAppIds.length > 0) {
      let topZIndex = -1;
      for (const appId of continuityAppIds) {
        if (!isEligibleWindow(appId)) {
          continue;
        }

        const zIndex = windowZIndexes[appId] ?? 0;
        if (zIndex > topZIndex) {
          topZIndex = zIndex;
          selectedAppId = appId;
        }
      }
    }

    const previousAppId = lastPublishedAppIdRef.current;

    if (!selectedAppId) {
      if (previousAppId) {
        dismissContinuityForApp(previousAppId);
        lastPublishedAppIdRef.current = null;
        lastPublishedDataKeyRef.current = "";
      }
      return;
    }

    const selectedData = continuityByApp[selectedAppId];
    if (!selectedData) {
      return;
    }

    const dataKey = JSON.stringify(selectedData);

    if (previousAppId && previousAppId !== selectedAppId) {
      dismissContinuityForApp(previousAppId);
    }

    if (
      previousAppId !== selectedAppId ||
      lastPublishedDataKeyRef.current !== dataKey
    ) {
      startContinuityForApp(selectedAppId, selectedData);
      lastPublishedAppIdRef.current = selectedAppId;
      lastPublishedDataKeyRef.current = dataKey;
    }
  }, [
    activeWindowId,
    continuityByApp,
    minimizedWindowIds,
    windowZIndexes,
    windows,
  ]);

  const handleOpenContinuityLaunch = async () => {
    if (!continuityLaunch) {
      return;
    }

    const app = installedApps.find((installedApp) => {
      return installedApp.id === continuityLaunch.appId;
    });

    if (!app || !app.url) {
      console.error("Continuity target app not found", continuityLaunch.appId);
      onConsumeContinuity();
      return;
    }

    const continuityData = encodeURIComponent(
      JSON.stringify(continuityLaunch.data),
    );
    const continuityNonce = Date.now();
    const continuityUrl = `${app.url}${app.url.includes("?") ? "&" : "?"}continuityData=${continuityData}&continuityNonce=${continuityNonce}`;

    setWindows((prevWindows) => {
      const existingIndex = prevWindows.findIndex(
        (windowConfig) => windowConfig.id === app.id,
      );

      if (existingIndex >= 0) {
        const updated = [...prevWindows];
        updated[existingIndex] = {
          ...updated[existingIndex],
          url: continuityUrl,
        };
        return updated;
      }

      return [...prevWindows, { ...app, url: continuityUrl }];
    });

    handleWindowActivate(app.id);

    try {
      const continuitySocketId = (
        window as typeof window & {
          __continuitySocketId?: string;
        }
      ).__continuitySocketId;

      await fetch(`${runtime.VITE_BACKEND_ADDRESS}/continuity/consume`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(continuitySocketId
            ? { "x-continuity-socket-id": continuitySocketId }
            : {}),
        },
        credentials: "include",
        body: JSON.stringify({ appId: app.id }),
      });
    } catch (err) {
      console.error("Failed to consume continuity state", err);
    }

    onConsumeContinuity();
  };

  const continuityLaunchIcon = continuityLaunch
    ? installedApps.find((app) => app.id === continuityLaunch.appId)?.icon
    : undefined;

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
      {installPopupOpen && pendingInstallApp && (
        <InstallPopup
          app={pendingInstallApp}
          mobileMode={mobileMode}
          onInstall={handleInstallRequest}
          onCancel={handleCancelInstall}
          isUpdate={isUpdateMode}
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
        onWindowClose={(id) => {
          handleDismissContinuity(id);
        }}
        onStartContinuity={handleStartContinuity}
        onDismissContinuity={(id) => {
          handleDismissContinuity(id);
          dismissContinuityForApp(id);
        }}
      ></Windows>
      <StartMenu
        apps={installedApps}
        menuOpen={startMenuOpen}
        setMenuOpen={(open) => setStartMenuOpen(open)}
        openApp={openAppById}
        mobileMode={mobileMode}
        username={username}
        pinnedAppIds={pinnedAppIds}
        onPinApp={handlePinApp}
        onUnpinApp={handleUnpinApp}
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
        hasContinuityLaunch={Boolean(continuityLaunch)}
        onOpenContinuityLaunch={handleOpenContinuityLaunch}
        continuityLaunchIcon={continuityLaunchIcon}
        installedApps={installedApps}
        pinnedAppIds={pinnedAppIds}
        onOpenApp={openAppById}
        onPinApp={handlePinApp}
        onUnpinApp={handleUnpinApp}
        onCloseApp={handleCloseApp}
        onReorderPinnedApps={handleReorderPinnedApps}
      ></Taskbar>
      <NotificationArea mobileMode={mobileMode} />
    </>
  );
}

export default Desktop;
