import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import "./App.css";
import {
  AppShell,
  Sidebar,
  SidebarTitle,
  SidebarItem,
  Content,
  Toolbar,
  ToolbarTitle,
  ToolbarActions,
  ToolbarButton,
  ToolbarExpandSidebarButton,
  Popup,
  PopupTitle,
  PopupDescription,
  PopupInput,
  PopupActions,
  PopupButton,
  Card,
  EmptyView,
  ListItem,
  Icon,
} from "@htmlos-next/ui";
import {
  Cloud,
  CloudSun,
  CalendarDays,
  MapPin,
  Plus,
  Trash,
  Settings,
  Thermometer,
  Wind,
} from "lucide-react";
import * as api from "@htmlos-next/api";
import i18n from "./i18n";
import { useTranslation } from "react-i18next";

type TemperatureUnit = "celsius" | "fahrenheit";

interface StoredLocation {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  country?: string;
  admin1?: string;
}

interface LocationCandidate {
  location: StoredLocation;
  label: string;
}

interface WeatherSettings {
  temperatureUnit: TemperatureUnit;
}

interface WeatherData {
  currentTemperature: number;
  apparentTemperature: number;
  windSpeed: number;
  weatherCode: number;
  daily: Array<{
    date: string;
    maxTemp: number;
    minTemp: number;
    maxWind: number;
    weatherCode: number;
  }>;
}

const LOCATIONS_FILE = "weather.locations.json";
const SETTINGS_FILE = "weather.settings.json";

const DEFAULT_LOCATION: StoredLocation = {
  id: "new-york-us",
  name: "New York",
  latitude: 40.7128,
  longitude: -74.006,
  country: "US",
};

const DEFAULT_SETTINGS: WeatherSettings = {
  temperatureUnit: "celsius",
};

const READ_RETRY_ATTEMPTS = 8;
const READ_RETRY_DELAY_MS = 180;

