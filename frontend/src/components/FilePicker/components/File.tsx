import styles from "./File.module.css";
import FileIcon from "./assets/file.png";

interface FileProps {
  name: string;
  disabled?: boolean;
  path: string;
  onSelect: () => void;
  selected: boolean;
  mobileMode?: boolean;
}

function File({
  name,
  disabled = false,
  onSelect,
  selected,
  mobileMode,
}: FileProps) {
  return (
    <div
      onClick={onSelect}
      className={`${styles.file} ${disabled ? styles.fileDisabled : ""} ${
        selected ? styles.fileSelected : ""
      } ${mobileMode ? styles.fileMobile : ""}`}
    >
      <img src={FileIcon} alt="File icon" />
      {name}
    </div>
  );
}

export default File;
