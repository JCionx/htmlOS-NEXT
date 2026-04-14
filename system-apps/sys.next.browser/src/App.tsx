import { useState, useLayoutEffect, useRef } from "react";
import "./App.css";
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  Home,
  ArrowRight,
  RotateCw,
} from "lucide-react";
//import * as api from "@htmlos-next/api";
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

  // Store refs for each Browser component based on their index
  const tabRefs = useRef<Record<number, BrowserHandle | null>>({});

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
    // node-unblocker rewrites target="_blank" links dynamically to have the proxy base.
    // E.g., http://100.75.34.102:4000/proxy/https://...
    // We only care about everything after /proxy/
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
  }, []);

  // Update input text whenever the active tab URL changes
  useLayoutEffect(() => {
    if (tabs[selectedTabIndex]) {
      const activeUrl = tabs[selectedTabIndex].url;
      setInputValue(activeUrl === "about:blank" ? "" : activeUrl);
    }
  }, [selectedTabIndex, tabs[selectedTabIndex]?.url]);

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
    <AppShell isMobile={isMobile} sidebarOpen={false} sidebar={<></>}>
      <Toolbar>
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

        {/* We use inputValue directly so users can type without it prematurely updating the iframe */}
        <TextInput
          placeholder="Search or enter website name"
          value={inputValue}
          onChange={setInputValue}
          onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === "Enter") handleNavigate();
          }}
        />

        <ToolbarButton onClick={handleNavigate}>
          <Icon icon={ArrowRight} />
        </ToolbarButton>
        <ToolbarActions>
          <ToolbarButton
            onClick={() =>
              handlePageLoad(
                selectedTabIndex,
                "New Tab",
                homepage,
                false,
                false,
              )
            }
          >
            <Icon icon={Home} />
          </ToolbarButton>
          <ToolbarButton onClick={handleAddTab}>
            <Icon icon={Plus} />
          </ToolbarButton>
        </ToolbarActions>
      </Toolbar>
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
          />
        ))}
      </Content>
    </AppShell>
  );
}

export default App;
