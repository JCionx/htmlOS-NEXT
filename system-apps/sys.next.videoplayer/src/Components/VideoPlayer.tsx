import { useRef, useEffect } from "react";
import * as api from "../api";

interface VideoPlayerProps {
  videoUrl: string;
  initialTime?: number;
  onTimeUpdate?: (time: number) => void;
}

function VideoPlayer({
  videoUrl,
  initialTime = 0,
  onTimeUpdate,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const seekAppliedForUrlRef = useRef<string | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = async () => {
      const naturalWidth = video.videoWidth;
      const naturalHeight = video.videoHeight;

      const screenWidth = api.getScreenWidth();
      const screenHeight = api.getScreenHeight();

      // Calculate scale factors for width and height
      const widthScale = (screenWidth * 0.9) / naturalWidth;
      const heightScale = (screenHeight * 0.9) / naturalHeight;

      // Use the smaller scale to ensure both dimensions fit
      const scale = Math.min(widthScale, heightScale);

      const newWidth = naturalWidth * scale;
      const newHeight = naturalHeight * scale;

      api.setSize(newWidth, newHeight, true);
    };

    video.addEventListener("loadedmetadata", handleLoadedMetadata);

    return () => {
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
    };
  }, [videoUrl]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    seekAppliedForUrlRef.current = null;

    const seekToInitialTime = () => {
      if (seekAppliedForUrlRef.current === videoUrl) {
        return;
      }
      seekAppliedForUrlRef.current = videoUrl;

      if (!Number.isFinite(initialTime) || initialTime <= 0) {
        return;
      }

      const maxTime =
        Number.isFinite(video.duration) && video.duration > 0
          ? Math.max(video.duration - 0.25, 0)
          : initialTime;
      const targetTime = Math.min(initialTime, maxTime);
      video.currentTime = targetTime;
      onTimeUpdate?.(targetTime);
    };

    if (video.readyState >= 1) {
      seekToInitialTime();
    } else {
      video.addEventListener("loadedmetadata", seekToInitialTime, {
        once: true,
      });
    }

    return () => {
      video.removeEventListener("loadedmetadata", seekToInitialTime);
    };
  }, [videoUrl, initialTime, onTimeUpdate]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !onTimeUpdate) return;

    const publishTime = () => {
      const nextTime = video.currentTime;
      onTimeUpdate(nextTime);
    };

    publishTime();
    video.addEventListener("timeupdate", publishTime);
    video.addEventListener("seeked", publishTime);
    video.addEventListener("pause", publishTime);
    video.addEventListener("ended", publishTime);

    return () => {
      video.removeEventListener("timeupdate", publishTime);
      video.removeEventListener("seeked", publishTime);
      video.removeEventListener("pause", publishTime);
      video.removeEventListener("ended", publishTime);
    };
  }, [videoUrl, onTimeUpdate]);

  return (
    <video
      ref={videoRef}
      src={videoUrl}
      controls
      autoPlay
      className="video-player"
    />
  );
}

export default VideoPlayer;
