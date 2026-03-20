import { SettingEntry } from "../components/SettingEntry/SettingEntry";
import { useTranslation } from "react-i18next";

interface DeveloperOptionsViewProps {
  settings: any;
  changeSetting: (setting: string, value: string | boolean) => void;
}

function DeveloperOptionsView({
  settings,
  changeSetting,
}: DeveloperOptionsViewProps) {
  const { t } = useTranslation();

  const handleShowReloadButtonChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const newValue = event.target.checked;
    changeSetting("showReloadButton", newValue);
  };

  const handleShowInspectButtonChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const newValue = event.target.checked;
    changeSetting("showInspectButton", newValue);
  };

  return (
    <>
      <SettingEntry>
        {t("developeroptions.showreloadbutton")}
        <input
          type="checkbox"
          id="showReloadButton"
          name="showReloadButton"
          checked={String(settings.showReloadButton) === "true"}
          onChange={handleShowReloadButtonChange}
        />
      </SettingEntry>
      <SettingEntry>
        {t("developeroptions.showinspectbutton")}
        <input
          type="checkbox"
          id="showInspectButton"
          name="showInspectButton"
          checked={String(settings.showInspectButton) === "true"}
          onChange={handleShowInspectButtonChange}
        />
      </SettingEntry>
    </>
  );
}

export default DeveloperOptionsView;
