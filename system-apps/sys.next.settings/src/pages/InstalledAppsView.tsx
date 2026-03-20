import { useState, useEffect } from "react";
import { SettingEntry } from "../components/SettingEntry/SettingEntry";
import { Trash2, Package } from "lucide-react";
import {
  EmptyView,
  Icon,
  Popup,
  PopupTitle,
  PopupDescription,
  PopupActions,
  PopupButton,
} from "@htmlos-next/ui";
import { useTranslation } from "react-i18next";
import * as api from "@htmlos-next/api";

interface App {
  id: string;
  name: string;
  icon: string;
  version?: string;
}

function InstalledAppsView() {
  const { t } = useTranslation();

  const [apps, setApps] = useState<App[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [deleteAppPopupOpen, setDeleteAppPopupOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState<App | undefined>();

  const loadApps = async () => {
    try {
      setLoading(true);
      setError(null);
      const installedApps = await api.getInstalledApps();
      setApps(installedApps);
    } catch (err) {
      console.error("Failed to load installed apps:", err);
      setError(err instanceof Error ? err.message : "Failed to load apps");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApps();
  }, []);

  const handleUninstall = async (appId: string) => {
    setDeleteAppPopupOpen(false);
    try {
      await api.uninstallApp(appId);
      await loadApps();
    } catch (err) {
      console.error("Failed to uninstall app:", err);
    }
  };

  if (loading) {
    return <EmptyView icon={Package} label="Loading installed apps..." />;
  }

  if (error) {
    return <EmptyView icon={Package} label={`Error: ${error}`} />;
  }

  if (apps.length === 0) {
    return <EmptyView icon={Package} label="No user-installed apps found" />;
  }

  return (
    <>
      {apps.map((app) => (
        <SettingEntry key={app.id}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              flex: 1,
            }}
          >
            <img
              src={app.icon}
              alt={app.name}
              style={{
                width: "32px",
                height: "32px",
                objectFit: "contain",
              }}
            />
            <span>{app.name}</span>
          </div>
          <button
            onClick={() => {
              setSelectedApp(app);
              setDeleteAppPopupOpen(true);
            }}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              padding: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--text-primary)",
              opacity: 0.7,
              transition: "opacity 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.7")}
            title={`Uninstall ${app.name}`}
          >
            <Icon icon={Trash2}></Icon>
          </button>
        </SettingEntry>
      ))}
      <Popup open={deleteAppPopupOpen}>
        <PopupTitle>
          {t("installedapps.popup.title", { appName: selectedApp?.name })}
        </PopupTitle>
        <PopupDescription>
          {t("installedapps.popup.description")}
        </PopupDescription>
        <PopupActions orientation="horizontal">
          <PopupButton
            type="secondary"
            onClick={() => setDeleteAppPopupOpen(false)}
          >
            {t("installedapps.popup.cancel")}
          </PopupButton>
          <PopupButton
            onClick={() => {
              if (selectedApp?.id) {
                handleUninstall(selectedApp.id);
              }
            }}
          >
            {t("installedapps.popup.submit")}
          </PopupButton>
        </PopupActions>
      </Popup>
    </>
  );
}

export default InstalledAppsView;
