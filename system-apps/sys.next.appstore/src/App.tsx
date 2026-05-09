import { useState, useEffect, useLayoutEffect } from "react";
import "./App.css";
import { ChevronLeft, LayoutGrid } from "lucide-react";

import * as api from "@htmlos-next/api";

import {
  AppShell,
  Sidebar,
  SidebarTitle,
  SidebarItem,
  Toolbar,
  ToolbarTitle,
  ToolbarExpandSidebarButton,
  Content,
  EmptyView,
  ToolbarActions,
  ToolbarButton,
  ListItem,
  Popup,
  PopupTitle,
  PopupDescription,
  PopupActions,
  PopupButton,
} from "@htmlos-next/ui";
import AppDetail from "./components/AppDetail";

import i18n from "./i18n";
import { useTranslation } from "react-i18next";

export interface AppData {
  author: string;
  description: string;
  storeIcon: string;
  screenshots: string[];
  app: {
    id: string;
    name: string;
    version: string;
    packageUrl: string;
    entryPoint: string;
    iconPath: string;
    locale?: Record<string, string>;
    filetypes?: string[];
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
    permissions?: string[];
    pluginUrl?: string;
  };
}

interface Category {
  name: string | { [key: string]: string };
  apps: AppData[];
}

interface StoreData {
  featuredApps: AppData[];
  categories: Category[];
}

