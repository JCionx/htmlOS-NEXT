import { sendMessage, listenForOnce } from "./api_utils";

export interface SpawnWindowConfig {
  id: string;
  title: string;
  url: string;
  icon?: string;
  defaultX?: number;
  defaultY?: number;
  borderless?: boolean;
  defaultWidth?: number;
  defaultHeight?: number;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
  allowResize?: boolean;
  allowMaximize?: boolean;
}

export interface Position {
  x: number;
  y: number;
}

export interface AppInstallConfig {
  id: string;
  name: string;
  version: string;
  packageUrl: string;
  entryPoint: string;
  iconPath: string;
  [key: string]: any; // To allow extra properties like allowResize, permissions, etc.
}

// --- WINDOW MANAGEMENT ---

export function changeParentWindowTitle(newTitle: string): void {
  sendMessage("setTitle", { title: newTitle });
}

export function setPosition(
  position_x: number,
  position_y: number,
  animate = true,
): void {
  sendMessage("setPosition", { position_x, position_y, animate });
}

export function setXPosition(position: number, animate = true): void {
  sendMessage("setXPosition", { position, animate });
}

export function setYPosition(position: number, animate = true): void {
  sendMessage("setYPosition", { position, animate });
}

export function setWidth(width: number, animate = true): void {
  sendMessage("setWidth", { width, animate });
}

export function setHeight(height: number, animate = true): void {
  sendMessage("setHeight", { height, animate });
}

export function setSize(width: number, height: number, animate = true): void {
  sendMessage("setSize", { width, height, animate });
}

export async function getPosition(): Promise<Position> {
  sendMessage("getPosition", {});
  const data = await listenForOnce("position");
  return data.position as Position;
}

export function spawnWindow(config: SpawnWindowConfig): void {
  sendMessage("spawnWindow", config);
}

export function quit(): void {
  sendMessage("quit", {});
}

export function toggleMaximize(): void {
  sendMessage("toggleMaximize", {});
}

// --- SCREEN/WINDOW GETTERS ---

export const getScreenWidth = (): number => window.outerWidth;
export const getScreenHeight = (): number => window.outerHeight;
export const getWindowWidth = (): number => window.innerWidth;
export const getWindowHeight = (): number => window.innerHeight;

// --- FILE & DIRECTORY OPERATIONS ---

export async function loadFile(path: string): Promise<string> {
  sendMessage("loadFile", { path });
  const data = await listenForOnce("file");
  return data.url;
}

export async function selectFile(formats: string[]): Promise<string | null> {
  sendMessage("selectFile", { formats });
  const data = await listenForOnce("file");
  return data.url === "cancel" ? null : data.url;
}

export async function loadInternalFile(path: string): Promise<string> {
  sendMessage("loadInternalFile", { path });
  const data = await listenForOnce("file");
  return data.url;
}

export async function loadInternalFileAsText(
  path: string,
): Promise<string | undefined> {
  const url = await loadInternalFile(path);
  if (!url) return undefined;

  try {
    const response = await fetch(url);
    if (response.ok) return await response.text();
    console.error("Failed to fetch internal file:", response.statusText);
  } catch (err) {
    console.error("Error fetching internal file:", err);
  }
}

// Helper for file operations that require path-matching to verify success
const createPathMatchedPromise = (
  path: string,
  successType: string,
  errorType: string,
  pathKey: string = "path",
): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    const handler = (e: MessageEvent) => {
      const data = e.data;
      if (data?.type === successType && data[pathKey] === path) {
        window.removeEventListener("message", handler);
        resolve(true);
      } else if (data?.type === errorType && data[pathKey] === path) {
        window.removeEventListener("message", handler);
        reject(new Error(data.error || "Unknown error occurred"));
      }
    };
    window.addEventListener("message", handler);
  });
};

export async function saveInternalFile(
  path: string,
  content: any,
): Promise<boolean> {
  sendMessage("saveInternalFile", { path, content });
  return createPathMatchedPromise(path, "saveSuccess", "saveError");
}

