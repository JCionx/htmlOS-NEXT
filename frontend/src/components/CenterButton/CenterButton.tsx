import styles from "./CenterButton.module.css";
import MenuIcon from "./assets/icon.png";

interface TaskbarProps {
  onClick: () => void;
  activitiesOpen: boolean;
}

function CenterButton({ onClick, activitiesOpen }: TaskbarProps) {
  function handleClick() {
    onClick();
  }

  return (
    <div className={styles.activitiesButtonContainer}>
      <div
        className={`${styles.activitiesButton}
          ${activitiesOpen ? styles.activitiesButtonClicked : ""}
        }`}
        onClick={() => {
          handleClick();
        }}
      >
        <img src={MenuIcon} alt={`Activities icon`} />
      </div>
    </div>
  );
}

export default CenterButton;
