import { useState, useLayoutEffect, useEffect, useRef } from "react";
import "./App.css";
import VideoPlayer from "./Components/VideoPlayer";
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
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [activeTempFilePath, setActiveTempFilePath] = useState<string | null>(
    null,
  );
  const [resumeInitialTime, setResumeInitialTime] = useState(0);
  const playbackPositionRef = useRef(0);
  const [toolbarHidden, setToolbarHidden] = useState(false);
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useLayoutEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const theme = urlParams.get("theme") === "dark" ? "dark" : "light";
    const deviceType =
      urlParams.get("mobile") === "true" ? "mobile" : "desktop";

    document.documentElement.setAttribute("data-theme", theme);
    document.documentElement.setAttribute("device-type", deviceType);
    setIsMobile(deviceType === "mobile");
    const language = urlParams.get("lang") || "en";
    i18n.changeLanguage(language);

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

      setVideoUrl(tempFilePath);
      setActiveTempFilePath(tempFilePath);
      setResumeInitialTime(initialPosition);
      playbackPositionRef.current = initialPosition;
      setIsPlaying(true);
      return;
    }

    const fileInputUrl = urlParams.get("fileInputUrl");
    if (fileInputUrl) {
      setVideoUrl(fileInputUrl);
      setActiveTempFilePath(fileInputUrl);
      setResumeInitialTime(0);
      playbackPositionRef.current = 0;
      setIsPlaying(true);
    }
  }, []);

  useEffect(() => {
    if (!isPlaying || !videoUrl || !activeTempFilePath) {
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
  }, [isPlaying, videoUrl, activeTempFilePath]);

  useEffect(() => {
    const unsubscribe = api.onContinuityConsumed(() => {
      setIsPlaying(false);
      setVideoUrl(null);
      setActiveTempFilePath(null);
      setResumeInitialTime(0);
      playbackPositionRef.current = 0;
      setToolbarHidden(false);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!isPlaying) return;

    hideTimeoutRef.current = setTimeout(() => {
      setToolbarHidden(true);
    }, 5000);

    const handleActivity = () => {
      setToolbarHidden(false);

      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }

      hideTimeoutRef.current = setTimeout(() => {
        setToolbarHidden(true);
      }, 5000);
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
  }, [isPlaying]);

  const handleLoadVideo = async () => {
    const url = await api.selectFile(["mp4", "mov"]);
    if (url) {
      setVideoUrl(url);
      setActiveTempFilePath(url);
      setResumeInitialTime(0);
      playbackPositionRef.current = 0;
      setIsPlaying(true);
    }
  };

  const handleBack = () => {
    setIsPlaying(false);
    setVideoUrl(null);
    setActiveTempFilePath(null);
    setResumeInitialTime(0);
    playbackPositionRef.current = 0;
    setToolbarHidden(false);
    api.dismissContinuity();
  };

  const { t } = useTranslation();

  return (
    <AppShell
      isMobile={isMobile}
      accentColor="#B010FC"
      sidebarOpen={false}
      sidebar={<></>}
    >
      {isPlaying && videoUrl && (
        <Toolbar collapsed={toolbarHidden}>
          <ToolbarButton onClick={handleBack}>
            <Icon icon={ChevronLeft} />
          </ToolbarButton>
        </Toolbar>
      )}

      <Content toolbar={false} margin="none">
        {isPlaying && videoUrl ? (
          <VideoPlayer
            videoUrl={videoUrl}
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
              <Button
                onClick={handleLoadVideo}
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
