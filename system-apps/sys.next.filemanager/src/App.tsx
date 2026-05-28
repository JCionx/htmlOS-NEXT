import { useState, useEffect, useLayoutEffect, useRef } from "react";
import styles from "./App.module.css";
import * as api from "@htmlos-next/api";
import {
  //FolderPlus,
  ArrowUp,
  Upload,
  ClipboardPaste,
  FileUp,
  FolderUp,
  House,
  FileIcon,
  Download,
  LayoutGrid,
  Music,
  Clapperboard,
  Image,
  TextCursor,
  Copy,
  Scissors,
  Trash,
  FolderIcon,
} from "lucide-react";

import {
  Toolbar,
  ToolbarActions,
  ToolbarButton,
  ToolbarTitle,
  Popup,
  PopupActions,
  PopupInput,
  PopupButton,
  PopupTitle,
  PopupDescription,
  ContextMenu,
  SidebarItem,
  Sidebar,
  SidebarTitle,
  ToolbarExpandSidebarButton,
  Content,
  AppShell,
  ListItem,
  Icon,
  EmptyView,
} from "@htmlos-next/ui";

import {
  FolderPlus,
  //Trash,
  //TextCursor
} from "lucide-react";

import i18n from "./i18n";
import { useTranslation } from "react-i18next";

interface FileEntry {
  name: string;
  isDirectory: boolean;
}

