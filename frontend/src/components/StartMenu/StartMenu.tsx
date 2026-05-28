import styles from "./StartMenu.module.css";
import type { WindowConfig } from "../../types/window";
import type { MouseEvent, TouchEvent } from "react";
import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import ContextMenu from "../ContextMenu/ContextMenu";
import { runtime } from "../../runtimeConfig";

import DefaultIcon from "./assets/default.png";

import { Search, LogOut, Pin, PinOff } from "lucide-react";

interface TaskbarProps {
  apps: WindowConfig[];
  menuOpen: boolean;
  setMenuOpen: (open: boolean) => void;
  openApp: (appId: string) => void;
  mobileMode?: boolean;
  username?: string;
  pinnedAppIds?: string[];
  onPinApp?: (appId: string) => void;
  onUnpinApp?: (appId: string) => void;
}

interface StartMenuAppItemProps {
  app: WindowConfig;
  openApp: (appId: string) => void;
  onOpenContextMenu: (
    appId: string,
    e: MouseEvent<HTMLDivElement> | TouchEvent<HTMLDivElement>,
  ) => void;
}

function StartMenuAppItem({
  app,
  openApp,
  onOpenContextMenu,
}: StartMenuAppItemProps) {
  const touchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressTriggeredRef = useRef(false);

  const clearTouchTimer = () => {
    if (touchTimerRef.current) {
      clearTimeout(touchTimerRef.current);
      touchTimerRef.current = null;
    }
  };

  return (
    <div
      className={styles.appItem}
      onClick={() => {
        clearTouchTimer();
        if (longPressTriggeredRef.current) {
          longPressTriggeredRef.current = false;
          return;
        }
        openApp(app.id);
      }}
      onContextMenu={(e) => {
        e.preventDefault();
        onOpenContextMenu(app.id, e);
      }}
      onTouchStart={(e) => {
        longPressTriggeredRef.current = false;
        touchTimerRef.current = setTimeout(() => {
          longPressTriggeredRef.current = true;
          e.preventDefault();
          onOpenContextMenu(app.id, e);
        }, 500);
      }}
      onTouchEnd={clearTouchTimer}
      onTouchMove={clearTouchTimer}
    >
      <img
        src={app.icon ? app.icon : DefaultIcon}
        alt={`${app.title}'s app icon`}
        className={styles.appIcon}
        onError={(e) => {
          e.currentTarget.src = DefaultIcon;
          e.currentTarget.onerror = null;
        }}
      />
      <span className={styles.appTitle}>{app.title}</span>
    </div>
  );
}

function StartMenu({
  apps,
  menuOpen,
  setMenuOpen,
  openApp,
  mobileMode,
  username = "Username",
  pinnedAppIds = [],
  onPinApp,
  onUnpinApp,
}: TaskbarProps) {
  const [search, setSearch] = useState("");
  const [contextMenu, setContextMenu] = useState<{
    open: boolean;
    x: number;
    y: number;
    appId: string | null;
  }>({ open: false, x: 0, y: 0, appId: null });
  const searchInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const pinnedAppIdSet = new Set(pinnedAppIds);

  const { t } = useTranslation();

  useEffect(() => {
    if (!menuOpen) {
      setSearch("");
    }
  }, [menuOpen]);

  const filteredApps = apps.filter(
    (app) =>
      app.title && app.title.toLowerCase().includes(search.toLowerCase()),
  );

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

  const contextAppId = contextMenu.appId;
  const contextAppIsPinned = contextAppId
    ? pinnedAppIdSet.has(contextAppId)
    : false;

  const pinContextMenu = (
    <ContextMenu
      open={contextMenu.open}
      x={contextMenu.x}
      y={contextMenu.y}
      onClose={() => setContextMenu((prev) => ({ ...prev, open: false }))}
    >
      {contextAppId && (
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
          {contextAppIsPinned ? <PinOff size={16} /> : <Pin size={16} />}
          <span>
            {contextAppIsPinned ? "Unpin from taskbar" : "Pin to taskbar"}
          </span>
        </button>
      )}
    </ContextMenu>
  );

  // --- LOGOUT LOGIC ---
  const handleLogout = async () => {
    try {
      await fetch(runtime.VITE_BACKEND_ADDRESS + "/auth/logout", {
        method: "POST",
        credentials: "include", // CRITICAL for clearing the HTTP-only cookie
      });
      // Redirect cleanly to home
      window.location.href = "/";
    } catch (error) {
      console.error("Failed to log out:", error);
      window.location.href = "/"; // Fallback redirect if the network fails
    }
  };

  if (mobileMode) {
    return (
      <div
        ref={containerRef}
        className={`${styles.mobileStartMenuContainer} ${
          menuOpen ? styles.mobileStartMenuContainerShown : ""
        }`}
        tabIndex={-1}
        onClick={() => setMenuOpen(false)}
        onKeyDown={() => {}}
        autoFocus
      >
        <div
          className={styles.mobileStartMenu}
          onClick={(e) => e.stopPropagation()}
        >
          <div className={styles.startMenuTop}>
            <div className={styles.startMenuHeader}>
              <span className={styles.startMenuTitle}>All apps</span>
              <div className={styles.startMenuSearchContainer}>
                <Search className={styles.startMenuSearchIcon} size={22} />
                <input
                  className={styles.startMenuSearch}
                  type="text"
                  placeholder={t("start.search")}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  ref={searchInputRef}
                />
              </div>
            </div>
            <div className={styles.appsContainer}>
              <div className={styles.apps}>
                {filteredApps.map((app) => (
                  <StartMenuAppItem
                    key={app.id}
                    app={app}
                    openApp={openApp}
                    onOpenContextMenu={handleAppContextMenu}
                  />
                ))}
              </div>
            </div>
          </div>
          <div className={styles.startMenuFooter}>
            <p>{username}</p>
            <button className={styles.logoutButton} onClick={handleLogout}>
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
        {pinContextMenu}
      </div>
    );
  } else {
    return (
      <div
        ref={containerRef}
        className={`${styles.startMenuContainer} ${
          menuOpen ? styles.startMenuContainerShown : ""
        }`}
        tabIndex={-1}
        onClick={() => setMenuOpen(false)}
        onKeyDown={() => {}}
        autoFocus
      >
        <div className={styles.startMenu} onClick={(e) => e.stopPropagation()}>
          <div className={styles.startMenuTop}>
            <div className={styles.startMenuHeader}>
              <span className={styles.startMenuTitle}>{t("start.title")}</span>
              <div className={styles.startMenuSearchContainer}>
                <Search className={styles.startMenuSearchIcon} size={22} />
                <input
                  className={styles.startMenuSearch}
                  type="text"
                  placeholder={t("start.search")}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  ref={searchInputRef}
                />
              </div>
            </div>
            <div className={styles.appsContainer}>
              <div className={styles.apps}>
                {filteredApps.map((app) => (
                  <StartMenuAppItem
                    key={app.id}
                    app={app}
                    openApp={openApp}
                    onOpenContextMenu={handleAppContextMenu}
                  />
                ))}
              </div>
            </div>
          </div>
          <div className={styles.startMenuFooter}>
            <p>{username}</p>
            <button className={styles.logoutButton} onClick={handleLogout}>
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
        {pinContextMenu}
      </div>
    );
  }
}

export default StartMenu;
