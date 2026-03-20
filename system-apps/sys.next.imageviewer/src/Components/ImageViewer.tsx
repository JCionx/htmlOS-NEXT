import { useRef, useEffect } from "react";
import * as api from "../api";

interface ImageViewerProps {
  imageUrl: string;
}

function ImageViewer({ imageUrl }: ImageViewerProps) {
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;

    const handleLoad = async () => {
      const naturalWidth = img.naturalWidth;
      const naturalHeight = img.naturalHeight;

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

    if (img.complete) {
      handleLoad();
    } else {
      img.addEventListener("load", handleLoad);
    }

    return () => {
      img.removeEventListener("load", handleLoad);
    };
  }, [imageUrl]);

  return (
    <img ref={imgRef} src={imageUrl} className="image-viewer" alt="Viewing" />
  );
}

export default ImageViewer;
