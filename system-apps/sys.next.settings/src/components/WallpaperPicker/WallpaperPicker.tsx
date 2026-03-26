import { Plus } from "lucide-react";
import styles from "./WallpaperPicker.module.css";
import { useTranslation } from "react-i18next";

interface WallpaperPickerProps {
  selectedWallpaper: string;
  selectWallpaper: (wallpaper: string) => void;
  onSelectImage: () => void;
}

interface WallpaperItem {
  name: string;
  url: string;
}

export function WallpaperPicker({
  selectedWallpaper,
  selectWallpaper,
  onSelectImage,
}: WallpaperPickerProps) {
  const { t } = useTranslation();

  const wallpapers: WallpaperItem[] = [
    {
      name: "builtin:wallpaper-light-branding.webp",
      url: "./wallpaper-light-branding.webp",
    },
    {
      name: "builtin:wallpaper-light-color.webp",
      url: "./wallpaper-light-color.webp",
    },
    {
      name: "builtin:wallpaper-light-muted-branding.webp",
      url: "./wallpaper-light-muted-branding.webp",
    },
    {
      name: "builtin:wallpaper-light-muted.webp",
      url: "./wallpaper-light-muted.webp",
    },
    {
      name: "builtin:wallpaper-dark-color-branding.webp",
      url: "./wallpaper-dark-color-branding.webp",
    },
    {
      name: "builtin:wallpaper-dark-color.webp",
      url: "./wallpaper-dark-color.webp",
    },
    {
      name: "builtin:wallpaper-dark-muted-branding.webp",
      url: "./wallpaper-dark-muted-branding.webp",
    },
    {
      name: "builtin:wallpaper-dark-muted.webp",
      url: "./wallpaper-dark-muted.webp",
    },
  ];

  return (
    <div className={styles.wallpaperPicker}>
      {wallpapers.map((wallpaper, index) => {
        const isSelected =
          selectedWallpaper === wallpaper.name ||
          selectedWallpaper === wallpaper.name.replace("builtin:", "");
        return (
          <>
            <div key={wallpaper.name}>
              <div
                className={styles.wallpaperItem}
                onClick={() => selectWallpaper(wallpaper.name)}
              >
                <img
                  src={wallpaper.url}
                  alt="Wallpaper"
                  className={`${styles.wallpaperItemImage} ${isSelected ? styles.wallpaperItemImageSelected : ""}`}
                />
              </div>
            </div>
          </>
        );
      })}
      <div style={{ width: "100%" }} />
      <button className={styles.selectImageButton} onClick={onSelectImage}>
        <Plus size={24} />
        <span>{t("appearence.selectimage")}</span>
      </button>
    </div>
  );
}
