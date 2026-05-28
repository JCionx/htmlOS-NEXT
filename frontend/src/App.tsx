import { useLayoutEffect, useState } from "react";
import { useEffect } from "react";
import { runtime } from "./runtimeConfig";
import { io, type Socket } from "socket.io-client";
import Desktop from "./components/Desktop/Desktop";
import Authentication from "./components/Authentication/Authentication";
import BootLoading from "./components/BootLoading/BootLoading";
import { SettingsProvider, useSettings } from "./contexts/SettingsContext";

interface ContinuityLaunch {
  appId: string;
  data: Record<string, unknown>;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function AppContent({
  systemColorScheme,
  mobileMode,
  username,
  continuityLaunch,
  onConsumeContinuity,
}: {
  systemColorScheme: "light" | "dark";
  mobileMode: boolean;
  username: string;
  continuityLaunch: ContinuityLaunch | null;
  onConsumeContinuity: () => void;
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
      continuityLaunch={continuityLaunch}
      onConsumeContinuity={onConsumeContinuity}
    />
  );
}

function App() {
  const [mobileMode] = useState(
    () => window.matchMedia("(max-width: 768px)").matches,
  );
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

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [continuityLaunch, setContinuityLaunch] =
    useState<ContinuityLaunch | null>(null);

  useEffect(() => {
    fetch(runtime.VITE_BACKEND_ADDRESS + "/auth/check", {
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

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    const socket: Socket = io(runtime.VITE_BACKEND_ADDRESS, {
      withCredentials: true,
      transports: ["websocket", "polling"],
    });

    socket.on("connect", () => {
      (
        window as typeof window & {
          __continuitySocketId?: string;
        }
      ).__continuitySocketId = socket.id;
    });

    socket.on("continuity:sync", (payload: { items?: unknown[] }) => {
      if (!Array.isArray(payload?.items)) {
        return;
      }

      let newest: ContinuityLaunch | null = null;
      let newestUpdatedAt = -1;

      for (const item of payload.items) {
        const typedItem = item as {
          appId?: unknown;
          data?: unknown;
          updatedAt?: unknown;
        };

        console.log("[CONTINUITY][SYNC]", {
          appId: typedItem?.appId,
          data: typedItem?.data,
        });

        if (
          typeof typedItem.appId === "string" &&
          isRecord(typedItem.data) &&
          typeof typedItem.updatedAt === "number"
        ) {
          if (typedItem.updatedAt > newestUpdatedAt) {
            newestUpdatedAt = typedItem.updatedAt;
            newest = {
              appId: typedItem.appId,
              data: typedItem.data,
            };
          }
        }
      }

      if (newest) {
        setContinuityLaunch({ appId: newest.appId, data: newest.data });
      }
    });

    socket.on(
      "continuity:update",
      (payload: { appId?: unknown; data?: unknown }) => {
        if (typeof payload?.appId !== "string" || !isRecord(payload?.data)) {
          return;
        }

        console.log("[CONTINUITY][UPDATE]", {
          appId: payload.appId,
          data: payload.data,
        });

        setContinuityLaunch({
          appId: payload.appId,
          data: payload.data,
        });
      },
    );

    socket.on("continuity:consumed", (payload: { appId?: unknown }) => {
      if (typeof payload?.appId !== "string") {
        return;
      }

      window.dispatchEvent(
        new CustomEvent("htmlos:continuity-consumed", {
          detail: { appId: payload.appId },
        }),
      );
    });

    socket.on("continuity:dismiss", (payload: { appId?: unknown }) => {
      if (typeof payload?.appId !== "string") {
        return;
      }

      setContinuityLaunch((prev) => {
        if (prev && prev.appId === payload.appId) {
          return null;
        }
        return prev;
      });
    });

    socket.on("disconnect", () => {
      const win = window as typeof window & {
        __continuitySocketId?: string;
      };
      if (win.__continuitySocketId === socket.id) {
        delete win.__continuitySocketId;
      }
    });

    return () => {
      const win = window as typeof window & {
        __continuitySocketId?: string;
      };
      if (win.__continuitySocketId === socket.id) {
        delete win.__continuitySocketId;
      }
      socket.disconnect();
    };
  }, [isAuthenticated]);

  if (isAuthenticated) {
    return (
      <>
        <BootLoading />
        <SettingsProvider>
          <AppContent
            systemColorScheme={systemColorScheme}
            mobileMode={mobileMode}
            username={username}
            continuityLaunch={continuityLaunch}
            onConsumeContinuity={() => setContinuityLaunch(null)}
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
