import { useLayoutEffect, useState } from "react";
import { useEffect } from "react";
import Desktop from "./components/Desktop/Desktop";
import Authentication from "./components/Authentication/Authentication";
import BootLoading from "./components/BootLoading/BootLoading";
import { SettingsProvider, useSettings } from "./contexts/SettingsContext";

function AppContent({
  systemColorScheme,
  mobileMode,
  username,
}: {
  systemColorScheme: "light" | "dark";
  mobileMode: boolean;
  username: string;
}) {
  const { colorScheme } = useSettings();

  useEffect(() => {
    document.documentElement.setAttribute(
      "data-theme",
      colorScheme === "system" ? systemColorScheme : colorScheme,
    );
  }, [systemColorScheme, colorScheme]);

  return (
    <Desktop
      systemColorScheme={systemColorScheme}
      mobileMode={mobileMode}
      colorScheme={colorScheme}
      username={username}
    />
  );
}

function App() {
  const [mobileMode, setMobileMode] = useState(false);
  const [username, setUsername] = useState("Username");
  const [systemColorScheme, setSystemColorScheme] = useState<"light" | "dark">(
    window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light",
  );

  useLayoutEffect(() => {
    // i18n is now driven by SettingsContext inside the app
  }, []);

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const listener = (e: MediaQueryListEvent) =>
      setSystemColorScheme(e.matches ? "dark" : "light");
    setSystemColorScheme(media.matches ? "dark" : "light");
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, []);

  // Detect mobile mode based on screen width
  useEffect(() => {
    const checkMobileMode = () => {
      setMobileMode(window.matchMedia("(max-width: 768px)").matches);
    };

    // Initial check
    checkMobileMode();

    // Add event listener for window resize
    window.addEventListener("resize", checkMobileMode);

    // Cleanup event listener on unmount
    return () => {
      window.removeEventListener("resize", checkMobileMode);
    };
  }, []);

  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    fetch(import.meta.env.VITE_BACKEND_ADDRESS + "/auth/check", {
      credentials: "include",
    })
      .then(async (res) => {
        if (res.ok) {
          const data = await res.json();
          if (data.user && data.user.username) {
            setUsername(data.user.username);
          }
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      })
      .catch(() => setIsAuthenticated(false));
  }, []);

  if (isAuthenticated) {
    return (
      <>
        <BootLoading />
        <SettingsProvider>
          <AppContent
            systemColorScheme={systemColorScheme}
            mobileMode={mobileMode}
            username={username}
          />
        </SettingsProvider>
      </>
    );
  } else {
    return (
      <>
        <BootLoading />
        <Authentication mobileMode={mobileMode} />
      </>
    );
  }
}

export default App;
