import { useState, useLayoutEffect, useRef, useEffect } from "react";
import "./App.css";
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  Home,
  ArrowRight,
  RotateCw,
  Ellipsis,
  Star,
  StarOff,
  Clock,
} from "lucide-react";
import * as api from "@htmlos-next/api";
import {
  AppShell,
  Toolbar,
  ToolbarActions,
  Content,
  ToolbarButton,
  Icon,
  TextInput,
  Tab,
  TabBar,
  TabContainer,
  ContextMenu,
  SidebarItem,
} from "@htmlos-next/ui";
import i18n from "./i18n";
//import { useTranslation } from "react-i18next";
import Browser from "./components/Browser";
import type { BrowserHandle } from "./components/Browser";

export interface BrowserTab {
  title: string;
  url: string;
  canGoBack: boolean;
  canGoForward: boolean;
}

const homepage = "about:blank";

function App() {
  const [isMobile, setIsMobile] = useState(false);

  const [tabs, setTabs] = useState<BrowserTab[]>([
    {
      title: "New Tab",
      url: homepage,
      canGoBack: false,
      canGoForward: false,
    },
  ]);

  const [selectedTabIndex, setSelectedTabIndex] = useState(0);
  const [inputValue, setInputValue] = useState(homepage);

  const [moreContextMenuOpen, setMoreContextMenuOpen] = useState(false);

  // Store refs for each Browser component based on their index
  const tabRefs = useRef<Record<number, BrowserHandle | null>>({});

  const addressBarRef = useRef<HTMLInputElement>(null);

  const [favorites, setFavorites] = useState<{ title: string; url: string }[]>(
    [],
  );

  const [history, setHistory] = useState<{ title: string; url: string }[]>([]);

  const [siteStorage, setSiteStorage] = useState({
    local: {},
    session: {},
    cookies: "",
  });

  const handleAddTab = () => {
    const newTab: BrowserTab = {
      title: "New Tab",
      url: homepage,
      canGoBack: false,
      canGoForward: false,
    };
    setTabs([...tabs, newTab]);
    setSelectedTabIndex(tabs.length);
  };

  const handleOpenNewTab = (url: string) => {
    let cleanUrl = url;
    const proxyIndex = cleanUrl.indexOf("/proxy/");
    if (proxyIndex !== -1) {
      cleanUrl = cleanUrl.substring(proxyIndex + 7);
    }

    const newTab: BrowserTab = {
      title: "New Tab",
      url: cleanUrl,
      canGoBack: false,
      canGoForward: false,
    };
    setTabs((prev) => [...prev, newTab]);
    setSelectedTabIndex(tabs.length);
  };

  const handleCloseTab = (index: number) => {
    const newTabs = [...tabs];
    newTabs.splice(index, 1);

    if (newTabs.length === 0) {
      setTabs([
        {
          title: "New Tab",
          url: homepage,
          canGoBack: false,
          canGoForward: false,
        },
      ]);
      setSelectedTabIndex(0);
      return;
    }

    if (index < selectedTabIndex) {
      setSelectedTabIndex(selectedTabIndex - 1);
    } else if (index === selectedTabIndex) {
      if (index === newTabs.length) {
        setSelectedTabIndex(index - 1);
      }
    }

    setTabs(newTabs);

    if (tabRefs.current[index]) {
      delete tabRefs.current[index];
    }
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

    // Set a root cookie so the backend proxy node-unblocker can read the OS theme
    document.cookie = "htmlos_theme=" + theme + "; path=/;";
  }, []);

  // Update input text whenever the active tab URL changes
  useLayoutEffect(() => {
    if (tabs[selectedTabIndex]) {
      const activeUrl = tabs[selectedTabIndex].url;
      setInputValue(activeUrl.startsWith("about:") ? "" : activeUrl);

      if (activeUrl === "about:blank") {
        setTimeout(() => {
          addressBarRef.current?.focus();
        }, 0);
      }
    }
  }, [selectedTabIndex, tabs[selectedTabIndex]?.url]);

  useEffect(() => {
    const handleGlobalClick = () => {
      if (moreContextMenuOpen) {
        setMoreContextMenuOpen(false);
      }
    };

    window.addEventListener("click", handleGlobalClick);

    return () => window.removeEventListener("click", handleGlobalClick);
  }, [moreContextMenuOpen]);

  useEffect(() => {
    async function loadData() {
      // 1. Load favorites first
      const favoritesData = await api.loadInternalFileAsText("favorites.json");
      if (favoritesData) {
        try {
          const parsedFavorites = JSON.parse(favoritesData);
          setFavorites(parsedFavorites);
        } catch (e) {
          console.error("Failed to parse favorites.json:", e);
        }
      }

      // 2. Load history sequentially afterward to prevent temp token race conditions
      const historyData = await api.loadInternalFileAsText("history.json");
      if (historyData) {
        try {
          const parsedHistory = JSON.parse(historyData);
          setHistory(parsedHistory);
        } catch (e) {
          console.error("Failed to parse history.json:", e);
        }
      }

      // Load storage
      try {
        const [localStr, sessionStr, cookieStr] = await Promise.all([
          api.loadInternalFileAsText("localstorage.json").catch(() => null),
          api.loadInternalFileAsText("sessionstorage.json").catch(() => null),
          api.loadInternalFileAsText("cookies.json").catch(() => null),
        ]);

        setSiteStorage({
          local: localStr ? JSON.parse(localStr) : {},
          session: sessionStr ? JSON.parse(sessionStr) : {},
          cookies: cookieStr || "",
        });
      } catch (e) {}
    }
    loadData();
  }, []);

  async function saveFavorites(newFavorites: { title: string; url: string }[]) {
    setFavorites(newFavorites);
    await api.saveInternalFile("favorites.json", JSON.stringify(newFavorites));
  }

  async function addFavorite(title: string, url: string) {
    const newFavorites = [...favorites, { title, url }];
    await saveFavorites(newFavorites);
  }

  async function removeFavorite(url: string) {
    const newFavorites = favorites.filter((fav) => fav.url !== url);
    await saveFavorites(newFavorites);
  }

  async function saveHistory(newHistory: { title: string; url: string }[]) {
    setHistory(newHistory);
    api.saveInternalFile("history.json", JSON.stringify(newHistory));
  }

  async function addToHistory(title: string, url: string) {
    const newHistory = [{ title, url }, ...history];
    await saveHistory(newHistory);
  }

  async function clearHistory() {
    setHistory([]);
    await api.saveInternalFile("history.json", JSON.stringify([]));
  }

  const handleStorageUpdate = async (type: string, data: any) => {
    if (type === "localStorage") {
      await api.saveInternalFile("localstorage.json", JSON.stringify(data));
      setSiteStorage((prev) => ({ ...prev, local: data }));
    } else if (type === "sessionStorage") {
      await api.saveInternalFile("sessionstorage.json", JSON.stringify(data));
      setSiteStorage((prev) => ({ ...prev, session: data }));
    } else if (type === "cookies") {
      await api.saveInternalFile("cookies.json", data);
      setSiteStorage((prev) => ({ ...prev, cookies: data }));
    }
  };

  const handlePageLoad = (
    index: number,
    newTitle: string,
    newUrl: string,
    canGoBack: boolean,
    canGoForward: boolean,
  ) => {
    setTabs((prev) => {
      const newTabs = [...prev];
      newTabs[index] = {
        ...newTabs[index],
        title: newTitle || newTabs[index].title,
        url: newUrl || newTabs[index].url,
        canGoBack,
        canGoForward,
      };
      return newTabs;
    });
  };

  const handleNavigate = () => {
    let targetUrl = inputValue.trim();

    if (!targetUrl || targetUrl === "about:blank") {
      setTabs((prev) => {
        const newTabs = [...prev];
        newTabs[selectedTabIndex].url = "about:blank";
        return newTabs;
      });
      return;
    }

    // Check if the input resembles a URL format
    const isUrl =
      /^((https?:\/\/)?(([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}|localhost|(\d{1,3}\.){3}\d{1,3})(:\d+)?(\/.*)?)$/.test(
        targetUrl,
      );

    if (isUrl) {
      if (
        !targetUrl.startsWith("http://") &&
        !targetUrl.startsWith("https://")
      ) {
        targetUrl = "https://" + targetUrl;
      }
    } else {
      // Treat as search query and dynamically forward to brave
      targetUrl =
        "https://search.brave.com/search?q=" + encodeURIComponent(targetUrl);
    }

    setTabs((prev) => {
      const newTabs = [...prev];
      newTabs[selectedTabIndex].url = targetUrl;
      return newTabs;
    });
  };

  const handleDownload = async (url: string, filename: string) => {
    console.log(
      `[Browser] Download Intercepted! URL: ${url} | Suggested Filename: ${filename}`,
    );
  };

  const currentTab = tabs[selectedTabIndex];

  return (
    <AppShell
      isMobile={isMobile}
      sidebarOpen={false}
      sidebar={<></>}
      accentColor="#4ADFB5"
    >
      <Toolbar>
        {!isMobile && (
          <>
            <ToolbarActions>
              <ToolbarButton
                onClick={() => tabRefs.current[selectedTabIndex]?.goBack()}
                disabled={!currentTab?.canGoBack}
              >
                <Icon icon={ChevronLeft} />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => tabRefs.current[selectedTabIndex]?.goForward()}
                disabled={!currentTab?.canGoForward}
              >
                <Icon icon={ChevronRight} />
              </ToolbarButton>
            </ToolbarActions>
            <ToolbarButton
              onClick={() => tabRefs.current[selectedTabIndex]?.refresh()}
            >
              <Icon icon={RotateCw} />
            </ToolbarButton>
          </>
        )}

        <TextInput
          ref={addressBarRef}
          placeholder="Search or enter website name"
          value={inputValue}
          onChange={setInputValue}
          onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === "Enter") handleNavigate();
          }}
        />

        {!isMobile && (
          <ToolbarButton onClick={handleNavigate}>
            <Icon icon={ArrowRight} />
          </ToolbarButton>
        )}
        <ToolbarActions>
          <ToolbarButton
            onClick={(e) => {
              e.stopPropagation();
              setMoreContextMenuOpen(true);
            }}
          >
            <Icon icon={Ellipsis} />
          </ToolbarButton>
          <ToolbarButton onClick={handleAddTab}>
            <Icon icon={Plus} />
          </ToolbarButton>
        </ToolbarActions>
      </Toolbar>
      <ContextMenu open={moreContextMenuOpen} from="top-right">
        {isMobile && (
          <>
            <SidebarItem
              onClick={() => tabRefs.current[selectedTabIndex]?.goBack()}
              //disabled={!currentTab?.canGoBack}
            >
              <Icon icon={ChevronLeft} />
              Go Back
            </SidebarItem>
            <SidebarItem
              onClick={() => tabRefs.current[selectedTabIndex]?.goForward()}
              //disabled={!currentTab?.canGoForward}
            >
              <Icon icon={ChevronRight} />
              Go Forward
            </SidebarItem>
            <SidebarItem
              onClick={() => tabRefs.current[selectedTabIndex]?.refresh()}
            >
              <Icon icon={RotateCw} />
              Reload
            </SidebarItem>
          </>
        )}
        <SidebarItem
          onClick={() => {
            setTabs((prev) => {
              const newTabs = [...prev];
              newTabs[selectedTabIndex].url = "about:blank";
              return newTabs;
            });
            setMoreContextMenuOpen(false);
          }}
        >
          <Icon icon={Home} />
          Go to the Homepage
        </SidebarItem>
        {favorites.some((fav) => fav.url === currentTab.url) ? (
          <SidebarItem
            onClick={() => {
              removeFavorite(currentTab.url);
            }}
          >
            <Icon icon={StarOff} />
            Remove from Favorites
          </SidebarItem>
        ) : (
          <SidebarItem
            onClick={() => {
              addFavorite(currentTab.title, currentTab.url);
            }}
          >
            <Icon icon={Star} />
            Add to Favorites
          </SidebarItem>
        )}
        <SidebarItem
          onClick={() => {
            setTabs((prev) => {
              const newTabs = [...prev];
              newTabs[selectedTabIndex].url = "about:history";
              return newTabs;
            });
            setMoreContextMenuOpen(false);
          }}
        >
          <Icon icon={Clock} />
          History
        </SidebarItem>
      </ContextMenu>
      <Content expanded={true}>
        <TabBar>
          <TabContainer>
            {tabs.map((tab, index) => (
              <Tab
                key={index}
                title={tab.title}
                selected={index === selectedTabIndex}
                onClick={() => setSelectedTabIndex(index)}
                canClose={true}
                onClose={() => handleCloseTab(index)}
              />
            ))}
          </TabContainer>
        </TabBar>
        {tabs.map((tab, index) => (
          <Browser
            key={index}
            ref={(el) => {
              tabRefs.current[index] = el;
            }}
            initialUrl={tab.url}
            visible={index === selectedTabIndex}
            onPageLoad={(title, url, canGoBack, canGoForward) =>
              handlePageLoad(index, title, url, canGoBack, canGoForward)
            }
            onOpenNewTab={handleOpenNewTab}
            onDownload={handleDownload}
            favorites={favorites}
            globalHistory={history}
            onAddToGlobalHistory={addToHistory}
            onClearGlobalHistory={clearHistory}
            onRemoveFavorite={removeFavorite}
            siteStorage={siteStorage}
            onInstallApp={(data) => {
              window.parent.postMessage(
                {
                  type: "browserInstallApp",
                  app: data.app,
                  packageUrl: data.packageUrl,
                },
                "*",
              );
            }}
            onStorageUpdate={handleStorageUpdate}
            isMobile={isMobile}
          />
        ))}
      </Content>
    </AppShell>
  );
}
export default App;
