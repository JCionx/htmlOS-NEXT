import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import i18n from "../i18n";

interface SettingsContextType {
  language: string;
  setLanguage: (lang: string) => void;
  timezone: string;
  setTimezone: (tz: string) => void;
  taskbarFloating: boolean;
  setTaskbarFloating: (floating: boolean) => void;
  taskbarEdges: boolean;
  setTaskbarEdges: (edges: boolean) => void;
  colorScheme: string;
  setColorScheme: (scheme: string) => void;
  twentyFourHourClock: boolean;
  setTwentyFourHourClock: (twentyFour: boolean) => void;
  showSeconds: boolean;
  setShowSeconds: (show: boolean) => void;
  showDeveloperOptions: boolean;
  setShowDeveloperOptions: (show: boolean) => void;
  showReloadButton: boolean;
  setShowReloadButton: (show: boolean) => void;
  showInspectButton: boolean;
  setShowInspectButton: (show: boolean) => void;
  wallpaper: string;
  setWallpaper: (wallpaper: string) => void;
  isLoading: boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined,
);

async function fetchSettings() {
  const response = await fetch(
    `${import.meta.env.VITE_BACKEND_ADDRESS}/settings`,
    {
      credentials: "include",
    },
  );
  return response.json();
}

async function updateSetting(setting: string, value: string) {
  await fetch(`${import.meta.env.VITE_BACKEND_ADDRESS}/settings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ setting, value }),
    credentials: "include",
  });
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState("en");
  const [timezone, setTimezoneState] = useState("system");
  const [taskbarFloating, setTaskbarFloatingState] = useState(true);
  const [taskbarEdges, setTaskbarEdgesState] = useState(true);
  const [colorScheme, setColorSchemeState] = useState("system");
  const [twentyFourHourClock, setTwentyFourHourClockState] = useState(false);
  const [showSeconds, setShowSecondsState] = useState(false);
  const [showDeveloperOptions, setShowDeveloperOptionsState] = useState(false);
  const [showReloadButton, setShowReloadButtonState] = useState(false);
  const [showInspectButton, setShowInspectButtonState] = useState(false);
  const [wallpaper, setWallpaperState] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Load settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settings = await fetchSettings();

        if (settings.language) {
          setLanguageState(settings.language);
          i18n.changeLanguage(settings.language);
        }
        if (settings.timezone) setTimezoneState(settings.timezone);
        if (settings.taskbarStyle) {
          setTaskbarFloatingState(settings.taskbarStyle === "floating");
        }
        if (settings.taskbarAlignment) {
          setTaskbarEdgesState(settings.taskbarAlignment === "edges");
        }
        if (settings.colorScheme) {
          setColorSchemeState(settings.colorScheme);
        }
        if (settings.twentyFourHourClock !== undefined) {
          setTwentyFourHourClockState(settings.twentyFourHourClock === "true");
        }
        if (settings.showSeconds !== undefined) {
          setShowSecondsState(settings.showSeconds === "true");
        }
        if (settings.showDeveloperOptions !== undefined) {
          setShowDeveloperOptionsState(
            settings.showDeveloperOptions === "true",
          );
        }
        if (settings.showReloadButton !== undefined) {
          setShowReloadButtonState(settings.showReloadButton === "true");
        }
        if (settings.showInspectButton !== undefined) {
          setShowInspectButtonState(settings.showInspectButton === "true");
        }
        if (settings.wallpaper) {
          setWallpaperState(settings.wallpaper);
        }
      } catch (err) {
        console.error("Failed to load settings:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, []);

  const setLanguage = (lang: string) => {
    setLanguageState(lang);
    i18n.changeLanguage(lang);
    updateSetting("language", lang).catch((err) =>
      console.error("Failed to save language setting:", err),
    );
  };

  const setTimezone = (tz: string) => {
    setTimezoneState(tz);
    updateSetting("timezone", tz).catch((err) =>
      console.error("Failed to save timezone setting:", err),
    );
  };

  const setTaskbarFloating = (floating: boolean) => {
    setTaskbarFloatingState(floating);
    updateSetting("taskbarStyle", floating ? "floating" : "expanded").catch(
      (err) => console.error("Failed to save taskbar style setting:", err),
    );
  };

  const setTaskbarEdges = (edges: boolean) => {
    setTaskbarEdgesState(edges);
    updateSetting("taskbarAlignment", edges ? "edges" : "center").catch((err) =>
      console.error("Failed to save taskbar alignment setting:", err),
    );
  };

  const setColorScheme = (scheme: string) => {
    setColorSchemeState(scheme);
    updateSetting("colorScheme", scheme).catch((err) =>
      console.error("Failed to save color scheme setting:", err),
    );
  };

  const setTwentyFourHourClock = (twentyFour: boolean) => {
    setTwentyFourHourClockState(twentyFour);
    updateSetting("twentyFourHourClock", twentyFour ? "true" : "false").catch(
      (err) => console.error("Failed to save 24-hour clock setting:", err),
    );
  };

  const setShowSeconds = (show: boolean) => {
    setShowSecondsState(show);
    updateSetting("showSeconds", show ? "true" : "false").catch((err) =>
      console.error("Failed to save show seconds setting:", err),
    );
  };

  const setShowDeveloperOptions = (show: boolean) => {
    setShowDeveloperOptionsState(show);
    updateSetting("showDeveloperOptions", show ? "true" : "false").catch(
      (err) => console.error("Failed to save developer options setting:", err),
    );
  };

  const setShowReloadButton = (show: boolean) => {
    setShowReloadButtonState(show);
    updateSetting("showReloadButton", show ? "true" : "false").catch((err) =>
      console.error("Failed to save reload button setting:", err),
    );
  };

  const setShowInspectButton = (show: boolean) => {
    setShowInspectButtonState(show);
    updateSetting("showInspectButton", show ? "true" : "false").catch((err) =>
      console.error("Failed to save inspect button setting:", err),
    );
  };

  const setWallpaper = (wallpaper: string) => {
    setWallpaperState(wallpaper);
    updateSetting("wallpaper", wallpaper).catch((err) =>
      console.error("Failed to save wallpaper setting:", err),
    );
  };

  return (
    <SettingsContext.Provider
      value={{
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
        isLoading,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within SettingsProvider");
  }
  return context;
}
