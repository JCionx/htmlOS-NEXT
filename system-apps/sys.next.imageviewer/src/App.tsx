import { useState, useLayoutEffect, useEffect, useRef } from "react";
import "./App.css";
import ImageViewer from "./Components/ImageViewer";
import AppIcon from "/icon.png";
import * as api from "./api";

import { ChevronLeft } from "lucide-react";

import {
  AppShell,
  Content,
  Toolbar,
  ToolbarButton,
  Button,
  Icon,
} from "@htmlos-next/ui";

import i18n from "./i18n";
import { useTranslation } from "react-i18next";

function App() {
  const [isMobile, setIsMobile] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [toolbarHidden, setToolbarHidden] = useState(false);
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

    const fileInputUrl = urlParams.get("fileInputUrl");
    if (fileInputUrl) {
      setImageUrl(fileInputUrl);
    }
  }, []);

  useEffect(() => {
    if (!imageUrl) return;

    hideTimeoutRef.current = setTimeout(() => {
      setToolbarHidden(true);
    }, 3000);

    const handleActivity = () => {
      setToolbarHidden(false);

      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }

      hideTimeoutRef.current = setTimeout(() => {
        setToolbarHidden(true);
      }, 3000);
    };

    window.addEventListener("mousemove", handleActivity);
    window.addEventListener("touchstart", handleActivity);

    return () => {
      window.removeEventListener("mousemove", handleActivity);
      window.removeEventListener("touchstart", handleActivity);
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, [imageUrl]);

  const handleLoadImage = async () => {
    const url = await api.selectFile([
      "png",
      "jpg",
      "jpeg",
      "gif",
      "webp",
      "svg",
      "bmp",
    ]);
    if (url) {
      setImageUrl(url);
    }
  };

  const handleBack = () => {
    setImageUrl(null);
    setToolbarHidden(false);
  };

  const { t } = useTranslation();

  return (
    <AppShell
      isMobile={isMobile}
      accentColor="#FFC107"
      sidebarOpen={false}
      sidebar={<></>}
    >
      {imageUrl && (
        <Toolbar collapsed={toolbarHidden}>
          <ToolbarButton onClick={handleBack}>
            <Icon icon={ChevronLeft} />
          </ToolbarButton>
        </Toolbar>
      )}

      <Content toolbar={false} margin="none">
        {imageUrl ? (
          <ImageViewer imageUrl={imageUrl} />
        ) : (
          <div className="no-content-container">
            <div className="no-content">
              <img src={AppIcon} alt="App Icon" className="app-icon" />
              <h3 className="no-content-text">{t("main.title")}</h3>
              <Button
                onClick={handleLoadImage}
                style={{
                  color: "white",
                }}
              >
                {t("main.button")}
              </Button>
            </div>
          </div>
        )}
      </Content>
    </AppShell>
  );
}

export default App;
