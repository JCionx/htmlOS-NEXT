import { SettingEntry } from "../components/SettingEntry/SettingEntry";
import { SchemePicker } from "../components/SchemePicker/SchemePicker";
import { WallpaperPicker } from "../components/WallpaperPicker/WallpaperPicker";
import { SelectInput } from "@htmlos-next/ui";
import { useTranslation } from "react-i18next";
import * as api from "@htmlos-next/api";

interface SystemViewProps {
  settings: any;
  changeSetting: (setting: string, value: string) => void;
}

function SystemView({ settings, changeSetting }: SystemViewProps) {
  const { t } = useTranslation();

  const handleTaskbarAlignmentChange = async (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const newValue = event.target.value;
    changeSetting("taskbarAlignment", newValue);
  };

  const handleTaskbarStyleChange = async (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const newValue = event.target.value;
    changeSetting("taskbarStyle", newValue);
  };

  const handleColorSchemeChange = async (scheme: string) => {
    changeSetting("colorScheme", scheme);
  };

  const handleWallpaperChange = async (wallpaper: string) => {
    changeSetting("wallpaper", wallpaper);
  };

  const handleSelectImage = async () => {
    try {
      const fileUrl = await api.selectFile(["webp", "png", "jpg", "jpeg"]);

      if (fileUrl) {
        try {
          const response = await fetch(fileUrl);
          const blob = await response.blob();

          const filename =
            fileUrl.split("/").pop() || `wallpaper_${Date.now()}.jpg`;

          const actualFile = new File([blob], filename, { type: blob.type });

          const uploadResponse = await api.uploadWallpaper(actualFile);
          if (uploadResponse.success && uploadResponse.wallpaper) {
            handleWallpaperChange(uploadResponse.wallpaper);
          }
        } catch (err) {
          console.error("Failed to process and upload wallpaper:", err);
        }
      }
    } catch (err) {
      console.error("Failed to select wallpaper file:", err);
    }
  };

  return (
    <>
      <SettingEntry>
        <label htmlFor="taskbar-alignment">
          {t("appearence.taskbaralignment")}
        </label>
        <SelectInput
          name="taskbar-alignment"
          id="taskbar-alignment"
          onChange={handleTaskbarAlignmentChange}
          defaultValue={settings["taskbarAlignment"]}
        >
          <option value="center">{t("appearence.center")}</option>
          <option value="edges">{t("appearence.edges")}</option>
        </SelectInput>
      </SettingEntry>
      <SettingEntry>
        <label htmlFor="taskbar-style">{t("appearence.taskbarstyle")}</label>
        <SelectInput
          name="taskbar-style"
          id="taskbar-style"
          onChange={handleTaskbarStyleChange}
          defaultValue={settings["taskbarStyle"]}
        >
          <option value="floating">{t("appearence.floating")}</option>
          <option value="expanded">{t("appearence.expanded")}</option>
        </SelectInput>
      </SettingEntry>
      <SettingEntry>
        <label>{t("appearence.appearence")}</label>
        <SchemePicker
          selectedScheme={settings.colorScheme}
          selectScheme={handleColorSchemeChange}
        ></SchemePicker>
      </SettingEntry>
      <SettingEntry>
        <label>{t("appearence.backgroundimage")}</label>
      </SettingEntry>
      <WallpaperPicker
        selectedWallpaper={settings.wallpaper || ""}
        selectWallpaper={handleWallpaperChange}
        onSelectImage={handleSelectImage}
      />
    </>
  );
}

export default SystemView;
