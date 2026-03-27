import { useSettings } from "../../contexts/SettingsContext";
import styles from "./StatusBar.module.css";
import { useState, useEffect } from "react";

interface StatusBarProps {
  mobileMode?: boolean;
  overlapping?: boolean;
  floating?: boolean;
  edges?: boolean;
  hasContinuityLaunch?: boolean;
  onOpenContinuityLaunch?: () => void;
  continuityLaunchIcon?: string;
}

const formatOSTime = (
  date: Date,
  timezone: string,
  locale: string,
  showSeconds: boolean,
  twentyFourHourClock: boolean,
) => {
  const options: Intl.DateTimeFormatOptions = {
    hour: "2-digit",
    minute: "2-digit",
    second: showSeconds ? "2-digit" : undefined,
    hour12: !twentyFourHourClock,
  };

  const formatConfig =
    timezone === "system" ? options : { ...options, timeZone: timezone };

  return new Intl.DateTimeFormat(locale, formatConfig).format(date);
};

function StatusBar({
  mobileMode,
  overlapping,
  floating,
  edges,
  hasContinuityLaunch = false,
  onOpenContinuityLaunch,
  continuityLaunchIcon,
}: StatusBarProps) {
  const [time, setTime] = useState(new Date());
  const [cachedContinuityIcon, setCachedContinuityIcon] = useState<
    string | undefined
  >(continuityLaunchIcon);

  const { language, timezone, showSeconds, twentyFourHourClock } =
    useSettings();

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (continuityLaunchIcon) {
      setCachedContinuityIcon(continuityLaunchIcon);
    }
  }, [continuityLaunchIcon]);

  const continuityButton = (
    <button
      className={styles.continuityButton}
      onClick={onOpenContinuityLaunch}
      aria-label="Open continuity app"
      type="button"
      disabled={!hasContinuityLaunch}
    >
      {continuityLaunchIcon || cachedContinuityIcon ? (
        <img
          src={continuityLaunchIcon || cachedContinuityIcon}
          alt="Continuity app icon"
          className={styles.continuityIcon}
          draggable={false}
        />
      ) : (
        <span className={styles.continuityFallback}>C</span>
      )}
    </button>
  );

  if (mobileMode) {
    return (
      <div className={styles.mobileStatusbar}>
        {continuityButton}
        <p>
          {formatOSTime(
            time,
            timezone,
            language,
            showSeconds,
            twentyFourHourClock,
          )}
        </p>
      </div>
    );
  }

  return (
    <div
      className={`
        ${styles.statusbar} ${overlapping ? styles.statusbarCollapsed : ""}
        ${floating ? styles.statusbarExpanded : ""}
        ${edges ? styles.statusbarEdges : ""}
      `}
    >
      <div className={styles.statusbarContent}>
        {continuityButton}
        <p>
          {formatOSTime(
            time,
            timezone,
            language,
            showSeconds,
            twentyFourHourClock,
          )}
        </p>
      </div>
    </div>
  );
}

export default StatusBar;
