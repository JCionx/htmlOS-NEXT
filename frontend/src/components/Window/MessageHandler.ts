import type { RefObject } from "react";
import { runtime } from "../../runtimeConfig";

export interface MessageHandlerDependencies {
  id: string;
  iframeRef: RefObject<HTMLIFrameElement>;
  permissions: {
    positionManipulation: boolean;
    windowSpawning: boolean;
    cameraAccess: boolean;
    microphoneAccess: boolean;
    diskAccess: boolean;
  };
  isMaximized: boolean;
  currentHeight: number;
  currentWidth: number;
  rndRef: RefObject<any>;
  onSpawnWindow: (
    id: string,
    title: string,
    url: string,
    icon: string,
    defaultX: number,
    defaultY: number,
    borderless: boolean,
    defaultWidth: number,
    defaultHeight: number,
    minWidth: number,
    minHeight: number,
    maxWidth: number,
    maxHeight: number,
    allowResize: boolean,
    allowMaximize: boolean,
    permissions: any,
  ) => void;
  onOpenFile: (path: string, appId: string) => void;
  onClose: () => void;
  onMaximize: () => void;
  onRequestFilePicker: (formats: string[]) => void;
  setCurrentTitle: (title: string) => void;
  setCurrentXPosition: (x: number) => void;
  setCurrentYPosition: (y: number) => void;
  setCurrentWidth: (width: number) => void;
  setCurrentHeight: (height: number) => void;
  enableSizePositionAnimation: (enable: boolean) => void;
  requestTempUrl: (path: string) => Promise<string>;
  handleFilePick: (formats: string[]) => void;
  handleClose: () => void;
  onStartContinuity: (appId: string, data: Record<string, unknown>) => void;
  onDismissContinuity: (appId: string) => void;

  // ADD: settings + setters
  language: string;
  setLanguage: (lang: string) => void;
  timezone: string;
  setTimezone: (tz: string) => void;
  taskbarFloating: boolean;
  setTaskbarFloating: (floating: boolean) => void;
  taskbarEdges: boolean;
  setTaskbarEdges: (edges: boolean) => void;
  colorScheme: string;
  setColorScheme: (scheme: string) => void;
  twentyFourHourClock: boolean;
  setTwentyFourHourClock: (twentyFour: boolean) => void;
  showSeconds: boolean;
  setShowSeconds: (show: boolean) => void;
  showDeveloperOptions: boolean;
  setShowDeveloperOptions: (show: boolean) => void;
  showReloadButton: boolean;
  setShowReloadButton: (show: boolean) => void;
  showInspectButton: boolean;
  setShowInspectButton: (show: boolean) => void;
  wallpaper: string;
  setWallpaper: (wallpaper: string) => void;
}

function isValidFilePath(path: string): boolean {
  return (
    typeof path === "string" &&
    !path.includes("..") &&
    !path.startsWith("/") &&
    !path.startsWith("\\")
  );
}

async function fetchBackend(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(`${runtime.VITE_BACKEND_ADDRESS}${endpoint}`, {
    credentials: "include",
    ...options,
  });
  return response.json();
}

function postMessageToIframe(
  iframeRef: RefObject<HTMLIFrameElement>,
  message: any,
) {
  iframeRef.current?.contentWindow?.postMessage(message, "*");
}

function log(
  type: "message" | "error" | "warn",
  deps: MessageHandlerDependencies,
  ...args: any[]
) {
  switch (type) {
    case "message":
      console.log(
        `%c[MESSAGE FROM WINDOW]: ${deps.id}`,
        "color: gray; font-weight: bold; font-size: 14px",
        ...args,
      );
      break;
    case "error":
      console.error(
        `%c[ERROR FROM WINDOW]: ${deps.id}`,
        "color: red; font-weight: bold; font-size: 14px",
        ...args,
      );
      break;
    case "warn":
      console.warn(
        `%c[WARNING FROM WINDOW]: ${deps.id}`,
        "color: orange; font-weight: bold; font-size: 14px",
        ...args,
      );
      break;
  }
}

