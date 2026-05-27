import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Mic,
  AppWindowMac,
  Video,
  Scaling,
  HardDrive,
  Plug,
  AlertTriangle,
} from "lucide-react";
import styles from "./InstallPopup.module.css";

const permissionIcons: Record<string, React.ReactNode> = {
  diskAccess: <HardDrive size={16} />,
  positionManipulation: <Scaling size={16} />,
  microphoneAccess: <Mic size={16} />,
  cameraAccess: <Video size={16} />,
  windowSpawning: <AppWindowMac size={16} />,
};

interface InstallPopupProps {
  app: any;
  onInstall: (app?: any) => void;
  onCancel: () => void;
  mobileMode: boolean;
  isUpdate?: boolean;
}

function mapPermissionToTranslationKey(permission: string): string {
  const mapping: Record<string, string> = {
    diskAccess: "fullDiskAccess",
    positionManipulation: "positionManipulation",
    microphoneAccess: "microphoneAccess",
    cameraAccess: "cameraAccess",
    windowSpawning: "spawnChildWindows",
  };
  return mapping[permission] || permission;
}

function InstallPopup({
  app,
  onInstall,
  onCancel,
  mobileMode,
  isUpdate,
}: InstallPopupProps) {
  const { t } = useTranslation();
  const [isClosing, setIsClosing] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsClosing(false), 10);
    return () => clearTimeout(timer);
  }, []);

  function handleInstall() {
    console.log("Installing app:", app);
    setIsClosing(true);
    setTimeout(() => {
      onInstall(cleanedApp);
    }, 300);
  }

  function handleCancel() {
    setIsClosing(true);
    setTimeout(() => {
      onCancel();
    }, 300);
  }

  // Helper to strip /proxy/ prefix from URLs
  const cleanProxyUrl = (url: string | undefined) => {
    return url?.startsWith("/proxy/") ? url.substring(7) : url;
  };

  // Clean proxy prefix from app object URLs
  const cleanedApp = {
    ...app,
    previewIcon: cleanProxyUrl(app.previewIcon),
    packageUrl: cleanProxyUrl(app.packageUrl),
    pluginUrl: cleanProxyUrl(app.pluginUrl),
  };

  console.log("Cleaned app data for InstallPopup:", cleanedApp);

  return (
    <div
      className={`${styles.installPopupContainer} ${
        mobileMode ? styles.installPopupContainerMobile : ""
      } ${isClosing ? styles.hidden : ""}`}
    >
      <div
        className={`${styles.installPopup} ${
          mobileMode ? styles.installPopupMobile : ""
        }`}
      >
        <div className={styles.header}>
          <div className={styles.appInfo}>
            <div className={styles.appIcon}>
              {cleanedApp.previewIcon && (
                <img
                  src={cleanedApp.previewIcon}
                  alt={`${cleanedApp.name} icon`}
                />
              )}
            </div>
            <div className={styles.appMetadata}>
              <h2 className={styles.appName}>{cleanedApp.name}</h2>
              <p className={styles.appId}>{cleanedApp.id}</p>
              <p className={styles.appVersion}>
                {t("popup.install.version")} {cleanedApp.version}
              </p>
            </div>
          </div>

          <div className={styles.warning}>
            <div className={styles.warningIcon}>
              <AlertTriangle size={20} />
            </div>
            <p className={styles.warningText}>
              {t("popup.install.unverifiedWarning")}
            </p>
          </div>
        </div>

        {(cleanedApp.permissions?.length > 0 ||
          (cleanedApp.pluginUrl && cleanedApp.pluginHash)) && (
          <div className={styles.content}>
            {cleanedApp.permissions && cleanedApp.permissions.length > 0 && (
              <div className={styles.permissions}>
                <h4>{t("overview.permissions.title")}</h4>
                <div className={styles.permissionsList}>
                  {cleanedApp.permissions.map((permission: any) => {
                    const translationKey =
                      mapPermissionToTranslationKey(permission);
                    const icon = permissionIcons[permission];

                    return (
                      <div key={permission} className={styles.permissionItem}>
                        <div className={styles.permissionIcon}>
                          {icon || <Plug size={16} />}
                        </div>
                        <span>
                          {String(
                            t(
                              `overview.permissions.${translationKey}.title`,
                              permission,
                            ),
                          )}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {cleanedApp.pluginUrl && cleanedApp.pluginHash && (
              <div className={styles.plugin}>
                <div className={styles.pluginTitle}>
                  {t("overview.permissions.pluginRequired.title")}
                </div>
                <p style={{ margin: "0 0 8px 0", fontSize: "0.9em" }}>
                  {t("popup.install.pluginInfo")}
                </p>
                <div className={styles.pluginCommand}>
                  node cli.js plugin enable {cleanedApp.id}
                </div>
              </div>
            )}
          </div>
        )}

        <div
          className={`${styles.footer} ${mobileMode ? styles.footerMobile : ""}`}
        >
          <button className={styles.cancelBtn} onClick={handleCancel}>
            {t("popup.cancel")}
          </button>
          <button className={styles.installBtn} onClick={handleInstall}>
            {t(isUpdate ? "popup.install.update" : "popup.install.install")}
          </button>
        </div>
      </div>
    </div>
  );
}

export default InstallPopup;
