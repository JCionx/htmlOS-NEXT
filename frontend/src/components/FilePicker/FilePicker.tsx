import { useState, useEffect } from "react";
import { runtime } from "../../runtimeConfig";
import { useTranslation } from "react-i18next";
import styles from "./FilePicker.module.css";
import File from "./components/File";
import Folder from "./components/Folder";
import BackIcon from "./assets/back.png";

interface FilePickerProps {
  formats: string[];
  setRequestedFilePath: (path: string) => void;
  mobileMode: boolean;
}

interface FileEntry {
  name: string;
  isDirectory: boolean;
}

function FilePicker({
  formats,
  setRequestedFilePath,
  mobileMode,
}: FilePickerProps) {
  const [selectedFile, setSelectedFile] = useState("");
  const [currentPath, setCurrentPath] = useState("/");
  const [entries, setEntries] = useState<FileEntry[]>([]);
  const [_loading, setLoading] = useState(false);
  const [isClosing, setIsClosing] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsClosing(false), 10);
    return () => clearTimeout(timer);
  }, []);

  async function listFiles(path: string) {
    setLoading(true);
    try {
      const backendPath = path.startsWith("/") ? path.slice(1) : path;
      console.log("Listing files in:", backendPath);
      const response = await fetch(
        `${runtime.VITE_BACKEND_ADDRESS}/data/list`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ path: backendPath }),
          credentials: "include",
        },
      );
      const data = await response.json();
      setEntries(data);
    } catch (e) {
      setEntries([]);
    }
    setSelectedFile("");
    setLoading(false);
  }

  useEffect(() => {
    listFiles(currentPath);
    console.log("Current path changed to", currentPath);
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

  function handleSelect() {
    setIsClosing(true);
    setTimeout(() => {
      setRequestedFilePath(selectedFile.slice(1));
    }, 300); // Match transition duration
  }

  function handleCancel() {
    setIsClosing(true);
    setTimeout(() => {
      setRequestedFilePath("/cancel");
    }, 300); // Match transition duration
  }

  const { t } = useTranslation();

  return (
    <div
      className={`${styles.filePickerContainer} ${mobileMode ? styles.filePickerContainerMobile : ""} ${isClosing ? styles.hidden : ""}`}
    >
      <div
        className={`${styles.filePicker} ${mobileMode ? styles.filePickerMobile : ""}`}
      >
        <div className={styles.header}>
          <img
            onClick={handleBack}
            className={`${styles.backBtn} ${
              currentPath === "/" ? styles.disabled : ""
            }`}
            src={BackIcon}
            alt="Back icon"
          />
          <p className={styles.title}>{t("popup.fileselect.title")}</p>
          <span className={styles.path}>{currentPath}</span>
        </div>
        <div className={styles.entriesContainer}>
          {entries.map((entry) =>
            entry.isDirectory ? (
              <Folder
                key={entry.name}
                name={entry.name}
                path={`${currentPath === "/" ? "" : currentPath}/${entry.name}`}
                onClick={() => handleFolderClick(entry.name)}
                mobileMode={mobileMode}
              />
            ) : (
              <File
                key={entry.name}
                name={entry.name}
                path={`${currentPath === "/" ? "" : currentPath}/${entry.name}`}
                disabled={
                  formats.length > 0 &&
                  !formats.some((fmt) => entry.name.endsWith(fmt))
                }
                onSelect={() =>
                  setSelectedFile(
                    `${currentPath === "/" ? "" : currentPath}/${entry.name}`,
                  )
                }
                selected={
                  selectedFile ===
                  `${currentPath === "/" ? "" : currentPath}/${entry.name}`
                }
                mobileMode={mobileMode}
              />
            ),
          )}
        </div>
        <div
          className={`${styles.footer} ${mobileMode ? styles.footerMobile : ""}`}
        >
          <p className={styles.info}>
            {t("popup.fileselect.description")}{" "}
            {t("popup.fileselect.supportedfiles")}{" "}
            {formats.length ? formats.join(", ") : t("popup.fileselect.all")}
          </p>
          <div
            className={`${styles.actions} ${mobileMode ? styles.actionsMobile : ""}`}
          >
            <button className={styles.cancelBtn} onClick={handleCancel}>
              {t("popup.cancel")}
            </button>
            <button
              disabled={selectedFile === ""}
              className={styles.chooseBtn}
              onClick={handleSelect}
            >
              {t("popup.fileselect.submit")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FilePicker;
