import { SettingEntry } from "../components/SettingEntry/SettingEntry";
import { SelectInput } from "@htmlos-next/ui";
import { useTranslation } from "react-i18next";

interface SystemViewProps {
  settings: any;
  changeSetting: (setting: string, value: string | boolean) => void;
  setShowDeveloperOptionsTab: (arg0: boolean) => void;
}

function SystemView({
  settings,
  changeSetting,
  setShowDeveloperOptionsTab,
}: SystemViewProps) {
  const { t } = useTranslation();

  const timezones = ["system", ...Intl.supportedValuesOf("timeZone")];

  const handleLanguageChange = async (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const newValue = event.target.value;
    changeSetting("language", newValue);
  };

  const handleTimeZoneChange = async (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const newValue = event.target.value;
    changeSetting("timezone", newValue);
  };

  const handleTwentyFourHourClockChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const newValue = event.target.checked;
    changeSetting("twentyFourHourClock", newValue);
  };

  const handleShowSecondsChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const newValue = event.target.checked;
    changeSetting("showSeconds", newValue);
  };

  const handleShowDeveloperOptionsChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const newValue = event.target.checked;
    changeSetting("showDeveloperOptions", newValue);
    setShowDeveloperOptionsTab(newValue);
  };

  return (
    <>
      <SettingEntry>
        {t("system.language")}
        <SelectInput
          name="language"
          id="language"
          onChange={handleLanguageChange}
          defaultValue={settings["language"]}
        >
          <option value="en">English</option>
          <option value="pt">Portuguese</option>
          <option value="es">Spanish</option>
          <option value="zh">Chinese</option>
          <option value="fr">French</option>
          <option value="de">German</option>
        </SelectInput>
      </SettingEntry>
      <SettingEntry>
        {t("system.timezone")}
        <SelectInput
          name="timezone"
          id="timezone"
          onChange={handleTimeZoneChange}
          defaultValue={settings["timezone"]}
        >
          {timezones.map((tz) => (
            <option key={tz} value={tz}>
              {tz === "system" ? "System" : tz.replace("_", " ")}
            </option>
          ))}
        </SelectInput>
      </SettingEntry>
      <SettingEntry>
        {t("system.24hour")}
        <input
          type="checkbox"
          id="twentyFourHourClock"
          name="twentyFourHourClock"
          checked={String(settings.twentyFourHourClock) === "true"}
          onChange={handleTwentyFourHourClockChange}
        />
      </SettingEntry>
      <SettingEntry>
        {t("system.secondsinclock")}
        <input
          type="checkbox"
          id="showSeconds"
          name="showSeconds"
          checked={String(settings.showSeconds) === "true"}
          onChange={handleShowSecondsChange}
        />
      </SettingEntry>
      <SettingEntry>
        {t("system.developeroptions")}
        <input
          type="checkbox"
          id="showDeveloperOptions"
          name="showDeveloperOptions"
          checked={String(settings.showDeveloperOptions) === "true"}
          onChange={handleShowDeveloperOptionsChange}
        ></input>
      </SettingEntry>
    </>
  );
}

export default SystemView;
