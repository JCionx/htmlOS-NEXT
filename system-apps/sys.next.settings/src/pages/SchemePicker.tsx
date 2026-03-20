import { SettingEntry } from "../components/SettingEntry/SettingEntry";

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

  const timezones = ["system", ...Intl.supportedValuesOf("timeZone")];

  return (
    <>
      <SettingEntry>
        Language
        <select
          name="language"
          id="language"
          onChange={handleLanguageChange}
          defaultValue={settings["language"]}
        >
          <option value={"en"}>English</option>
          <option value={"pt"}>Portuguese</option>
          <option value={"es"}>Spanish</option>
          <option value={"zh"}>Chinese</option>
          <option value={"fr"}>French</option>
          <option value={"de"}>German</option>
        </select>
      </SettingEntry>
      <SettingEntry>
        Time Zone
        <select
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
        </select>
      </SettingEntry>
      <SettingEntry>
        24-hour Clock
        <input
          type="checkbox"
          id="twentyFourHourClock"
          name="twentyFourHourClock"
          checked={String(settings.twentyFourHourClock) === "true"}
          onChange={handleTwentyFourHourClockChange}
        />
      </SettingEntry>
      <SettingEntry>
        Show Seconds in Clock
        <input
          type="checkbox"
          id="showSeconds"
          name="showSeconds"
          checked={String(settings.showSeconds) === "true"}
          onChange={handleShowSecondsChange}
        />
      </SettingEntry>
      <SettingEntry>
        Show Developer Options
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
