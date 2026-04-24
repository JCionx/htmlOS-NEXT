import {
  useEffect,
  useRef,
  useState,
  useImperativeHandle,
  forwardRef,
} from "react";

import Homepage from "./Homepage";
import History from "./History";

export interface BrowserHandle {
  goBack: () => void;
  goForward: () => void;
  refresh: () => void;
}

interface BrowserProps {
  initialUrl: string;
  visible: boolean;
  onPageLoad: (
    newTitle: string,
    newUrl: string,
    canGoBack: boolean,
    canGoForward: boolean,
  ) => void;
  onOpenNewTab: (url: string) => void;
  onDownload: (url: string, filename: string) => void;
  favorites: { title: string; url: string }[];
  globalHistory: { title: string; url: string }[];
  onAddToGlobalHistory: (title: string, url: string) => void;
  onClearGlobalHistory: () => void;
  siteStorage: any;
  onStorageUpdate: (type: string, data: any) => void;
  isMobile: boolean;
}

const Browser = forwardRef<BrowserHandle, BrowserProps>(
  (
    {
      initialUrl,
      visible,
      onPageLoad,
      onOpenNewTab,
      onDownload,
      favorites,
      globalHistory,
      onAddToGlobalHistory,
      onClearGlobalHistory,
      siteStorage,
      onStorageUpdate,
      isMobile,
    },
    ref,
  ) => {
    const iframeRef = useRef<HTMLIFrameElement>(null);

    // Keep track of the history specifically for this tab
    const [history, setHistory] = useState<string[]>([initialUrl]);
    const [currentIndex, setCurrentIndex] = useState(0);
    // The actual URL driving the iframe right now
    const [currentIframeUrl, setCurrentIframeUrl] = useState(initialUrl);

    // Expose methods to the parent (App.tsx) for the toolbar buttons
    useImperativeHandle(ref, () => ({
      goBack: () => {
        if (currentIndex > 0) {
          const newIndex = currentIndex - 1;
          const targetUrl = history[newIndex];
          setCurrentIndex(newIndex);
          setCurrentIframeUrl(targetUrl);

          if (targetUrl.startsWith("about:")) {
            onPageLoad(
              targetUrl === "about:history" ? "History" : "New Tab",
              targetUrl,
              newIndex > 0,
              newIndex < history.length - 1,
            );
          }
        }
      },
      goForward: () => {
        if (currentIndex < history.length - 1) {
          const newIndex = currentIndex + 1;
          const targetUrl = history[newIndex];
          setCurrentIndex(newIndex);
          setCurrentIframeUrl(targetUrl);

          if (targetUrl.startsWith("about:")) {
            onPageLoad(
              targetUrl === "about:history" ? "History" : "New Tab",
              targetUrl,
              newIndex > 0,
              newIndex < history.length - 1,
            );
          }
        }
      },
      refresh: () => {
        // A simple way to force an iframe refresh is to reassign its src
        if (iframeRef.current) {
          const tempSrc = iframeRef.current.src;
          iframeRef.current.src = "about:blank";
          setTimeout(() => {
            if (iframeRef.current) iframeRef.current.src = tempSrc;
          }, 10);
        }
      },
    }));

    useEffect(() => {
      const handleMessage = (event: MessageEvent) => {
        if (
          iframeRef.current &&
          event.source === iframeRef.current.contentWindow
        ) {
          const data = event.data;

          if (data && data.type === "PROXIED_PAGE_LOADED") {
            const newUrl = data.url;

            // If this is a genuine new navigation (not back/forward/refresh)
            if (newUrl !== history[currentIndex]) {
              const newHistory = history.slice(0, currentIndex + 1);
              newHistory.push(newUrl);
              setHistory(newHistory);
              onAddToGlobalHistory(data.title, newUrl);
              setCurrentIndex(newHistory.length - 1);
            }

            // Notify parent so Toolbar buttons and URL bar update
            onPageLoad(
              data.title,
              newUrl,
              currentIndex > 0 ||
                (newUrl !== history[currentIndex] && currentIndex + 1 > 0), // Calculate latest canGoBack
              currentIndex < history.length - 1 ||
                (newUrl === history[currentIndex] &&
                  currentIndex < history.length - 1), // Calculate latest canGoForward
            );
          } else if (data && data.type === "OPEN_PROXIED_WINDOW") {
            onOpenNewTab(data.url);
          } else if (data && data.type === "PROXIED_DOWNLOAD_INTERCEPTED") {
            onDownload(data.url, data.filename);
          } else if (data && data.type === "PROXIED_STORAGE_UPDATE") {
            onStorageUpdate(data.storageType, data.data);
          }
        }
      };

      window.addEventListener("message", handleMessage);

      return () => {
        window.removeEventListener("message", handleMessage);
      };
    }, [currentIndex, history, onPageLoad, onOpenNewTab, onDownload]);

    // When the top-level URL bar manually changes the URL, we need to navigate
    useEffect(() => {
      if (
        initialUrl !== currentIframeUrl &&
        initialUrl !== history[currentIndex]
      ) {
        setCurrentIframeUrl(initialUrl);

        // Internal pages don't emit PROXIED_PAGE_LOADED messages, so we manually push them to history
        if (initialUrl.startsWith("about:")) {
          const newHistory = history.slice(0, currentIndex + 1);
          newHistory.push(initialUrl);
          setHistory(newHistory);
          setCurrentIndex(newHistory.length - 1);

          onPageLoad(
            initialUrl === "about:history" ? "History" : "New Tab",
            initialUrl,
            newHistory.length > 1, // Calculate if it can go back
            false, // We just navigated forward, so canGoForward is false
          );
        }
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialUrl]);

    // If the URL is "about:blank", we shouldn't pass it through the proxy
    const finalSrc =
      currentIframeUrl === "about:blank" || currentIframeUrl === ""
        ? "about:blank"
        : "/proxy/" + currentIframeUrl;

    if (currentIframeUrl === "about:blank") {
      return (
        <Homepage
          favorites={favorites}
          navigateTo={(url: string) => setCurrentIframeUrl(url)}
          visible={visible}
        />
      );
    }

    if (currentIframeUrl === "about:history") {
      return (
        <History
          history={globalHistory}
          onClearHistory={onClearGlobalHistory}
          navigateTo={(url: string) => setCurrentIframeUrl(url)}
          visible={visible}
          isMobile={isMobile}
        />
      );
    }

    return (
      <iframe
        ref={iframeRef}
        src={finalSrc}
        name={JSON.stringify(siteStorage)}
        className={visible ? "" : "hidden"}
        style={visible ? {} : { display: "none" }}
        allow={[
          "autoplay",
          "fullscreen",
          "clipboard-read",
          "clipboard-write",
          "encrypted-media",
          "camera",
          "microphone",
        ].join(";")}
      ></iframe>
    );
  },
);

export default Browser;
