import { useState, useEffect } from "react";
import { SettingEntry } from "../components/SettingEntry/SettingEntry";
import { EmptyView, SelectInput } from "@htmlos-next/ui";
import { FileCog } from "lucide-react";
import * as api from "@htmlos-next/api";

interface FileTypeData {
  [filetype: string]: Array<{
    app: string;
    default: boolean;
  }>;
}

interface App {
  id: string;
  name: string;
  name_locale?: string;
  locale?: { [key: string]: string };
}

function DefaultAppsView() {
  const [fileTypes, setFileTypes] = useState<FileTypeData>({});
  const [apps, setApps] = useState<App[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch both filetypes and apps list using the new API
      const [fileTypesData, appsData] = await Promise.all([
        api.getFileTypes(),
        api.getInstalledAppsList(),
      ]);

      setFileTypes(fileTypesData);
      setApps(appsData);
    } catch (err) {
      console.error("Failed to load data:", err);
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDefaultChange = async (
    filetype: string,
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const newAppId = event.target.value;

    try {
      await api.setDefaultApp(filetype, newAppId);
      // Reload data to reflect changes
      await loadData();
    } catch (err) {
      console.error("Failed to set default app:", err);
      alert(
        `Failed to set default app: ${err instanceof Error ? err.message : "Unknown error"}`,
      );
    }
  };

  const getAppName = (appId: string): string => {
    const app = apps.find((a) => a.id === appId);
    if (!app) return appId;
    return app.name;
  };

  if (loading) {
    return <EmptyView icon={FileCog} label="Loading file types..." />;
  }

  if (error) {
    return <EmptyView icon={FileCog} label={`Error: ${error}`} />;
  }

  const fileTypeEntries = Object.entries(fileTypes).sort((a, b) =>
    a[0].localeCompare(b[0]),
  );

  if (fileTypeEntries.length === 0) {
    return <EmptyView icon={FileCog} label="No file types configured" />;
  }

  return (
    <>
      {fileTypeEntries.map(([filetype, typeApps]) => {
        const defaultApp = typeApps.find((app) => app.default);
        const currentDefault = defaultApp ? defaultApp.app : typeApps[0]?.app;

        return (
          <SettingEntry key={filetype}>
            <label style={{ textTransform: "uppercase" }}>.{filetype}</label>
            <SelectInput
              value={currentDefault}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                handleDefaultChange(filetype, e)
              }
            >
              {typeApps.map((typeApp) => (
                <option key={typeApp.app} value={typeApp.app}>
                  {getAppName(typeApp.app)}
                </option>
              ))}
            </SelectInput>
          </SettingEntry>
        );
      })}
    </>
  );
}

export default DefaultAppsView;