export async function deleteInternalFile(path: string): Promise<boolean> {
  sendMessage("deleteInternalFile", { path });
  return createPathMatchedPromise(path, "deleteSuccess", "deleteError");
}

export async function moveInternalFile(
  oldPath: string,
  newPath: string,
): Promise<boolean> {
  sendMessage("moveInternalFile", { oldPath, newPath });
  return createPathMatchedPromise(
    oldPath,
    "moveSuccess",
    "moveError",
    "oldPath",
  );
}

export async function listInternalDirectory(path: string): Promise<any[]> {
  sendMessage("listInternalDirectory", { path });
  const data = await listenForOnce("directoryListing");
  return data.contents;
}

// --- GENERAL STORAGE (from TS file) ---

export async function listFiles(path: string): Promise<any[]> {
  sendMessage("listDirectory", { path });
  const data = await listenForOnce("directoryListing");
  return data.contents;
}

export async function deleteFile(path: string): Promise<boolean> {
  sendMessage("deleteFile", { path });
  return createPathMatchedPromise(path, "deleteSuccess", "deleteError");
}

export async function createFolder(path: string): Promise<boolean> {
  sendMessage("createDirectory", { path });
  return createPathMatchedPromise(
    path,
    "createDirectorySuccess",
    "createDirectoryError",
  );
}

export async function moveFile(
  oldPath: string,
  newPath: string,
): Promise<boolean> {
  sendMessage("moveFile", { oldPath, newPath });
  return createPathMatchedPromise(
    oldPath,
    "moveSuccess",
    "moveError",
    "oldPath",
  );
}

export async function copyFile(
  oldPath: string,
  newPath: string,
): Promise<boolean> {
  sendMessage("copyFile", { oldPath, newPath });
  return createPathMatchedPromise(
    oldPath,
    "copySuccess",
    "copyError",
    "oldPath",
  );
}

export async function saveFile(
  path: string,
  content: string,
  encoding: "utf8" | "base64" = "utf8",
): Promise<boolean> {
  sendMessage("saveFile", { path, content, encoding });
  return createPathMatchedPromise(path, "saveSuccess", "saveError");
}

export async function getDownloadUrl(path: string): Promise<string> {
  sendMessage("loadFile", { path });
  const data = await listenForOnce("file");
  return data.url + "?download=true";
}

export async function downloadFolder(path: string): Promise<string> {
  sendMessage("downloadFolder", { path });
  const data = await listenForOnce("downloadFolderSuccess");
  return data.url;
}

export async function uploadFile(
  path: string,
  file: File,
  onProgress?: (percent: number) => void,
): Promise<boolean> {
  sendMessage("uploadFile", { path, file });
  return new Promise((resolve, reject) => {
    const handler = (e: MessageEvent) => {
      const data = e.data;
      if (data?.type === "uploadSuccess" && data.path === path) {
        window.removeEventListener("message", handler);
        resolve(true);
      } else if (data?.type === "uploadError" && data.path === path) {
        window.removeEventListener("message", handler);
        reject(new Error(data.error));
      } else if (data?.type === "uploadProgress" && data.path === path) {
        onProgress?.(data.progress);
      }
    };
    window.addEventListener("message", handler);
  });
}

// --- SYSTEM / APP MANAGEMENT ---

export async function installApp(
  appConfig: AppInstallConfig,
  packageUrl: string,
): Promise<boolean> {
  sendMessage("installApp", { app: appConfig, packageUrl });

  return new Promise((resolve, reject) => {
    const handler = (event: MessageEvent) => {
      const data = event.data;
      if (data?.type === "appInstallSuccess") {
        window.removeEventListener("message", handler);
        resolve(true);
      } else if (data?.type === "appInstallFailed") {
        window.removeEventListener("message", handler);
        reject(new Error("App installation failed"));
      }
    };

    window.addEventListener("message", handler);

    // Built-in 30 second timeout so the promise doesn't hang forever
    setTimeout(() => {
      window.removeEventListener("message", handler);
      reject(new Error("App installation timed out"));
    }, 30000);
  });
}

