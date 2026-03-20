import { useState, useLayoutEffect } from "react";
import "./App.css";
import AudioPlayer from "./Components/AudioPlayer";
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
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

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
      setAudioUrl(fileInputUrl);
      setIsPlaying(true);
    }
  }, []);

  const handleLoadAudio = async () => {
    const url = await api.selectFile(["mp3", "wav", "ogg", "flac", "m4a"]);
    if (url) {
      setAudioUrl(url);
      setIsPlaying(true);
    }
  };

  const handleBack = () => {
    setIsPlaying(false);
    setAudioUrl(null);
  };

  const { t } = useTranslation();

  return (
    <AppShell
      isMobile={isMobile}
      accentColor="#ff0055"
      sidebarOpen={false}
      sidebar={<></>}
    >
      {isPlaying && audioUrl && (
        <Toolbar>
          <ToolbarButton onClick={handleBack}>
            <Icon icon={ChevronLeft} />
          </ToolbarButton>
        </Toolbar>
      )}

      <Content toolbar={isPlaying}>
        {isPlaying && audioUrl ? (
          <AudioPlayer audioUrl={audioUrl} />
        ) : (
          <div className="no-content-container">
            <div className="no-content">
              <img src={AppIcon} alt="App Icon" className="app-icon" />
              <h3 className="no-content-text">{t("main.title")}</h3>
              <Button onClick={handleLoadAudio}>{t("main.button")}</Button>
            </div>
          </div>
        )}
      </Content>
    </AppShell>
  );
}

export default App;
