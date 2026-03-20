import styles from "./StartMenu.module.css";
import type { WindowConfig } from "../../types/window";
import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";

import DefaultIcon from "./assets/default.png";

interface TaskbarProps {
  apps: WindowConfig[];
  menuOpen: boolean;
  setMenuOpen: (open: boolean) => void;
  openApp: (appId: string) => void;
  mobileMode?: boolean;
}

function StartMenu({
  apps,
  menuOpen,
  setMenuOpen,
  openApp,
  mobileMode,
}: TaskbarProps) {
  const [search, setSearch] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

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

  // --- LOGOUT LOGIC ---
  const handleLogout = async () => {
    try {
      await fetch(import.meta.env.VITE_BACKEND_ADDRESS + "/auth/logout", {
        method: "POST",
        credentials: "include", // CRITICAL for clearing the HTTP-only cookie
      });
      // Redirect cleanly to login
      window.location.href = "/login";
    } catch (error) {
      console.error("Failed to log out:", error);
      window.location.href = "/login"; // Fallback redirect if the network fails
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
          <div className={styles.startMenuHeader}>
            <span className={styles.startMenuTitle}>All apps</span>
            <input
              className={styles.startMenuSearch}
              type="text"
              placeholder={t("start.search")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              ref={searchInputRef}
            />
            {/* Added onClick and text here */}
            <button className={styles.logoutButton} onClick={handleLogout}>
              Logout
            </button>
          </div>
          <div className={styles.appsContainer}>
            {filteredApps.map((app) => (
              <div
                key={app.id}
                className={styles.appItem}
                onClick={() => openApp(app.id)}
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
            ))}
          </div>
          <div className={styles.startMenuActions}></div>
        </div>
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
          <div className={styles.startMenuHeader}>
            <span className={styles.startMenuTitle}>{t("start.title")}</span>
            <input
              className={styles.startMenuSearch}
              type="text"
              placeholder={t("start.search")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              ref={searchInputRef}
            />
          </div>
          <div className={styles.appsContainer}>
            {filteredApps.map((app) => (
              <div
                key={app.id}
                className={styles.appItem}
                onClick={() => openApp(app.id)}
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
            ))}
          </div>
          <div className={styles.startMenuActions}>
            {/* Added the logout button to the desktop actions bar too */}
            <button className={styles.logoutButton} onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default StartMenu;