function App() {
  const [isMobile, setIsMobile] = useState(false);
  const [currentPath, setCurrentPath] = useState("/");
  const [entries, setEntries] = useState<FileEntry[]>([]);
  const [_loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [itemContextMenuOpen, setItemContextMenuOpen] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({
    x: 0,
    y: 0,
  });
  const [contextMenuItemIsDirectory, setContextMenuItemIsDirectory] =
    useState(false);
  const [contextMenuItemPath, setContextMenuItemPath] = useState("");

  // Popups
  const [newFolderPopupOpen, setNewFolderPopupOpen] = useState(false);
  const [renamePopupOpen, setRenamePopupOpen] = useState(false);
  const [deletePopupOpen, setDeletePopupOpen] = useState(false);

  const [inputValue, setInputValue] = useState("");

  const closePopups = () => {
    setNewFolderPopupOpen(false);
    setRenamePopupOpen(false);
    setDeletePopupOpen(false);
    setInputValue("");
  };

  useEffect(() => {
    const handleGlobalClick = () => {
      if (itemContextMenuOpen) {
        setItemContextMenuOpen(false);
      }
    };

    window.addEventListener("click", handleGlobalClick);

    return () => window.removeEventListener("click", handleGlobalClick);
  }, [itemContextMenuOpen]);

  const handleNavigation = (path: string) => {
    setCurrentPath(path);
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  const [targetItem, setTargetItem] = useState<string | null>(null);

  const [uploadContextMenuOpen, setUploadContextMenuOpen] = useState(false);

  useEffect(() => {
    const handleGlobalClick = () => {
      if (uploadContextMenuOpen) {
        setUploadContextMenuOpen(false);
      }
    };

    window.addEventListener("click", handleGlobalClick);

    return () => window.removeEventListener("click", handleGlobalClick);
  }, [uploadContextMenuOpen]);

  // Clipboard for Copy/Paste
  const [clipboard, setClipboard] = useState<{
    path: string;
    op: "copy" | "move";
  } | null>(null);

  // Upload Progress
  const [uploadState, setUploadState] = useState<{
    uploading: boolean;
    progress: number;
    filename: string;
  }>({ uploading: false, progress: 0, filename: "" });

  const [fileApps, setFileApps] = useState<any>({});

  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data && e.data.type === "getFileApps") {
        setFileApps(e.data.data);
      }
    };
    window.addEventListener("message", handler);
    window.parent.postMessage({ type: "getFileApps" }, "*");
    return () => window.removeEventListener("message", handler);
  }, []);

  function handleFileClick(path: string, name: string) {
    const ext = name.split(".").pop()?.toLowerCase();
    if (ext && fileApps[ext]) {
      const defaultApp = fileApps[ext].find((a: any) => a.default);
      if (defaultApp) {
        const backendPath = path;
        window.parent.postMessage(
          {
            type: "openFile",
            path: backendPath,
            app: defaultApp.app,
          },
          "*",
        );
      }
    }
  }

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

  async function listFiles(path: string) {
    setLoading(true);
    try {
      const backendPath = path.startsWith("/") ? path.slice(1) : path;
      const data = await api.listFiles(backendPath);
      if (Array.isArray(data)) {
        setEntries(data);
      } else {
        setEntries([]);
      }
    } catch (e) {
      console.error(e);
      setEntries([]);
    }
    setLoading(false);
  }

  useEffect(() => {
    listFiles(currentPath);
  }, [currentPath]);

  function handleFolderClick(folderName: string) {
    setCurrentPath((prev) =>
      prev === "/" ? `/${folderName}` : `${prev}/${folderName}`,
    );
  }

  function handleBack() {
    if (currentPath === "/") return;
    const parts = currentPath.split("/").filter(Boolean);
    parts.pop();
    setCurrentPath(parts.length ? `/${parts.join("/")}` : "/");
  }

  const handleDelete = async (path: string) => {
    // Instead of confirm(), define target and open popup
    setTargetItem(path);
    setDeletePopupOpen(true);
  };

  const confirmDelete = async () => {
    if (!targetItem) return;
    const backendPath = targetItem.startsWith("/")
      ? targetItem.slice(1)
      : targetItem;

    try {
      await api.deleteFile(backendPath);
      listFiles(currentPath);
    } catch (e) {
      alert("Failed to delete");
    } finally {
      setDeletePopupOpen(false);
      setTargetItem(null);
    }
  };

  const handleCreateFolder = async (name: string) => {
    if (!name) return;
    const newPath = (currentPath === "/" ? "" : currentPath) + "/" + name;
    const backendPath = newPath.startsWith("/") ? newPath.slice(1) : newPath;

    try {
      await api.createFolder(backendPath);
      listFiles(currentPath);
      setNewFolderPopupOpen(false);
      setInputValue("");
    } catch (e) {
      alert("Failed to create folder");
    }
  };

  const handleRenameRequest = (path: string) => {
    setTargetItem(path);
    setInputValue(path.split("/").pop() || "");
    setRenamePopupOpen(true);
  };

  const handleRename = async (newName: string) => {
    if (!targetItem || !newName) return;

    // Construct new path
    // targetItem is full path e.g. /Folder/File.txt
    const parentPath = targetItem.split("/").slice(0, -1).join("/");
    const newPath = (parentPath === "" ? "" : parentPath) + "/" + newName;

    const backendOldPath = targetItem.startsWith("/")
      ? targetItem.slice(1)
      : targetItem;
    const backendNewPath = newPath.startsWith("/") ? newPath.slice(1) : newPath;

    try {
      await api.moveFile(backendOldPath, backendNewPath);
      listFiles(currentPath);
      setRenamePopupOpen(false);
      setTargetItem(null);
      setInputValue("");
    } catch (e) {
      alert("Failed to rename");
    }
  };

  const handleCopy = (path: string) => {
    setClipboard({ path, op: "copy" });
  };

  const handleCut = (path: string) => {
    setClipboard({ path, op: "move" });
  };

  const handlePaste = async () => {
    if (!clipboard) return;

    const fileName = clipboard.path.split("/").pop();
    const destPath = (currentPath === "/" ? "" : currentPath) + "/" + fileName;

    const backendOldPath = clipboard.path.startsWith("/")
      ? clipboard.path.slice(1)
      : clipboard.path;
    const backendNewPath = destPath.startsWith("/")
      ? destPath.slice(1)
      : destPath;

    try {
      if (clipboard.op === "move") {
        await api.moveFile(backendOldPath, backendNewPath);
        setClipboard(null);
      } else {
        await api.copyFile(backendOldPath, backendNewPath);
      }
      listFiles(currentPath);
    } catch (e) {
      alert("Failed to paste");
    }
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const handleUploadFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const backendBasePath =
      currentPath === "/"
        ? ""
        : currentPath.startsWith("/")
          ? currentPath.slice(1)
          : currentPath;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setUploadState({ uploading: true, progress: 0, filename: file.name });
      try {
        await api.uploadFile(backendBasePath, file, (progress) => {
          setUploadState((prev) => ({ ...prev, progress }));
        });
      } catch (e) {
        console.error("Failed to upload: " + e);
        alert("Failed to upload " + file.name);
      }
    }

    if (fileInputRef.current) fileInputRef.current.value = "";
    setUploadState({ uploading: false, progress: 0, filename: "" });
    listFiles(currentPath);
  };

  const handleUploadFolder = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const backendBasePath =
      currentPath === "/"
        ? ""
        : currentPath.startsWith("/")
          ? currentPath.slice(1)
          : currentPath;

    // 1. Collect directories
    const dirsToCreate = new Set<string>();
    const fileList = Array.from(files);

    for (const file of fileList) {
      if (file.webkitRelativePath) {
        const parts = file.webkitRelativePath.split("/");
        if (parts.length > 1) {
          let currentDir = backendBasePath;
          for (let i = 0; i < parts.length - 1; i++) {
            currentDir = (currentDir ? currentDir + "/" : "") + parts[i];
            dirsToCreate.add(currentDir);
          }
        }
      }
    }

    // 2. Create directories
    const sortedDirs = Array.from(dirsToCreate).sort(
      (a, b) => a.length - b.length,
    );
    for (const dir of sortedDirs) {
      try {
        await api.createFolder(dir);
      } catch (e) {
        // Ignore if exists
      }
    }

    // 3. Upload files
    for (const file of fileList) {
      let targetPath = backendBasePath;
      if (file.webkitRelativePath) {
        const parts = file.webkitRelativePath.split("/");
        parts.pop();
        if (parts.length > 0) {
          const relDir = parts.join("/");
          targetPath = (backendBasePath ? backendBasePath + "/" : "") + relDir;
        }
      }

      setUploadState({ uploading: true, progress: 0, filename: file.name });
      try {
        await api.uploadFile(targetPath, file, (progress) => {
          setUploadState((prev) => ({ ...prev, progress }));
        });
      } catch (e) {
        console.error("Failed to upload: " + e);
      }
    }

    if (folderInputRef.current) folderInputRef.current.value = "";
    setUploadState({ uploading: false, progress: 0, filename: "" });
    listFiles(currentPath);
  };

  const handleDownload = async (path: string) => {
    const backendPath = path.startsWith("/") ? path.slice(1) : path;

    try {
      const url = await api.getDownloadUrl(backendPath);
      if (url) {
        window.open(url, "_blank");
      }
    } catch (e) {
      alert("Failed to download");
    }
  };

  const handleDownloadFolder = async (path: string) => {
    const backendPath = path.startsWith("/") ? path.slice(1) : path;
    try {
      const url = await api.downloadFolder(backendPath);
      if (url) {
        window.open(url, "_blank");
      }
    } catch (e) {
      alert("Failed to download folder: " + e);
    }
  };

  return (
    <AppShell
      isMobile={isMobile}
      sidebarOpen={sidebarOpen}
      accentColor="#00B6FA"
      sidebar={
        <Sidebar open={sidebarOpen}>
          <SidebarTitle>{t("bookmarks.title")}</SidebarTitle>
          <SidebarItem
            selected={currentPath === "/"}
            onClick={() => handleNavigation("/")}
          >
            <Icon icon={House} />
            {t("bookmarks.home")}
          </SidebarItem>
          <SidebarItem
            selected={currentPath === "/Documents"}
            onClick={() => handleNavigation("/Documents")}
          >
            <Icon icon={FileIcon} />
            {t("bookmarks.documents")}
          </SidebarItem>
          <SidebarItem
            selected={currentPath === "/Downloads"}
            onClick={() => handleNavigation("/Downloads")}
          >
            <Icon icon={Download} />
            {t("bookmarks.downloads")}
          </SidebarItem>
          <SidebarItem
            selected={currentPath === "/Applications"}
            onClick={() => handleNavigation("/Applications")}
          >
            <Icon icon={LayoutGrid} />
            {t("bookmarks.applications")}
          </SidebarItem>
          <SidebarItem
            selected={currentPath === "/Pictures"}
            onClick={() => handleNavigation("/Pictures")}
          >
            <Icon icon={Image} />
            {t("bookmarks.pictures")}
          </SidebarItem>
          <SidebarItem
            selected={currentPath === "/Music"}
            onClick={() => handleNavigation("/Music")}
          >
            <Icon icon={Music} />
            {t("bookmarks.music")}
          </SidebarItem>
          <SidebarItem
            selected={currentPath === "/Movies"}
            onClick={() => handleNavigation("/Movies")}
          >
            <Icon icon={Clapperboard} />
            {t("bookmarks.movies")}
          </SidebarItem>
        </Sidebar>
      }
    >
      <Toolbar expanded={!sidebarOpen}>
        <ToolbarActions>
          <ToolbarExpandSidebarButton
            onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
            expanded={!sidebarOpen}
          />
          <ToolbarButton onClick={handleBack}>
            <ArrowUp size={isMobile ? 24 : 18} />
          </ToolbarButton>
        </ToolbarActions>
        <ToolbarTitle>{currentPath}</ToolbarTitle>
        <ToolbarActions>
          {!!clipboard && (
            <ToolbarButton onClick={handlePaste}>
              <ClipboardPaste size={isMobile ? 24 : 18} />
            </ToolbarButton>
          )}
          <ToolbarButton
            onClick={() => {
              setInputValue("");
              setNewFolderPopupOpen(true);
            }}
          >
            <FolderPlus size={isMobile ? 24 : 18} />
          </ToolbarButton>
          <ToolbarButton
            onClick={(e) => {
              e.stopPropagation();
              setUploadContextMenuOpen(true);
            }}
          >
            <Upload size={isMobile ? 24 : 18} />
          </ToolbarButton>
        </ToolbarActions>
      </Toolbar>
      <ContextMenu open={uploadContextMenuOpen} from="top-right">
        <SidebarItem onClick={() => fileInputRef.current?.click()}>
          <FileUp size={isMobile ? 24 : 16} />
          {t("upload.files")}
        </SidebarItem>
        <SidebarItem onClick={() => folderInputRef.current?.click()}>
          <FolderUp size={isMobile ? 24 : 16} />
          {t("upload.folder")}
        </SidebarItem>
      </ContextMenu>
      <input
        type="file"
        hidden
        multiple
        ref={fileInputRef}
        onChange={handleUploadFiles}
      />
      <input
        type="file"
        hidden
        ref={folderInputRef}
        onChange={handleUploadFolder}
        {...({ webkitdirectory: "", directory: "" } as any)}
      />

      <Content expanded={!sidebarOpen}>
        {entries.length == 0 ? (
          <EmptyView icon={FileIcon} label="This folder is empty" />
        ) : (
          entries.map((entry) => {
            const entryPath =
              (currentPath === "/" ? "" : currentPath) + "/" + entry.name;
            return entry.isDirectory ? (
              <ListItem
                key={entry.name}
                onClick={() => handleFolderClick(entry.name)}
                onContextMenu={(e) => {
                  let x: number, y: number;

                  if ("clientX" in e) {
                    x = e.clientX;
                    y = e.clientY;
                  } else {
                    x = e.touches[0].clientX;
                    y = e.touches[0].clientY;
                  }

                  e.stopPropagation();
                  setContextMenuItemIsDirectory(true);
                  setContextMenuItemPath(entryPath);
                  setContextMenuPosition({ x, y });
                  setItemContextMenuOpen(true);
                }}
              >
                <Icon icon={FolderIcon} />
                <span className={styles.entryName} title={entry.name}>
                  {entry.name}
                </span>
              </ListItem>
            ) : (
              <ListItem
                key={entry.name}
                onClick={() => handleFileClick(entryPath, entry.name)}
                onContextMenu={(e) => {
                  let x: number, y: number;

                  if ("clientX" in e) {
                    x = e.clientX;
                    y = e.clientY;
                  } else {
                    x = e.touches[0].clientX;
                    y = e.touches[0].clientY;
                  }

                  e.stopPropagation();
                  setContextMenuItemIsDirectory(false);
                  setContextMenuItemPath(entryPath);
                  setContextMenuPosition({ x, y });
                  setItemContextMenuOpen(true);
                }}
              >
                <Icon icon={FileIcon} />
                <span className={styles.entryName} title={entry.name}>
                  {entry.name}
                </span>
              </ListItem>
            );
          })
        )}

        <ContextMenu
          open={itemContextMenuOpen}
          x={contextMenuPosition.x}
          y={contextMenuPosition.y}
        >
          {!contextMenuItemIsDirectory && (
            <SidebarItem
              onClick={() => {
                handleDownload(contextMenuItemPath);
              }}
            >
              <Icon icon={Download} />
              <span>{t("context.download")}</span>
            </SidebarItem>
          )}

          {contextMenuItemIsDirectory && (
            <SidebarItem
              onClick={() => {
                handleDownloadFolder(contextMenuItemPath);
              }}
            >
              <Icon icon={Download} />
              <span>{t("context.downloadzip")}</span>
            </SidebarItem>
          )}

          <SidebarItem
            onClick={() => {
              handleRenameRequest(contextMenuItemPath);
            }}
          >
            <Icon icon={TextCursor} />
            <span>{t("context.rename")}</span>
          </SidebarItem>

          <SidebarItem
            onClick={() => {
              handleCopy(contextMenuItemPath);
            }}
          >
            <Icon icon={Copy} />
            <span>{t("context.copy")}</span>
          </SidebarItem>

          <SidebarItem
            onClick={() => {
              handleCut(contextMenuItemPath);
            }}
          >
            <Icon icon={Scissors} />
            <span>{t("context.cut")}</span>
          </SidebarItem>

          <SidebarItem
            onClick={() => {
              handleDelete(contextMenuItemPath);
            }}
          >
            <Icon icon={Trash} />
            <span>{t("context.delete")}</span>
          </SidebarItem>
        </ContextMenu>
      </Content>

      {uploadState.uploading && (
        <div className={styles.progressBarContainer}>
          <div className={styles.progressBarTitle}>
            <span>
              {t("upload.uploading")} {uploadState.filename}
            </span>
            <span>{Math.round(uploadState.progress)}%</span>
          </div>
          <div className={styles.progressTrack}>
            <div
              className={styles.progressFill}
              style={{ width: `${uploadState.progress}%` }}
            />
          </div>
        </div>
      )}

      <Popup open={newFolderPopupOpen}>
        <PopupTitle>{t("popup.newfolder.title")}</PopupTitle>
        <PopupInput
          placeholder={t("popup.newfolder.placeholder")}
          value={inputValue}
          onChange={setInputValue}
          onSubmit={handleCreateFolder}
          autoFocus
        ></PopupInput>
        <PopupActions orientation="horizontal">
          <PopupButton type="secondary" onClick={closePopups}>
            {t("popup.cancel")}
          </PopupButton>
          <PopupButton onClick={() => handleCreateFolder(inputValue)}>
            {t("popup.newfolder.submit")}
          </PopupButton>
        </PopupActions>
      </Popup>

      <Popup open={renamePopupOpen}>
        <PopupTitle>{t("popup.rename.title")}</PopupTitle>
        <PopupInput
          placeholder={targetItem ? targetItem.split("/").pop() : ""}
          value={inputValue}
          onChange={setInputValue}
          onSubmit={handleRename}
          autoFocus
        ></PopupInput>
        <PopupActions orientation="horizontal">
          <PopupButton type="secondary" onClick={closePopups}>
            {t("popup.cancel")}
          </PopupButton>
          <PopupButton onClick={() => handleRename(inputValue)}>
            {t("popup.rename.submit")}
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
          <PopupButton onClick={() => confirmDelete()}>
            {t("popup.delete.submit")}
          </PopupButton>
        </PopupActions>
      </Popup>
    </AppShell>
  );
}

export default App;