export function refreshAppList(): void {
  sendMessage("refreshAppList", {});
}

// --- SETTINGS & SYSTEM CONFIG ---

export function changeSetting(setting: string, value: string | boolean): void {
  sendMessage("changeSetting", { setting, value });
}

export async function getSettings(): Promise<any> {
  sendMessage("getSettings", {});
  const data = await listenForOnce("settings");
  return data.settings;
}

export async function getInstalledApps(): Promise<any[]> {
  sendMessage("getInstalledApps", {});
  return new Promise((resolve, reject) => {
    const handler = (event: MessageEvent) => {
      const data = event.data;
      if (data?.type === "installedApps") {
        window.removeEventListener("message", handler);
        resolve(data.apps);
      } else if (data?.type === "installedAppsError") {
        window.removeEventListener("message", handler);
        reject(new Error(data.error));
      }
    };
    window.addEventListener("message", handler);
  });
}

export async function uninstallApp(appId: string): Promise<boolean> {
  sendMessage("uninstallApp", { appId });
  return createPathMatchedPromise(
    appId,
    "uninstallSuccess",
    "uninstallError",
    "appId",
  );
}

// --- HTTP BACKEND CALLS ---

const getBackendAddress = () =>
  window.location.hostname === "localhost"
    ? "http://localhost:3000"
    : window.location.origin;

export async function getFileTypes(): Promise<any> {
  const response = await fetch(`${getBackendAddress()}/apps/filetypes`, {
    credentials: "include",
  });
  if (!response.ok) throw new Error("Failed to fetch filetypes");
  return response.json();
}

export async function setDefaultApp(
  filetype: string,
  appId: string,
): Promise<any> {
  const response = await fetch(
    `${getBackendAddress()}/apps/filetypes/set-default`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filetype, appId }),
      credentials: "include",
    },
  );
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || "Failed to set default app");
  }
  return response.json();
}

export async function getInstalledAppsList(): Promise<any[]> {
  const response = await fetch(`${getBackendAddress()}/apps/list`, {
    credentials: "include",
  });
  if (!response.ok) throw new Error("Failed to fetch apps list");
  return response.json();
}

export async function getCurrentUser(): Promise<any> {
  const response = await fetch(`${getBackendAddress()}/auth/user`, {
    credentials: "include",
  });
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || "Failed to fetch user");
  }
  return response.json();
}

export async function changeUsername(newUsername: string): Promise<any> {
  const response = await fetch(`${getBackendAddress()}/auth/change-username`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ newUsername }),
    credentials: "include",
  });
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || "Failed to change username");
  }
  return response.json();
}

export async function changePassword(
  currentPassword: string,
  newPassword: string,
): Promise<any> {
  const response = await fetch(`${getBackendAddress()}/auth/change-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ currentPassword, newPassword }),
    credentials: "include",
  });
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || "Failed to change password");
  }
  return response.json();
}

export async function uploadWallpaper(
  file: File,
): Promise<{ success: boolean; wallpaper: string }> {
  if (!file) throw new Error("No file provided");

  const arrayBuffer = await file.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);
  let binary = "";
  for (let i = 0; i < uint8Array.length; i++) {
    binary += String.fromCharCode(uint8Array[i]);
  }
  const base64Content = btoa(binary);
  const filename = `${Date.now()}_${file.name}`;

  sendMessage("saveInternalFile", {
    path: `wallpapers/${filename}`,
    content: base64Content,
    encoding: "base64",
  });

  await createPathMatchedPromise(
    `wallpapers/${filename}`,
    "saveSuccess",
    "saveError",
  );

  return { success: true, wallpaper: filename };
}

export async function deleteWallpaper(
  filename: string,
): Promise<{ success: boolean }> {
  if (!filename) throw new Error("No filename provided");
  await deleteInternalFile(`wallpapers/${filename}`);
  return { success: true };
}
