import { useState, useLayoutEffect, useEffect, useRef } from "react";
import "./App.css";
import AudioPlayer from "./Components/AudioPlayer";
import AppIcon from "/icon.png";
import * as api from "@htmlos-next/api";

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
  const [activeTempFilePath, setActiveTempFilePath] = useState<string | null>(
    null,
  );
  const [resumeInitialTime, setResumeInitialTime] = useState(0);
  const playbackPositionRef = useRef(0);

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

    const continuityData = api.getContinuityData<{
      tempFilePath?: unknown;
      currentTime?: unknown;
    }>();
    if (
      continuityData &&
      typeof continuityData.tempFilePath === "string" &&
      continuityData.tempFilePath.trim() !== ""
    ) {
      const tempFilePath = continuityData.tempFilePath.trim();
      const initialPosition =
        typeof continuityData.currentTime === "number" &&
        Number.isFinite(continuityData.currentTime) &&
        continuityData.currentTime >= 0
          ? continuityData.currentTime
          : 0;

      setAudioUrl(tempFilePath);
      setActiveTempFilePath(tempFilePath);
      setResumeInitialTime(initialPosition);
      playbackPositionRef.current = initialPosition;
      setIsPlaying(true);
      return;
    }

    const fileInputUrl = urlParams.get("fileInputUrl");
    if (fileInputUrl) {
      setAudioUrl(fileInputUrl);
      setActiveTempFilePath(fileInputUrl);
      setResumeInitialTime(0);
      playbackPositionRef.current = 0;
      setIsPlaying(true);
    }
  }, []);

  useEffect(() => {
    if (!isPlaying || !audioUrl || !activeTempFilePath) {
      api.dismissContinuity();
      return;
    }

    const publishContinuity = () => {
      api.startContinuity({
        tempFilePath: activeTempFilePath,
        currentTime: Math.max(0, playbackPositionRef.current),
      });
    };

    publishContinuity();
    const intervalId = window.setInterval(publishContinuity, 750);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [isPlaying, audioUrl, activeTempFilePath]);

  useEffect(() => {
    const unsubscribe = api.onContinuityConsumed(() => {
      setIsPlaying(false);
      setAudioUrl(null);
      setActiveTempFilePath(null);
      setResumeInitialTime(0);
      playbackPositionRef.current = 0;
    });

    return unsubscribe;
  }, []);

  const handleLoadAudio = async () => {
    const url = await api.selectFile(["mp3", "wav", "ogg", "flac", "m4a"]);
    if (url) {
      setAudioUrl(url);
      setActiveTempFilePath(url);
      setResumeInitialTime(0);
      playbackPositionRef.current = 0;
      setIsPlaying(true);
    }
  };

  const handleBack = () => {
    setIsPlaying(false);
    setAudioUrl(null);
    setActiveTempFilePath(null);
    setResumeInitialTime(0);
    playbackPositionRef.current = 0;
    api.dismissContinuity();
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
          <AudioPlayer
            audioUrl={audioUrl}
            initialTime={resumeInitialTime}
            onTimeUpdate={(time) => {
              playbackPositionRef.current = time;
            }}
          />
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
