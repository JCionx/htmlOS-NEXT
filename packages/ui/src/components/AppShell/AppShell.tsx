import { useLayoutEffect } from "react";
import { DeviceContext } from "../DeviceContext/DeviceContext";

interface AppShellProps {
  isMobile: boolean;
  sidebarOpen: boolean;
  sidebar: React.ReactNode;
  children: React.ReactNode;
  accentColor?: string;
}

export function AppShell({
  isMobile,
  sidebar,
  children,
  accentColor = "#0088ff",
}: AppShellProps) {
  useLayoutEffect(() => {
    if (accentColor) {
      const root = document.documentElement;
      root.style.setProperty("--accent", accentColor);
    }
  }, [accentColor]);

  return (
    <DeviceContext.Provider value={{ isMobile }}>
      <div>
        <aside>{sidebar}</aside>
        <main>{children}</main>
      </div>
    </DeviceContext.Provider>
  );
}