function App() {
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [locations, setLocations] = useState<StoredLocation[]>([]);
  const [selectedLocationId, setSelectedLocationId] = useState("");
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [isLoadingWeather, setIsLoadingWeather] = useState(false);

  const [addPopupOpen, setAddPopupOpen] = useState(false);
  const [deletePopupOpen, setDeletePopupOpen] = useState(false);
  const [settingsPopupOpen, setSettingsPopupOpen] = useState(false);
  const [locationPickerPopupOpen, setLocationPickerPopupOpen] = useState(false);
  const [newLocationInput, setNewLocationInput] = useState("");
  const [locationCandidates, setLocationCandidates] = useState<
    LocationCandidate[]
  >([]);

  const [settings, setSettings] = useState<WeatherSettings>(DEFAULT_SETTINGS);

  const { t } = useTranslation();

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

  const selectedLocation = useMemo(
    () => locations.find((location) => location.id === selectedLocationId),
    [locations, selectedLocationId],
  );

  async function saveLocations(nextLocations: StoredLocation[]) {
    await api.saveInternalFile(LOCATIONS_FILE, JSON.stringify(nextLocations));
  }

  async function saveSettings(nextSettings: WeatherSettings) {
    await api.saveInternalFile(SETTINGS_FILE, JSON.stringify(nextSettings));
  }

  async function wait(ms: number) {
    await new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }

  async function loadInternalFileWithRetry(path: string) {
    for (let attempt = 0; attempt < READ_RETRY_ATTEMPTS; attempt += 1) {
      const raw = await api.loadInternalFileAsText(path);
      if (raw) {
        return raw;
      }

      if (attempt < READ_RETRY_ATTEMPTS - 1) {
        await wait(READ_RETRY_DELAY_MS);
      }
    }

    return null;
  }

  async function internalFileExists(path: string) {
    try {
      const entries = await api.listInternalDirectory("");
      if (!Array.isArray(entries)) {
        return false;
      }

      return entries.some(
        (entry: { name?: string; isDirectory?: boolean }) =>
          entry.name === path && !entry.isDirectory,
      );
    } catch {
      return false;
    }
  }

  async function loadStoredLocations(): Promise<StoredLocation[]> {
    const raw = await loadInternalFileWithRetry(LOCATIONS_FILE);
    if (!raw) {
      const exists = await internalFileExists(LOCATIONS_FILE);
      if (!exists) {
        await saveLocations([DEFAULT_LOCATION]);
      }
      return [DEFAULT_LOCATION];
    }

    try {
      const parsed = JSON.parse(raw) as StoredLocation[];
      if (!Array.isArray(parsed) || parsed.length === 0) {
        const exists = await internalFileExists(LOCATIONS_FILE);
        if (!exists) {
          await saveLocations([DEFAULT_LOCATION]);
        }
        return [DEFAULT_LOCATION];
      }
      return parsed;
    } catch {
      return [DEFAULT_LOCATION];
    }
  }

  async function loadStoredSettings(): Promise<WeatherSettings> {
    const raw = await loadInternalFileWithRetry(SETTINGS_FILE);
    if (!raw) {
      // Do not write defaults during load; transient read misses can happen
      // during rapid refreshes and should never overwrite persisted settings.
      return DEFAULT_SETTINGS;
    }

    try {
      const parsed = JSON.parse(raw) as WeatherSettings;
      if (
        parsed.temperatureUnit !== "celsius" &&
        parsed.temperatureUnit !== "fahrenheit"
      ) {
        return DEFAULT_SETTINGS;
      }
      return parsed;
    } catch {
      return DEFAULT_SETTINGS;
    }
  }

  useEffect(() => {
    async function initializeApp() {
      const [storedLocations, storedSettings] = await Promise.all([
        loadStoredLocations(),
        loadStoredSettings(),
      ]);
      setLocations(storedLocations);
      setSelectedLocationId(storedLocations[0].id);
      setSettings(storedSettings);
    }

    initializeApp();
  }, []);

  useEffect(() => {
    async function fetchWeather(location: StoredLocation) {
      setIsLoadingWeather(true);
      try {
        const url =
          `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}` +
          `&longitude=${location.longitude}` +
          "&current=temperature_2m,apparent_temperature,wind_speed_10m,weather_code" +
          "&daily=weather_code,temperature_2m_max,temperature_2m_min,wind_speed_10m_max" +
          "&timezone=auto&forecast_days=7";

        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Failed weather response: ${response.status}`);
        }

        const payload = await response.json();
        const dailyDates: string[] = payload.daily?.time ?? [];
        const maxTemps: number[] = payload.daily?.temperature_2m_max ?? [];
        const minTemps: number[] = payload.daily?.temperature_2m_min ?? [];
        const maxWinds: number[] = payload.daily?.wind_speed_10m_max ?? [];
        const dailyCodes: number[] = payload.daily?.weather_code ?? [];

        const nextData: WeatherData = {
          currentTemperature: payload.current?.temperature_2m ?? 0,
          apparentTemperature: payload.current?.apparent_temperature ?? 0,
          windSpeed: payload.current?.wind_speed_10m ?? 0,
          weatherCode: payload.current?.weather_code ?? 0,
          daily: dailyDates.map((date, index) => ({
            date,
            maxTemp: maxTemps[index] ?? 0,
            minTemp: minTemps[index] ?? 0,
            maxWind: maxWinds[index] ?? 0,
            weatherCode: dailyCodes[index] ?? 0,
          })),
        };

        setWeatherData(nextData);
      } catch {
        setWeatherData(null);
      } finally {
        setIsLoadingWeather(false);
      }
    }

    if (selectedLocation) {
      fetchWeather(selectedLocation);
    }
  }, [selectedLocation]);

  const closePopups = () => {
    setAddPopupOpen(false);
    setDeletePopupOpen(false);
    setSettingsPopupOpen(false);
    setLocationPickerPopupOpen(false);
    setNewLocationInput("");
    setLocationCandidates([]);
  };

  const selectLocation = (locationId: string) => {
    setSelectedLocationId(locationId);
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  const addLocation = async (location: StoredLocation) => {
    const existing = locations.find(
      (savedLocation) =>
        (savedLocation.name.toLowerCase() === location.name.toLowerCase() &&
          (savedLocation.country ?? "") === (location.country ?? "") &&
          Math.abs(savedLocation.latitude - location.latitude) < 0.001 &&
          Math.abs(savedLocation.longitude - location.longitude) < 0.001) ||
        savedLocation.id === location.id,
    );

    if (existing) {
      setSelectedLocationId(existing.id);
      closePopups();
      return;
    }

    const nextLocations = [...locations, location];
    setLocations(nextLocations);
    setSelectedLocationId(location.id);
    await saveLocations(nextLocations);
    closePopups();
  };

  const searchLocations = async (query: string) => {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) return;

    const geocodeUrl =
      "https://geocoding-api.open-meteo.com/v1/search?count=8&language=" +
      encodeURIComponent(i18n.language || "en") +
      "&format=json&name=" +
      encodeURIComponent(trimmedQuery);

    const response = await fetch(geocodeUrl);
    if (!response.ok) return;

    const payload = await response.json();
    const results = payload.results;
    if (!Array.isArray(results) || results.length === 0) {
      setLocationCandidates([]);
      return;
    }

    const nextCandidates: LocationCandidate[] = results.map(
      (result: {
        name: string;
        latitude: number;
        longitude: number;
        country?: string;
        country_code?: string;
        admin1?: string;
      }) => {
        const cityName = result.name;
        const countryCode = (result.country_code ?? "").toLowerCase();
        const admin1 = result.admin1 ?? "";
        const id = `${cityName.toLowerCase().replace(/\s+/g, "-")}-${countryCode}-${admin1
          .toLowerCase()
          .replace(
            /\s+/g,
            "-",
          )}-${result.latitude.toFixed(3)}-${result.longitude.toFixed(3)}`;

        const location: StoredLocation = {
          id,
          name: cityName,
          latitude: result.latitude,
          longitude: result.longitude,
          country: result.country_code,
          admin1: result.admin1,
        };

        const labelParts = [cityName, result.admin1, result.country].filter(
          Boolean,
        );

        return {
          location,
          label: labelParts.join(", "),
        };
      },
    );

    setLocationCandidates(nextCandidates);
    setAddPopupOpen(false);
    setLocationPickerPopupOpen(true);
  };

  const deleteSelectedLocation = async () => {
    if (!selectedLocation) return;

    const remainingLocations = locations.filter(
      (location) => location.id !== selectedLocation.id,
    );

    if (remainingLocations.length === 0) {
      const fallbackLocations = [DEFAULT_LOCATION];
      setLocations(fallbackLocations);
      setSelectedLocationId(DEFAULT_LOCATION.id);
      await saveLocations(fallbackLocations);
      closePopups();
      return;
    }

    setLocations(remainingLocations);
    setSelectedLocationId(remainingLocations[0].id);
    await saveLocations(remainingLocations);
    closePopups();
  };

  const setTemperatureUnit = async (temperatureUnit: TemperatureUnit) => {
    const nextSettings: WeatherSettings = {
      temperatureUnit,
    };
    setSettings(nextSettings);
    await saveSettings(nextSettings);
  };

  const formatTemperature = (value: number) => {
    if (settings.temperatureUnit === "fahrenheit") {
      return `${Math.round((value * 9) / 5 + 32)} F`;
    }
    return `${Math.round(value)} C`;
  };

  return (
    <AppShell
      isMobile={isMobile}
      sidebarOpen={sidebarOpen}
      accentColor="#72AEE6"
      sidebar={
        <Sidebar open={sidebarOpen}>
          <SidebarTitle>{t("sidebar.title")}</SidebarTitle>
          {locations.map((location) => (
            <SidebarItem
              key={location.id}
              selected={selectedLocationId === location.id}
              onClick={() => selectLocation(location.id)}
            >
              {location.name}
            </SidebarItem>
          ))}
        </Sidebar>
      }
    >
      <Toolbar expanded={!sidebarOpen}>
        <ToolbarExpandSidebarButton
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          expanded={!sidebarOpen}
        />
        <ToolbarTitle>
          {selectedLocation ? selectedLocation.name : t("toolbar.title")}
        </ToolbarTitle>
        <ToolbarActions>
          <ToolbarButton onClick={() => setSettingsPopupOpen(true)}>
            <Settings size={isMobile ? 24 : 18} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => {
              if (selectedLocation) {
                setDeletePopupOpen(true);
              }
            }}
          >
            <Trash size={isMobile ? 24 : 18} />
          </ToolbarButton>
          <ToolbarButton onClick={() => setAddPopupOpen(true)}>
            <Plus size={isMobile ? 24 : 18} />
          </ToolbarButton>
        </ToolbarActions>
      </Toolbar>

      <Content expanded={!sidebarOpen}>
        {selectedLocation && weatherData ? (
          <div className="weather-layout">
            <div className="weather-grid">
              <Card>
                <h3 className="weather-card-title weather-card-title-row">
                  <Thermometer size={18} />
                  {t("content.temperature")}
                </h3>
                <p className="weather-card-value">
                  {formatTemperature(weatherData.currentTemperature)}
                </p>
                <p className="weather-card-subtitle">
                  {t("content.feelsLike")}:{" "}
                  {formatTemperature(weatherData.apparentTemperature)}
                </p>
              </Card>

              <Card>
                <h3 className="weather-card-title weather-card-title-row">
                  <Cloud size={18} />
                  {t("content.condition")}
                </h3>
                <p className="weather-card-value">
                  {t(`conditions.${weatherData.weatherCode}`, {
                    defaultValue: t("conditions.default"),
                  })}
                </p>
              </Card>

              <Card>
                <h3 className="weather-card-title weather-card-title-row">
                  <Wind size={18} />
                  {t("content.windspeed")}
                </h3>
                <p className="weather-card-value">
                  {Math.round(weatherData.windSpeed)} km/h
                </p>
              </Card>

              <div className="weather-full-width">
                <Card>
                  <h3 className="weather-card-title weather-card-title-row">
                    <CalendarDays size={18} />
                    {t("content.forecast")}
                  </h3>
                  <div className="forecast-list">
                    {weatherData.daily.map((day) => (
                      <div key={day.date} className="forecast-item">
                        <div>
                          <strong>
                            {new Date(day.date).toLocaleDateString(
                              i18n.language,
                              {
                                weekday: "long",
                              },
                            )}
                          </strong>
                          <span>
                            {t(`conditions.${day.weatherCode}`, {
                              defaultValue: t("conditions.default"),
                            })}
                          </span>
                        </div>
                        <div>
                          <strong>
                            {formatTemperature(day.maxTemp)} /{" "}
                            {formatTemperature(day.minTemp)}
                          </strong>
                          <span>{Math.round(day.maxWind)} km/h</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </div>
          </div>
        ) : isLoadingWeather ? (
          <EmptyView icon={CloudSun} label={t("content.loading")} />
        ) : (
          <EmptyView icon={CloudSun} label={t("content.empty")} />
        )}
      </Content>

      <Popup open={addPopupOpen}>
        <PopupTitle>{t("popup.add.title")}</PopupTitle>
        <PopupDescription>{t("popup.add.description")}</PopupDescription>
        <PopupInput
          autoFocus
          placeholder={t("popup.add.placeholder")}
          value={newLocationInput}
          onChange={setNewLocationInput}
          onSubmit={searchLocations}
        ></PopupInput>
        <PopupActions orientation="horizontal">
          <PopupButton type="secondary" onClick={closePopups}>
            {t("popup.cancel")}
          </PopupButton>
          <PopupButton onClick={() => searchLocations(newLocationInput)}>
            {t("popup.add.submit")}
          </PopupButton>
        </PopupActions>
      </Popup>

      <Popup open={locationPickerPopupOpen}>
        <PopupTitle>{t("popup.picker.title")}</PopupTitle>
        <PopupDescription>{t("popup.picker.description")}</PopupDescription>
        <div className="location-picker-list">
          {locationCandidates.map((candidate) => (
            <ListItem
              key={candidate.location.id}
              onClick={() => addLocation(candidate.location)}
            >
              <Icon icon={MapPin} />
              <span>{candidate.label}</span>
            </ListItem>
          ))}
        </div>
        <PopupActions orientation="horizontal">
          <PopupButton
            type="secondary"
            onClick={() => {
              setLocationPickerPopupOpen(false);
              setAddPopupOpen(true);
            }}
          >
            {t("popup.picker.back")}
          </PopupButton>
          <PopupButton type="secondary" onClick={closePopups}>
            {t("popup.close")}
          </PopupButton>
        </PopupActions>
      </Popup>

      <Popup open={deletePopupOpen}>
        <PopupTitle>{t("popup.delete.title")}</PopupTitle>
        <PopupDescription>{t("popup.delete.description")}</PopupDescription>
        <PopupActions orientation="horizontal">
          <PopupButton type="secondary" onClick={closePopups}>
            {t("popup.cancel")}
          </PopupButton>
          <PopupButton onClick={deleteSelectedLocation}>
            {t("popup.delete.submit")}
          </PopupButton>
        </PopupActions>
      </Popup>

      <Popup open={settingsPopupOpen}>
        <PopupTitle>{t("popup.settings.title")}</PopupTitle>
        <PopupDescription>{t("popup.settings.description")}</PopupDescription>
        <div className="settings-radios">
          <strong>{t("popup.settings.temperatureUnit")}</strong>
          <label>
            <input
              type="radio"
              name="temperatureUnit"
              checked={settings.temperatureUnit === "celsius"}
              onChange={() => setTemperatureUnit("celsius")}
            />
            {t("popup.settings.celsius")}
          </label>
          <label>
            <input
              type="radio"
              name="temperatureUnit"
              checked={settings.temperatureUnit === "fahrenheit"}
              onChange={() => setTemperatureUnit("fahrenheit")}
            />
            {t("popup.settings.fahrenheit")}
          </label>
        </div>
        <PopupActions orientation="horizontal">
          <PopupButton type="secondary" onClick={closePopups}>
            {t("popup.close")}
          </PopupButton>
        </PopupActions>
      </Popup>
    </AppShell>
  );
}

export default App;
