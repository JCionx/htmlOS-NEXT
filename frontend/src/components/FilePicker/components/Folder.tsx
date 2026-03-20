import styles from "./Folder.module.css";
import FolderIcon from "./assets/folder.png";

interface FolderProps {
  name: string;
  disabled?: boolean;
  path: string;
  onClick?: () => void;
  mobileMode?: boolean;
}

function Folder({ name, disabled, onClick, mobileMode }: FolderProps) {
  return (
    <div
      className={`${styles.folder} ${disabled ? styles.folderDisabled : ""} ${
        mobileMode ? styles.folderMobile : ""
      }`}
      onClick={onClick}
    >
      <img src={FolderIcon} alt="Folder icon" />
      {name}
    </div>
  );
}

export default Folder;
