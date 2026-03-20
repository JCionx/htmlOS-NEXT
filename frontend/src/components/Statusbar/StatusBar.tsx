import { useSettings } from "../../contexts/SettingsContext";
import styles from "./StatusBar.module.css";
import { useState, useEffect } from "react";

interface StatusBarProps {
  mobileMode?: boolean;
  overlapping?: boolean;
  floating?: boolean;
  edges?: boolean;
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
}: StatusBarProps) {
  const [time, setTime] = useState(new Date());

  const { language, timezone, showSeconds, twentyFourHourClock } =
    useSettings();

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (mobileMode) {
    return (
      <div className={styles.mobileStatusbar}>
        <p>
          {formatOSTime(
            time,
            timezone,
            language,
            showSeconds,
            twentyFourHourClock,
          )}
        </p>
        <p>0 notifications</p>
      </div>
    );
  } else {
    return (
      <div
        className={`
            ${styles.statusbar} ${overlapping ? styles.statusbarCollapsed : ""}
            ${floating ? styles.statusbarExpanded : ""}
            ${edges ? styles.statusbarEdges : ""}
        `}
      >
        <div className={styles.statusbarContent}>
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
}

export default StatusBar;