export function setupMessageHandler(deps: MessageHandlerDependencies) {
  const handleMessage = async (event: MessageEvent) => {
    if (event.source !== deps.iframeRef.current?.contentWindow) {
      return;
    }

    const messageData = event.data;
    log("message", deps, messageData);

    if (!messageData || typeof messageData !== "object") {
      return;
    }

    switch (messageData.type) {
      case "setTitle": // Set the title of the window
        if (typeof messageData.title === "string") {
          deps.setCurrentTitle(messageData.title);
        } else {
          log("warn", deps, "setTitle", "Invalid title.");
        }
        break;
      case "openFile":
        if (deps.permissions.diskAccess) {
          const { path, app } = messageData;
          if (typeof path === "string" && typeof app === "string") {
            deps.onOpenFile(path, app);
          } else {
            log("warn", deps, "openFile", "Invalid path or app.");
          }
        } else {
          log("warn", deps, "openFile", "Missing diskAccess permission.");
        }
        break;
      case "getFileApps":
        if (deps.permissions.diskAccess) {
          try {
            const data = await fetchBackend("/apps/filetypes");
            postMessageToIframe(deps.iframeRef, {
              type: "getFileApps",
              data,
            });
          } catch (e) {
            log("warn", deps, "getFileApps", "Failed to fetch file apps.");
          }
        } else {
          log("warn", deps, "getFileApps", "Missing diskAccess permission.");
        }
        break;
      case "setPosition":
        if (
          typeof messageData.position_x === "number" &&
          typeof messageData.position_y === "number" &&
          typeof messageData.animate === "boolean" &&
          deps.permissions.positionManipulation
        ) {
          if (deps.isMaximized) return;
          deps.setCurrentXPosition(messageData.position_x);
          deps.setCurrentYPosition(messageData.position_y);
          deps.rndRef.current?.updatePosition({
            x: messageData.position_x,
            y: messageData.position_y,
          });
          if (messageData.animate) {
            deps.enableSizePositionAnimation(true);
            setTimeout(() => {
              deps.enableSizePositionAnimation(false);
            }, 300);
          }
        } else {
          log(
            "warn",
            deps,
            "setPosition",
            "Missing positionManipulation permission or invalid data.",
          );
        }
        break;
      case "setXPosition":
        if (
          typeof messageData.position === "number" &&
          typeof messageData.animate === "boolean" &&
          deps.permissions.positionManipulation
        ) {
          if (deps.isMaximized) {
            return;
          }
          deps.setCurrentXPosition(messageData.position);
          deps.rndRef.current?.updatePosition({
            x: messageData.position,
            y: deps.rndRef.current?.getDraggablePosition().y,
          });
          if (messageData.animate) {
            deps.enableSizePositionAnimation(true);
            setTimeout(() => {
              deps.enableSizePositionAnimation(false);
            }, 300);
          }
        } else {
          log(
            "warn",
            deps,
            "setXPosition",
            "Missing positionManipulation permission or invalid data.",
          );
        }
        break;
      case "setYPosition":
        if (
          typeof messageData.position === "number" &&
          typeof messageData.animate === "boolean" &&
          deps.permissions.positionManipulation
        ) {
          if (deps.isMaximized) {
            return;
          }
          deps.setCurrentYPosition(messageData.position);
          deps.rndRef.current?.updatePosition({
            x: deps.rndRef.current?.getDraggablePosition().x,
            y: messageData.position,
          });
          if (messageData.animate) {
            deps.enableSizePositionAnimation(true);
            setTimeout(() => {
              deps.enableSizePositionAnimation(false);
            }, 300);
          }
        } else {
          log(
            "warn",
            deps,
            "setYPosition",
            "Missing positionManipulation permission or invalid data.",
          );
        }
        break;
      case "setSize":
        if (
          typeof messageData.width === "number" &&
          typeof messageData.height === "number" &&
          typeof messageData.animate === "boolean" &&
          deps.permissions.positionManipulation
        ) {
          if (deps.isMaximized) {
            return;
          }
          deps.setCurrentWidth(messageData.width);
          deps.setCurrentHeight(messageData.height);
          deps.rndRef.current?.updateSize({
            width: messageData.width,
            height: messageData.height,
          });
          if (messageData.animate) {
            deps.enableSizePositionAnimation(true);
            setTimeout(() => {
              deps.enableSizePositionAnimation(false);
            }, 300);
          }
        } else {
          log(
            "warn",
            deps,
            "setSize",
            "Missing positionManipulation permission or invalid data.",
          );
        }
        break;
      case "setWidth":
        if (
          typeof messageData.width === "number" &&
          typeof messageData.animate === "boolean" &&
          deps.permissions.positionManipulation
        ) {
          if (deps.isMaximized) {
            return;
          }
          deps.setCurrentWidth(messageData.width);
          deps.rndRef.current?.updateSize({
            width: messageData.width,
            height: deps.currentHeight,
          });
          if (messageData.animate) {
            deps.enableSizePositionAnimation(true);
            setTimeout(() => {
              deps.enableSizePositionAnimation(false);
            }, 300);
          }
        } else {
          log(
            "warn",
            deps,
            "setWidth",
            "Missing positionManipulation permission or invalid data.",
          );
        }
        break;
      case "setHeight":
        if (
          typeof messageData.height === "number" &&
          typeof messageData.animate === "boolean" &&
          deps.permissions.positionManipulation
        ) {
          if (deps.isMaximized) {
            return;
          }
          deps.setCurrentHeight(messageData.height);
          deps.rndRef.current?.updateSize({
            width: deps.currentWidth,
            height: messageData.height,
          });
          if (messageData.animate) {
            deps.enableSizePositionAnimation(true);
            setTimeout(() => {
              deps.enableSizePositionAnimation(false);
            }, 300);
          }
        } else {
          log(
            "warn",
            deps,
            "setHeight",
            "Missing positionManipulation permission or invalid data.",
          );
        }
        break;
      case "getPosition":
        if (deps.permissions.positionManipulation) {
          postMessageToIframe(deps.iframeRef, {
            type: "position",
            position: {
              x: deps.rndRef.current?.getDraggablePosition().x,
              y: deps.rndRef.current?.getDraggablePosition().y,
            },
          });
        } else {
          log(
            "warn",
            deps,
            "getPosition",
            "Missing positionManipulation permission.",
          );
        }
        break;
      case "spawnWindow":
        if (deps.permissions.windowSpawning) {
          deps.onSpawnWindow(
            messageData.id,
            messageData.title,
            messageData.url,
            messageData.icon,
            messageData.defaultX,
            messageData.defaultY,
            messageData.borderless,
            messageData.defaultWidth,
            messageData.defaultHeight,
            messageData.minWidth,
            messageData.minHeight,
            messageData.maxWidth,
            messageData.maxHeight,
            messageData.allowResize,
            messageData.allowMaximize,
            deps.permissions,
          );
        } else {
          log(
            "warn",
            deps,
            "spawnWindow",
            "Missing windowSpawning permission.",
          );
        }
        break;
      case "quit":
        if (deps.permissions.positionManipulation) {
          deps.handleClose();
        } else {
          log("warn", deps, "quit", "Missing positionManipulation permission.");
        }
        break;
      case "toggleMaximize":
        if (deps.permissions.positionManipulation) {
          deps.onMaximize();
        } else {
          log(
            "warn",
            deps,
            "toggleMaximize",
            "Missing positionManipulation permission.",
          );
        }
        break;
      case "loadFile":
        if (messageData.path && deps.permissions.diskAccess) {
          try {
            const url = await deps.requestTempUrl(messageData.path);
            postMessageToIframe(deps.iframeRef, {
              type: "file",
              url,
            });
          } catch (err) {
            log("error", deps, "loadFile", "Failed to load file.");
          }
        } else {
          log("warn", deps, "loadFile", "Missing diskAccess permission.");
        }
        break;
      case "listDirectory":
        if (deps.permissions.diskAccess) {
          try {
            const data = await fetchBackend("/data/list", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ path: messageData.path || "" }),
            });
            postMessageToIframe(deps.iframeRef, {
              type: "directoryListing",
              contents: data,
            });
          } catch (err) {
            log("error", deps, "listDirectory", "Failed to list directory.");
          }
        } else {
          log("warn", deps, "listDirectory", "Missing diskAccess permission.");
        }
        break;
      case "deleteFile":
        if (deps.permissions.diskAccess && messageData.path) {
          if (!isValidFilePath(messageData.path)) {
            log("warn", deps, "deleteFile", "Invalid path.");
            return;
          }

          try {
            await fetchBackend("/data/delete", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ path: messageData.path }),
            });
            postMessageToIframe(deps.iframeRef, {
              type: "deleteSuccess",
              path: messageData.path,
            });
          } catch (err) {
            log("error", deps, "deleteFile", "Failed to delete file.", err);
            postMessageToIframe(deps.iframeRef, {
              type: "deleteError",
              path: messageData.path,
              error: err instanceof Error ? err.message : String(err),
            });
          }
        } else {
          log(
            "warn",
            deps,
            "deleteFile",
            "Missing diskAccess permission or invalid path.",
          );
        }
        break;
      case "createDirectory":
        if (deps.permissions.diskAccess && messageData.path) {
          if (!isValidFilePath(messageData.path)) {
            log("warn", deps, "createDirectory", "Invalid path.");
            return;
          }
          try {
            await fetchBackend("/data/create-folder", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ path: messageData.path }),
            });
            postMessageToIframe(deps.iframeRef, {
              type: "createDirectorySuccess",
              path: messageData.path,
            });
          } catch (err) {
            log(
              "error",
              deps,
              "createDirectory",
              "Failed to create directory.",
              err,
            );
            postMessageToIframe(deps.iframeRef, {
              type: "createDirectoryError",
              path: messageData.path,
              error: err instanceof Error ? err.message : String(err),
            });
          }
        } else {
          log(
            "warn",
            deps,
            "createDirectory",
            "Missing diskAccess permission or invalid path.",
          );
        }
        break;
      case "moveFile":
        if (
          deps.permissions.diskAccess &&
          messageData.oldPath &&
          messageData.newPath
        ) {
          try {
            await fetchBackend("/data/move", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                oldPath: messageData.oldPath,
                newPath: messageData.newPath,
              }),
            });
            postMessageToIframe(deps.iframeRef, {
              type: "moveSuccess",
              oldPath: messageData.oldPath,
              newPath: messageData.newPath,
            });
          } catch (err) {
            log("error", deps, "moveFile", "Failed to move file.", err);
            postMessageToIframe(deps.iframeRef, {
              type: "moveError",
              oldPath: messageData.oldPath,
              newPath: messageData.newPath,
              error: err instanceof Error ? err.message : String(err),
            });
          }
        } else {
          log(
            "warn",
            deps,
            "moveFile",
            "Missing diskAccess permission or invalid path.",
          );
        }
        break;
      case "copyFile":
        if (
          deps.permissions.diskAccess &&
          messageData.oldPath &&
          messageData.newPath
        ) {
          try {
            await fetchBackend("/data/copy", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                oldPath: messageData.oldPath,
                newPath: messageData.newPath,
              }),
            });
            postMessageToIframe(deps.iframeRef, {
              type: "copySuccess",
              oldPath: messageData.oldPath,
              newPath: messageData.newPath,
            });
          } catch (err) {
            log("error", deps, "copyFile", "Failed to copy file.", err);
            postMessageToIframe(deps.iframeRef, {
              type: "copyError",
              oldPath: messageData.oldPath,
              newPath: messageData.newPath,
              error: err instanceof Error ? err.message : String(err),
            });
          }
        } else {
          log(
            "warn",
            deps,
            "copyFile",
            "Missing diskAccess permission or invalid path.",
          );
        }
        break;
      case "uploadFile":
        if (
          deps.permissions.diskAccess &&
          messageData.path &&
          messageData.file instanceof File
        ) {
          const xhr = new XMLHttpRequest();
          const formData = new FormData();
          formData.append("file", messageData.file);
          formData.append("path", messageData.path);

          xhr.open("POST", `${runtime.VITE_BACKEND_ADDRESS}/data/upload`, true);
          xhr.withCredentials = true;

          xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
              const percentComplete = (event.loaded / event.total) * 100;
              postMessageToIframe(deps.iframeRef, {
                type: "uploadProgress",
                path: messageData.path,
                progress: percentComplete,
              });
            }
          };

          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              postMessageToIframe(deps.iframeRef, {
                type: "uploadSuccess",
                path: messageData.path,
              });
            } else {
              log(
                "error",
                deps,
                "uploadFile",
                `Upload failed with status: ${xhr.status}`,
                xhr.responseText,
              );
              postMessageToIframe(deps.iframeRef, {
                type: "uploadError",
                path: messageData.path,
                error: `Upload failed: ${xhr.status} ${xhr.statusText}`,
              });
            }
          };

          xhr.onerror = () => {
            log("error", deps, "uploadFile", "Network error during upload");
            postMessageToIframe(deps.iframeRef, {
              type: "uploadError",
              path: messageData.path,
              error: "Network error during upload",
            });
          };

          xhr.send(formData);
        } else {
          log(
            "warn",
            deps,
            "uploadFile",
            "Missing diskAccess permission or invalid path.",
          );
        }
        break;
      case "downloadFolder":
        if (deps.permissions.diskAccess && messageData.path) {
          try {
            const data = await fetchBackend("/data/download-folder", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                path: messageData.path,
              }),
            });
            if (data.url) {
              postMessageToIframe(deps.iframeRef, {
                type: "downloadFolderSuccess",
                url: `${runtime.VITE_BACKEND_ADDRESS}${data.url}`,
              });
            } else {
              throw new Error(data.error || "Failed to download folder");
            }
          } catch (err) {
            log(
              "error",
              deps,
              "downloadFolder",
              "Failed to download folder.",
              err,
            );
            postMessageToIframe(deps.iframeRef, {
              type: "downloadFolderError",
              path: messageData.path,
              error: err instanceof Error ? err.message : String(err),
            });
          }
        } else {
          log(
            "warn",
            deps,
            "downloadFolder",
            "Missing diskAccess permission or invalid path.",
          );
        }
        break;
      case "saveFile":
        if (
          deps.permissions.diskAccess &&
          messageData.path &&
          typeof messageData.content !== "undefined"
        ) {
          try {
            await fetchBackend("/data/save", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                path: messageData.path,
                content: messageData.content,
                encoding: messageData.encoding,
              }),
            });
            postMessageToIframe(deps.iframeRef, {
              type: "saveSuccess",
              path: messageData.path,
            });
          } catch (err) {
            log("error", deps, "saveFile", "Failed to save file.", err);
            postMessageToIframe(deps.iframeRef, {
              type: "saveError",
              path: messageData.path,
              error: err instanceof Error ? err.message : String(err),
            });
          }
        } else {
          log(
            "warn",
            deps,
            "saveFile",
            "Missing diskAccess permission or invalid path.",
          );
        }
        break;
      case "selectFile":
        deps.handleFilePick(messageData.formats || []);
        break;
      case "startContinuity":
        if (
          typeof messageData.data !== "object" ||
          messageData.data === null ||
          Array.isArray(messageData.data)
        ) {
          log("warn", deps, "startContinuity", "data must be an object.");
          break;
        }

        deps.onStartContinuity(deps.id, messageData.data);
        break;
      case "dismissContinuity":
        deps.onDismissContinuity(deps.id);
        break;
      case "loadInternalFile":
        if (messageData.path && isValidFilePath(messageData.path)) {
          try {
            const url = await deps.requestTempUrl(
              `config/${deps.id}/${messageData.path}`,
            );
            postMessageToIframe(deps.iframeRef, { type: "file", url });
          } catch (err) {
            log("error", deps, "loadInternalFile", "Failed to load file.", err);
          }
        } else {
          log("warn", deps, "loadInternalFile", "Invalid path.");
        }
        break;
      case "saveInternalFile":
        if (
          messageData.path &&
          isValidFilePath(messageData.path) &&
          typeof messageData.content !== "undefined"
        ) {
          try {
            log(
              "message",
              deps,
              "saveInternalFile",
              "Saving file:",
              messageData.path,
            );
            await fetchBackend("/data/save", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                path: `config/${deps.id}/${messageData.path}`,
                content: messageData.content,
                encoding: messageData.encoding,
              }),
            });
            log("message", deps, "saveInternalFile", "File saved successfully");
            postMessageToIframe(deps.iframeRef, {
              type: "saveSuccess",
              path: messageData.path,
            });
          } catch (err) {
            log("error", deps, "saveInternalFile", "Failed to save file.", err);
            postMessageToIframe(deps.iframeRef, {
              type: "saveError",
              path: messageData.path,
              error: err instanceof Error ? err.message : String(err),
            });
          }
        } else {
          log("warn", deps, "saveInternalFile", "Invalid path.");
        }
        break;
      case "moveInternalFile":
        if (
          messageData.oldPath &&
          messageData.newPath &&
          isValidFilePath(messageData.oldPath) &&
          isValidFilePath(messageData.newPath)
        ) {
          try {
            await fetchBackend("/data/move", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                oldPath: `config/${deps.id}/${messageData.oldPath}`,
                newPath: `config/${deps.id}/${messageData.newPath}`,
              }),
            });
            postMessageToIframe(deps.iframeRef, {
              type: "moveSuccess",
              oldPath: messageData.oldPath,
              newPath: messageData.newPath,
            });
          } catch (err) {
            log("error", deps, "moveInternalFile", "Failed to move file.", err);
            postMessageToIframe(deps.iframeRef, {
              type: "moveError",
              oldPath: messageData.oldPath,
              newPath: messageData.newPath,
              error: err instanceof Error ? err.message : String(err),
            });
          }
        } else {
          log("warn", deps, "moveInternalFile", "Invalid path.");
        }
        break;
      case "deleteInternalFile":
        if (messageData.path && isValidFilePath(messageData.path)) {
          try {
            await fetchBackend("/data/delete", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                path: `config/${deps.id}/${messageData.path}`,
              }),
            });
            postMessageToIframe(deps.iframeRef, {
              type: "deleteSuccess",
              path: messageData.path,
            });
          } catch (err) {
            log(
              "error",
              deps,
              "deleteInternalFile",
              "Failed to delete file.",
              err,
            );
            postMessageToIframe(deps.iframeRef, {
              type: "deleteError",
              path: messageData.path,
              error: err instanceof Error ? err.message : String(err),
            });
          }
        } else {
          log("warn", deps, "deleteInternalFile", "Invalid path.");
        }
        break;
      case "createInternalDirectory":
        if (messageData.path && isValidFilePath(messageData.path)) {
          try {
            await fetchBackend("/data/create-folder", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                path: `config/${deps.id}/${messageData.path}`,
              }),
            });
            postMessageToIframe(deps.iframeRef, {
              type: "createDirectorySuccess",
              path: messageData.path,
            });
          } catch (err) {
            log(
              "error",
              deps,
              "createInternalDirectory",
              "Failed to create directory.",
              err,
            );
            postMessageToIframe(deps.iframeRef, {
              type: "createDirectoryError",
              path: messageData.path,
              error: err instanceof Error ? err.message : String(err),
            });
          }
        } else {
          log("warn", deps, "createInternalDirectory", "Invalid path.");
        }
        break;
      case "listInternalDirectory":
        if (
          typeof messageData.path === "string" &&
          isValidFilePath(messageData.path)
        ) {
          try {
            const data = await fetchBackend("/data/list", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                path: `config/${deps.id}/${messageData.path}`,
              }),
            });
            postMessageToIframe(deps.iframeRef, {
              type: "directoryListing",
              contents: data,
            });
          } catch (err) {
            log(
              "error",
              deps,
              "listInternalDirectory",
              "Failed to list directory.",
              err,
            );
          }
        } else {
          log("warn", deps, "listInternalDirectory", "Invalid path.");
        }
        break;
      case "installApp":
        if (deps.id === "sys.next.appstore" || deps.id === "sys.next.browser") {
          try {
            const data = await fetchBackend("/apps/install", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                app: messageData.app,
                packageUrl: messageData.app.packageUrl,
                callerAppId: deps.id,
              }),
            });
            if (data.success) {
              postMessageToIframe(deps.iframeRef, {
                type: "appInstallSuccess",
                appId: messageData.app.id,
              });
            } else {
              throw new Error(data.error || "Installation failed");
            }
          } catch (err) {
            log("error", deps, "installApp", "Failed to install app.", err);
            postMessageToIframe(deps.iframeRef, {
              type: "appInstallFailed",
              error: err instanceof Error ? err.message : String(err),
            });
          }
        } else {
          log(
            "warn",
            deps,
            "installApp",
            "Unauthorized app attempted to install an app.",
          );
        }
        break;
      case "changeSetting":
        if (deps.id === "sys.next.settings") {
          // pass
          if (messageData.setting && typeof messageData.value !== "undefined") {
            switch (messageData.setting) {
              case "language":
                deps.setLanguage(String(messageData.value));
                break;
              case "timezone":
                deps.setTimezone(String(messageData.value));
                break;
              case "taskbarStyle":
                if (messageData.value === "floating") {
                  deps.setTaskbarFloating(true);
                } else if (messageData.value === "expanded") {
                  deps.setTaskbarFloating(false);
                }
                break;
              case "taskbarAlignment":
                if (messageData.value === "edges") {
                  deps.setTaskbarEdges(true);
                } else if (messageData.value === "center") {
                  deps.setTaskbarEdges(false);
                }
                break;
              case "colorScheme":
                if (["light", "dark", "system"].includes(messageData.value)) {
                  deps.setColorScheme(messageData.value);
                }
                break;
              case "twentyFourHourClock":
                if (messageData.value === "true") {
                  deps.setTwentyFourHourClock(true);
                } else if (messageData.value === "false") {
                  deps.setTwentyFourHourClock(false);
                }
                break;
              case "showSeconds":
                if (messageData.value === "true") {
                  deps.setShowSeconds(true);
                } else if (messageData.value === "false") {
                  deps.setShowSeconds(false);
                }
                break;
              case "showDeveloperOptions":
                if (messageData.value === "true") {
                  deps.setShowDeveloperOptions(true);
                } else if (messageData.value === "false") {
                  deps.setShowDeveloperOptions(false);
                }
                break;
              case "showReloadButton":
                if (messageData.value === "true") {
                  deps.setShowReloadButton(true);
                } else if (messageData.value === "false") {
                  deps.setShowReloadButton(false);
                }
                break;
              case "showInspectButton":
                if (messageData.value === "true") {
                  deps.setShowInspectButton(true);
                } else if (messageData.value === "false") {
                  deps.setShowInspectButton(false);
                }
                break;
              case "wallpaper":
                if (typeof messageData.value === "string") {
                  deps.setWallpaper(messageData.value);
                }
                break;
              default:
                log(
                  "warn",
                  deps,
                  "changeSetting",
                  "Unknown setting change request.",
                );
            }
          }
        } else {
          log(
            "warn",
            deps,
            "changeSetting",
            "Unauthorized app attempted to change a setting.",
          );
        }
        break;
      case "getSettings": {
        if (deps.id === "sys.next.settings") {
          postMessageToIframe(deps.iframeRef, {
            type: "settings",
            settings: {
              language: deps.language,
              timezone: deps.timezone,
              taskbarAlignment: deps.taskbarEdges ? "edges" : "center",
              taskbarStyle: deps.taskbarFloating ? "floating" : "expanded",
              colorScheme: deps.colorScheme,
              twentyFourHourClock: deps.twentyFourHourClock ? "true" : "false",
              showSeconds: deps.showSeconds ? "true" : "false",
              showDeveloperOptions: deps.showDeveloperOptions
                ? "true"
                : "false",
              showReloadButton: deps.showReloadButton ? "true" : "false",
              showInspectButton: deps.showInspectButton ? "true" : "false",
              wallpaper: deps.wallpaper,
            },
          });
        } else {
          log(
            "warn",
            deps,
            "getSettings",
            "Unauthorized app attempted to get settings.",
          );
        }
        break;
      }
      case "getInstalledApps": {
        if (deps.id === "sys.next.settings") {
          try {
            const data = await fetchBackend("/apps/list");
            // Filter out system apps and format the response
            const userApps = data
              .filter((app: any) => !app.id.startsWith("sys."))
              .map((app: any) => ({
                id: app.id,
                name: app.locale?.[deps.language] ?? app.name,
                icon: `${runtime.VITE_BACKEND_ADDRESS}/apps/run/${app.id}/${app.icon_path}`,
                version: app.version,
              }));
            postMessageToIframe(deps.iframeRef, {
              type: "installedApps",
              apps: userApps,
            });
          } catch (err) {
            log(
              "error",
              deps,
              "getInstalledApps",
              "Failed to fetch apps.",
              err,
            );
            postMessageToIframe(deps.iframeRef, {
              type: "installedAppsError",
              error: err instanceof Error ? err.message : String(err),
            });
          }
        } else {
          log(
            "warn",
            deps,
            "getInstalledApps",
            "Unauthorized app attempted to get installed apps.",
          );
        }
        break;
      }
      case "uninstallApp": {
        if (deps.id === "sys.next.settings") {
          if (typeof messageData.appId === "string") {
            try {
              const response = await fetchBackend("/apps/uninstall", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ appId: messageData.appId }),
              });

              if (response.success) {
                postMessageToIframe(deps.iframeRef, {
                  type: "uninstallSuccess",
                  appId: messageData.appId,
                });
                // Notify the system to refresh the app list
                window.postMessage({ type: "refreshAppList" }, "*");
              } else {
                throw new Error(response.error || "Uninstallation failed");
              }
            } catch (err) {
              log(
                "error",
                deps,
                "uninstallApp",
                "Failed to uninstall app.",
                err,
              );
              postMessageToIframe(deps.iframeRef, {
                type: "uninstallError",
                appId: messageData.appId,
                error: err instanceof Error ? err.message : String(err),
              });
            }
          } else {
            log("warn", deps, "uninstallApp", "Invalid appId.");
          }
        } else {
          log(
            "warn",
            deps,
            "uninstallApp",
            "Unauthorized app attempted to uninstall an app.",
          );
        }
        break;
      }
    }
  };

  window.addEventListener("message", handleMessage);

  return () => {
    window.removeEventListener("message", handleMessage);
  };
}
