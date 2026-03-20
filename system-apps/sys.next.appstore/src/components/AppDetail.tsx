interface AppDetailProps {
  selectedApp: AppData;
  isInstalling: boolean;
  installedApps: string[];
  handleInstallApp: (app: AppData) => void;
}

import type { AppData } from "../App";
import PermissionList from "./PermissionList";
import { useTranslation } from "react-i18next";

import MetadataItem from "./MetadataItem";

import { Card, Button } from "@htmlos-next/ui";

function AppDetail({
  selectedApp,
  isInstalling,
  installedApps,
  handleInstallApp,
}: AppDetailProps) {
  const { t } = useTranslation();
  return (
    <div className="app-detail-view">
      <Card>
        <div className="app-detail-card">
          <img
            src={selectedApp.storeIcon}
            alt={selectedApp.app.name}
            className="app-detail-icon"
          />
          <div className="app-detail-info">
            <p className="app-detail-description">{selectedApp.description}</p>
            <p className="app-detail-author">
              {t("overview.by")} {selectedApp.author}
            </p>
          </div>
          <Button
            onClick={() => handleInstallApp(selectedApp)}
            disabled={
              isInstalling || installedApps.includes(selectedApp.app.id)
            }
          >
            {isInstalling
              ? t("overview.installing")
              : installedApps.includes(selectedApp.app.id)
                ? t("overview.installed")
                : t("overview.install")}
          </Button>
        </div>
      </Card>

      {selectedApp.screenshots && selectedApp.screenshots.length > 0 && (
        <Card>
          <div className="screenshots">
            <h3>{t("overview.screenshots")}</h3>
            <div className="screenshots-row">
              {selectedApp.screenshots.map((screenshot, index) => (
                <img
                  key={index}
                  src={screenshot}
                  alt={`Screenshot ${index + 1}`}
                  className="screenshot"
                />
              ))}
            </div>
          </div>
        </Card>
      )}

      {selectedApp.app.permissions &&
        selectedApp.app.permissions.length > 0 && (
          <Card>
            <PermissionList app={selectedApp}></PermissionList>
          </Card>
        )}

      <Card>
        <MetadataItem>
          <span className="metadata-label">{t("overview.version")}</span>
          <span className="metadata-value">{selectedApp.app.version}</span>
        </MetadataItem>
        <MetadataItem>
          <span className="metadata-label">{t("overview.appId")}</span>
          <span className="metadata-value">{selectedApp.app.id}</span>
        </MetadataItem>
      </Card>
    </div>
  );
}

export default AppDetail;
