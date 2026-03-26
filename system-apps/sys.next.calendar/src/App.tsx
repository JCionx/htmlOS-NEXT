import { useLayoutEffect, useMemo, useState } from "react";
import "./App.css";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  AppShell,
  Content,
  Toolbar,
  ToolbarActions,
  ToolbarButton,
  ToolbarTitle,
} from "@htmlos-next/ui";
import i18n from "./i18n";
import { useTranslation } from "react-i18next";

function App() {
  const [isMobile, setIsMobile] = useState(false);
  const [currentDate, setCurrentDate] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  useLayoutEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const theme = urlParams.get("theme") === "dark" ? "dark" : "light";
    const deviceType =
      urlParams.get("mobile") === "true" ? "mobile" : "desktop";
    const language = urlParams.get("lang") || "en";
    i18n.changeLanguage(language);
    document.documentElement.setAttribute("data-theme", theme);
    document.documentElement.setAttribute("device-type", deviceType);
    setIsMobile(deviceType === "mobile");
  }, []);

  const { t } = useTranslation();

  const locale = i18n.language || "en";

  const monthLabel = useMemo(() => {
    return new Intl.DateTimeFormat(locale, {
      month: "long",
      year: "numeric",
    }).format(currentDate);
  }, [currentDate, locale]);

  const weekdays = useMemo(() => {
    const formatter = new Intl.DateTimeFormat(locale, {
      weekday: isMobile ? "narrow" : "short",
    });

    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(2026, 0, 4 + index);
      return formatter.format(date);
    });
  }, [isMobile, locale]);

  const dayCells = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const leadingEmpty = Array.from({ length: firstDay }, () => null);
    const days = Array.from({ length: daysInMonth }, (_, index) => index + 1);

    return [...leadingEmpty, ...days];
  }, [currentDate]);

  const today = new Date();
  const isCurrentMonth =
    today.getFullYear() === currentDate.getFullYear() &&
    today.getMonth() === currentDate.getMonth();

  const goToPreviousMonth = () => {
    setCurrentDate(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1),
    );
  };

  const goToNextMonth = () => {
    setCurrentDate(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1),
    );
  };

  return (
    <AppShell
      isMobile={isMobile}
      sidebarOpen={false}
      sidebar={<></>}
      accentColor="#dc2626"
    >
      <Toolbar expanded={true}>
        <ToolbarActions>
          <ToolbarButton onClick={goToPreviousMonth}>
            <ChevronLeft
              size={isMobile ? 24 : 18}
              aria-label={t("toolbar.previousMonth")}
            />
          </ToolbarButton>
        </ToolbarActions>
        <ToolbarTitle>{monthLabel}</ToolbarTitle>
        <ToolbarActions>
          <ToolbarButton onClick={goToNextMonth}>
            <ChevronRight
              size={isMobile ? 24 : 18}
              aria-label={t("toolbar.nextMonth")}
            />
          </ToolbarButton>
        </ToolbarActions>
      </Toolbar>

      <Content expanded={true}>
        <div className="calendar-content">
          <div className="calendar-content-toolbar">
            {weekdays.map((weekday, index) => (
              <div key={`${weekday}-${index}`} className="calendar-weekday">
                {weekday}
              </div>
            ))}
          </div>

          <div className="calendar-grid">
            {dayCells.map((day, index) => {
              if (day === null) {
                return (
                  <div
                    key={`empty-${index}`}
                    className="calendar-cell calendar-cell-empty"
                  />
                );
              }

              const isToday = isCurrentMonth && today.getDate() === day;

              return (
                <div key={day} className="calendar-cell">
                  <span
                    className={`calendar-day-number ${isToday ? "calendar-day-today" : ""}`}
                  >
                    {day}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </Content>
    </AppShell>
  );
}

export default App;
