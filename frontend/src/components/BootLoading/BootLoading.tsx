import styles from "./BootLoading.module.css";
import DarkLogo from "./assets/dark-logo.png";
import LightLogo from "./assets/light-logo.png";

function BootLoading() {
  return (
    <div className={styles.bootContainer}>
      <div className={styles.bootPage}>
        <img src={DarkLogo} alt="htmlOS NEXT logo" className={styles.logo} />
        <img
          src={LightLogo}
          alt="htmlOS NEXT logo"
          className={styles.lightLogo}
        />
        <div className={styles.spinner}></div>
      </div>
    </div>
  );
}

export default BootLoading;
