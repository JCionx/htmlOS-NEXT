import { useRef, useEffect } from "react";
import * as api from "../api";

interface VideoPlayerProps {
  videoUrl: string;
}

function VideoPlayer({ videoUrl }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

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
  }, []);

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