function App() {
  const [storeData, setStoreData] = useState<StoreData | null>(null);
  const [view, setView] = useState<"home" | "category" | "app">("home");
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null,
  );
  const [selectedApp, setSelectedApp] = useState<AppData | null>(null);
  const [isInstalling, setIsInstalling] = useState(false);
  const [installedApps, setInstalledApps] = useState<string[]>([]);

  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [pluginWarningPopupOpen, setPluginWarningPopupOpen] = useState(false);

  const { t } = useTranslation();

  const closePopups = () => {
    setPluginWarningPopupOpen(false);
  };

  useLayoutEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const theme = urlParams.get("theme") === "dark" ? "dark" : "light";
    const deviceType =
      urlParams.get("mobile") === "true" ? "mobile" : "desktop";
    const language = urlParams.get("lang") || "en";
    i18n.changeLanguage(language);
    document.documentElement.setAttribute("data-theme", theme);
    document.documentElement.setAttribute("device-type", deviceType);
    setIsMobile(deviceType === "mobile");
  }, []);

  useEffect(() => {
    const backendAddress = window.location.origin.replace(":5173", ":3005");
    fetch(`${backendAddress}/apps/list`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((apps) => {
        const appIds = apps.map((app: any) => app.id);
        setInstalledApps(appIds);
      })
      .catch((err) => console.error("Failed to fetch installed apps:", err));

    fetch(`https://jcionx.github.io/htmlOS-NEXT/apps.json?t=${Date.now()}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        console.log("Store data loaded:", data);
        setStoreData(data);
      })
      .catch((err) => {
        console.error("Failed to fetch apps:", err);
        setStoreData({ featuredApps: [], categories: [] });
      });
  }, []);

  const selectCategory = (category: Category) => {
    setSelectedCategory(category);
    setView("category");
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  // --- REFACTORED INSTALL FUNCTION ---
  const handleInstallApp = async (app: AppData) => {
    setIsInstalling(true);
    try {
      // 1. Trigger the install through the API
      await api.installApp(app.app, app.app.packageUrl);

      if (app.app.pluginUrl) {
        setPluginWarningPopupOpen(true);
      }

      // 2. If it succeeds, update state
      setInstalledApps((prev) => [...prev, app.app.id]);

      // 3. Request parent to refresh app list
      api.refreshAppList();
    } catch (error) {
      console.error("Failed to install app:", error);
    } finally {
      setIsInstalling(false);
    }
  };

  const goBack = () => {
    if (view === "app") {
      if (selectedCategory) {
        setView("category");
      } else {
        setView("home");
      }
      setSelectedApp(null);
    }
  };

  const goHome = () => {
    setView("home");
    setSelectedCategory(null);
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  const getToolbarTitle = () => {
    if (view === "app" && selectedApp) return selectedApp.app.name;
    if (view === "category" && selectedCategory) {
      return getCategoryName(selectedCategory, i18n.language);
    }
    return "Featured";
  };

  const getCategoryName = (category: Category, language: string): string => {
    if (typeof category.name === "string") {
      return category.name;
    }
    return category.name[language] || category.name["en"] || "Unknown";
  };

  return (
    <AppShell
      isMobile={isMobile}
      sidebarOpen={sidebarOpen}
      accentColor="#869AFF"
      sidebar={
        <Sidebar open={sidebarOpen}>
          <SidebarTitle>{t("sidebar.title")}</SidebarTitle>
          <SidebarItem onClick={() => goHome()} selected={view === "home"}>
            {t("sidebar.featured")}
          </SidebarItem>
          {storeData &&
            storeData.categories.map((category) => (
              <SidebarItem
                key={
                  typeof category.name === "string"
                    ? category.name
                    : category.name["en"]
                }
                onClick={() => selectCategory(category)}
                selected={view === "category" && selectedCategory === category}
              >
                {getCategoryName(category, i18n.language)}
              </SidebarItem>
            ))}
        </Sidebar>
      }
    >
      <Toolbar expanded={!sidebarOpen}>
        <ToolbarActions>
          <ToolbarExpandSidebarButton
            onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
            expanded={!sidebarOpen}
          />
          {view === "app" && (
            <ToolbarButton onClick={goBack}>
              <ChevronLeft />
            </ToolbarButton>
          )}
        </ToolbarActions>
        <ToolbarTitle>{getToolbarTitle()}</ToolbarTitle>
        <div></div>
      </Toolbar>
      <Content expanded={!sidebarOpen}>
        {storeData ? (
          <>
            {view === "home" && storeData.featuredApps.length != 0 && (
              <>
                {storeData.featuredApps.map((app) => (
                  <ListItem
                    key={app.app.id}
                    onClick={() => {
                      setSelectedApp(app);
                      setView("app");
                    }}
                  >
                    <img
                      src={app.storeIcon}
                      alt={app.app.name}
                      className="app-icon"
                    />
                    {app.app.name}
                  </ListItem>
                ))}
              </>
            )}

            {view === "home" && storeData.featuredApps.length == 0 && (
              <EmptyView icon={LayoutGrid} label="No apps" />
            )}

            {view === "category" &&
              selectedCategory &&
              selectedCategory.apps.length != 0 && (
                <>
                  {selectedCategory.apps.map((app) => (
                    <ListItem
                      key={app.app.id}
                      onClick={() => {
                        setSelectedApp(app);
                        setView("app");
                      }}
                    >
                      <img
                        src={app.storeIcon}
                        alt={app.app.name}
                        className="app-icon"
                      />
                      {app.app.name}
                    </ListItem>
                  ))}
                </>
              )}

            {view === "category" &&
              selectedCategory &&
              selectedCategory.apps.length == 0 && (
                <EmptyView icon={LayoutGrid} label={t("noApps")} />
              )}

            {view === "app" && selectedApp && (
              <AppDetail
                selectedApp={selectedApp}
                isInstalling={isInstalling}
                installedApps={installedApps}
                handleInstallApp={handleInstallApp}
              ></AppDetail>
            )}
          </>
        ) : (
          <EmptyView icon={LayoutGrid} label={t("loading")} />
        )}
      </Content>
      <Popup open={pluginWarningPopupOpen}>
        <PopupTitle>{t("pluginPopup.title")}</PopupTitle>
        <PopupDescription>{t("pluginPopup.step1")}</PopupDescription>
        <pre className="code-block">{`node cli.js plugin enable ${selectedApp?.app.id}`}</pre>
        <PopupDescription>{t("pluginPopup.step2")}</PopupDescription>
        <PopupActions orientation="horizontal">
          <PopupButton
            onClick={() => {
              closePopups();
            }}
          >
            {t("pluginPopup.submit")}
          </PopupButton>
        </PopupActions>
      </Popup>
    </AppShell>
  );
}

export default App;
