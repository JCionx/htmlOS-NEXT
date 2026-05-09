import {
  Mic,
  AppWindowMac,
  Video,
  Scaling,
  HardDrive,
  Plug,
} from "lucide-react";
import type { AppData } from "../App";
import { ListItem, Icon, Balloon } from "@htmlos-next/ui";
import { useEffect, useRef, useState } from "react";
import type { MouseEvent as ReactMouseEvent } from "react";

import { useTranslation } from "react-i18next";

interface PermissionListProps {
  app: AppData;
}

type PermissionTranslationKey =
  | "pluginRequired"
  | "fullDiskAccess"
  | "positionManipulation"
  | "microphoneAccess"
  | "cameraAccess"
  | "spawnChildWindows";

interface PermissionBalloonState {
  x: number;
  y: number;
  description: string;
}

const BALLOON_ANIMATION_MS = 300;

const mapPermissionToTranslationKey = (
  permission: string,
): PermissionTranslationKey => {
  if (permission === "pluginRequired") return "pluginRequired";
  if (permission === "diskAccess") return "fullDiskAccess";
  if (permission === "positionManipulation") return "positionManipulation";
  if (permission === "microphoneAccess") return "microphoneAccess";
  if (permission === "cameraAccess") return "cameraAccess";
  return "spawnChildWindows";
};

function PermissionList({ app }: PermissionListProps) {
  const { t } = useTranslation();
  const [balloon, setBalloon] = useState<PermissionBalloonState | null>(null);
  const [balloonOpen, setBalloonOpen] = useState(false);
  const openAnimationFrameRef = useRef<number | null>(null);

  const hideBalloon = () => {
    setBalloonOpen(false);
  };

  useEffect(() => {
    if (!balloon || !balloonOpen) {
      return;
    }

    const handlePointerAway = (event: MouseEvent | TouchEvent) => {
      const target = event.target;

      if (!(target instanceof Element)) {
        return;
      }

      if (target.closest(".permission-balloon")) {
        return;
      }

      hideBalloon();
    };

    const handleMouseMoveAway = (event: MouseEvent) => {
      const target = event.target;

      if (!(target instanceof Element)) {
        return;
      }

      if (target.closest(".permission-balloon")) {
        return;
      }

      hideBalloon();
    };

    document.addEventListener("mousedown", handlePointerAway);
    document.addEventListener("touchstart", handlePointerAway);
    document.addEventListener("mousemove", handleMouseMoveAway);

    return () => {
      document.removeEventListener("mousedown", handlePointerAway);
      document.removeEventListener("touchstart", handlePointerAway);
      document.removeEventListener("mousemove", handleMouseMoveAway);
    };
  }, [balloon, balloonOpen]);

  useEffect(() => {
    return () => {
      if (openAnimationFrameRef.current !== null) {
        window.cancelAnimationFrame(openAnimationFrameRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!balloon || balloonOpen) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setBalloon(null);
    }, BALLOON_ANIMATION_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [balloon, balloonOpen]);

  const handlePermissionClick = (
    event: ReactMouseEvent<HTMLDivElement>,
    permission: string,
  ) => {
    const translationKey = mapPermissionToTranslationKey(permission);

    setBalloon({
      x: event.clientX,
      y: event.clientY,
      description: t(`overview.permissions.${translationKey}.description`),
    });
    setBalloonOpen(false);

    if (openAnimationFrameRef.current !== null) {
      window.cancelAnimationFrame(openAnimationFrameRef.current);
    }

    openAnimationFrameRef.current = window.requestAnimationFrame(() => {
      setBalloonOpen(true);
    });
  };

  return (
    <div className="permissions">
      <h3>{t("overview.permissions.title")}</h3>
      <div>
        {app.app.pluginUrl && (
          <div
            onClick={(event) => handlePermissionClick(event, "pluginRequired")}
          >
            <ListItem>
              <Icon icon={Plug} color="selected" />
              {t("overview.permissions.pluginRequired.title")}
            </ListItem>
          </div>
        )}
        {app.app.permissions?.map((permission) => {
          const translationKey = mapPermissionToTranslationKey(permission);

          return (
            <div
              key={permission}
              onClick={(event) => handlePermissionClick(event, permission)}
            >
              <ListItem>
                {translationKey === "fullDiskAccess" ? (
                  <>
                    <Icon icon={HardDrive} color="selected" />
                    {t("overview.permissions.fullDiskAccess.title")}
                  </>
                ) : translationKey === "positionManipulation" ? (
                  <>
                    <Icon icon={Scaling} color="selected" />
                    {t("overview.permissions.positionManipulation.title")}
                  </>
                ) : translationKey === "microphoneAccess" ? (
                  <>
                    <Icon icon={Mic} color="selected" />
                    {t("overview.permissions.microphoneAccess.title")}
                  </>
                ) : translationKey === "cameraAccess" ? (
                  <>
                    <Icon icon={Video} color="selected" />
                    {t("overview.permissions.cameraAccess.title")}
                  </>
                ) : (
                  <>
                    <Icon icon={AppWindowMac} color="selected" />
                    {t("overview.permissions.spawnChildWindows.title")}
                  </>
                )}
              </ListItem>
            </div>
          );
        })}
      </div>
      {balloon && (
        <Balloon
          open={balloonOpen}
          x={balloon.x}
          y={balloon.y}
          className="permission-balloon"
          onMouseLeave={hideBalloon}
        >
          {balloon.description}
        </Balloon>
      )}
    </div>
  );
}

export default PermissionList;
