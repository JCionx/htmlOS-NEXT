import { useState, useLayoutEffect } from "react";
import "./App.css";
import { Cog, User, Palette, LayoutGrid, FileCog, Hammer } from "lucide-react";
import SystemView from "./pages/SystemView";
import AppearenceView from "./pages/AppearenceView";
import InstalledAppsView from "./pages/InstalledAppsView";
import DefaultAppsView from "./pages/DefaultAppsView";
import UserView from "./pages/UserView";
import DeveloperOptionsView from "./pages/DeveloperOptionsView";

import * as api from "@htmlos-next/api";

import {
  AppShell,
  Sidebar,
  SidebarTitle,
  SidebarItem,
  Content,
  Toolbar,
  ToolbarTitle,
  ToolbarExpandSidebarButton,
  Icon,
  EmptyView,
} from "@htmlos-next/ui";

import i18n from "./i18n";
import { useTranslation } from "react-i18next";

function App() {
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

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

  const { t } = useTranslation();

  const [selectedTab, setSelectedTab] = useState("System");

  async function selectTab(tab: string) {
    setSelectedTab(tab);
    if (isMobile) {
      setSidebarOpen(false);
    }
  }

  const changeSetting = async (setting: string, value: string | boolean) => {
    try {
      const valueToString = String(value);
      // Clean API call here!
      api.changeSetting(setting, valueToString);

      setSettings((prevSettings: any) => ({
        ...prevSettings,
        [setting]: value,
      }));

      console.log(`${setting} changed to: ${value}`);
    } catch (error) {
      console.error("Failed to change setting:", error);
    }
  };

  const [settings, setSettings] = useState<any>(null);
  const [showDeveloperOptionsTab, setShowDeveloperOptionsTab] = useState(false);

  useLayoutEffect(() => {
    const fetchSettings = async () => {
      try {
        // Clean API call here!
        const data = await api.getSettings();
        console.log("[Settings App] Loaded settings:", data);
        console.log("[Settings App] Wallpaper setting:", data.wallpaper);
        setSettings(data);
        setShowDeveloperOptionsTab(data.showDeveloperOptions === "true");
      } catch (error) {
        console.error("Failed to load settings:", error);
      }
    };

    fetchSettings();
  }, []);

  return (
    <AppShell
      isMobile={isMobile}
      sidebarOpen={sidebarOpen}
      accentColor="#A0A0A4"
      sidebar={
        <Sidebar open={sidebarOpen}>
          <SidebarTitle>Settings</SidebarTitle>
          <SidebarItem
            onClick={() => selectTab("System")}
            selected={selectedTab === "System"}
          >
            <Icon icon={Cog} />
            {t("sidebar.system")}
          </SidebarItem>
          <SidebarItem
            onClick={() => selectTab("User")}
            selected={selectedTab === "User"}
          >
            <Icon icon={User} />
            {t("sidebar.user")}
          </SidebarItem>
          <SidebarItem
            onClick={() => selectTab("Appearence")}
            selected={selectedTab === "Appearence"}
          >
            <Icon icon={Palette} />
            {t("sidebar.appearence")}
          </SidebarItem>
          <SidebarItem
            onClick={() => selectTab("Installed Apps")}
            selected={selectedTab === "Installed Apps"}
          >
            <Icon icon={LayoutGrid} />
            {t("sidebar.installedapps")}
          </SidebarItem>
          <SidebarItem
            onClick={() => selectTab("Default Apps")}
            selected={selectedTab === "Default Apps"}
          >
            <Icon icon={FileCog} />
            {t("sidebar.defaultapps")}
          </SidebarItem>
          {showDeveloperOptionsTab && (
            <SidebarItem
              onClick={() => selectTab("Developer Options")}
              selected={selectedTab === "Developer Options"}
            >
              <Icon icon={Hammer} />
              {t("sidebar.developeroptions")}
            </SidebarItem>
          )}
        </Sidebar>
      }
    >
      <Toolbar expanded={!sidebarOpen}>
        <ToolbarExpandSidebarButton
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          expanded={!sidebarOpen}
        />
        <ToolbarTitle>
          {t(`sidebar.${selectedTab.toLowerCase().replace(" ", "")}`)}
        </ToolbarTitle>
        <div></div>
      </Toolbar>
      <Content expanded={!sidebarOpen}>
        {settings ? (
          selectedTab === "System" ? (
            <SystemView
              settings={settings}
              changeSetting={changeSetting}
              setShowDeveloperOptionsTab={setShowDeveloperOptionsTab}
            />
          ) : selectedTab === "User" ? (
            <UserView />
          ) : selectedTab === "Appearence" ? (
            <AppearenceView settings={settings} changeSetting={changeSetting} />
          ) : selectedTab === "Installed Apps" ? (
            <InstalledAppsView />
          ) : selectedTab === "Default Apps" ? (
            <DefaultAppsView />
          ) : selectedTab === "Developer Options" ? (
            <DeveloperOptionsView
              settings={settings}
              changeSetting={changeSetting}
            />
          ) : null
        ) : (
          <EmptyView icon={Cog} label={t("loadingsettings")} />
        )}
      </Content>
    </AppShell>
  );
}

export default App;
