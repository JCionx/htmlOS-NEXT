import styles from "./TaskbarMenu.module.css";
import MenuIcon from "./assets/icon.png";
import MobileMenuIcon from "./assets/mobileIcon.png";

interface TaskbarProps {
  onClick: () => void;
  menuOpen: boolean;
  mobileMode?: boolean;
}

function TaskbarMenu({ onClick, menuOpen, mobileMode }: TaskbarProps) {
  function handleClick() {
    onClick();
  }

  return (
    <div className={styles.taskbarAppContainer}>
      <div
        className={`${mobileMode ? styles.mobileTaskbarApp : styles.taskbarApp}
          ${menuOpen ? styles.taskbarAppClicked : ""}
        }`}
        onClick={() => {
          handleClick();
        }}
      >
        <img src={mobileMode ? MobileMenuIcon : MenuIcon} alt={`Menu icon`} />
      </div>
    </div>
  );
}

export default TaskbarMenu;
