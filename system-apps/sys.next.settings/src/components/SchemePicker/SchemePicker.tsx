import styles from "./SchemePicker.module.css";

import SchemeSystem from "../../assets/scheme-system.svg";
import SchemeLight from "../../assets/scheme-light.svg";
import SchemeDark from "../../assets/scheme-dark.svg";

import { useTranslation } from "react-i18next";

interface SchemePickerProps {
  selectedScheme: string;
  selectScheme: (scheme: string) => void;
}

export function SchemePicker({
  selectedScheme,
  selectScheme,
}: SchemePickerProps) {
  const { t } = useTranslation();

  return (
    <div className={styles.schemePicker}>
      <div className={styles.schemeItem} onClick={() => selectScheme("system")}>
        <img
          src={SchemeSystem}
          className={`${styles.schemeItemImage} ${selectedScheme === "system" ? styles.schemeItemImageSelected : ""}`}
        />
        {t("appearence.system")}
      </div>
      <div className={styles.schemeItem} onClick={() => selectScheme("light")}>
        <img
          src={SchemeLight}
          className={`${styles.schemeItemImage} ${selectedScheme === "light" ? styles.schemeItemImageSelected : ""}`}
        />
        {t("appearence.light")}
      </div>
      <div className={styles.schemeItem} onClick={() => selectScheme("dark")}>
        <img
          src={SchemeDark}
          className={`${styles.schemeItemImage} ${selectedScheme === "dark" ? styles.schemeItemImageSelected : ""}`}
        />
        {t("appearence.dark")}
      </div>
    </div>
  );
}
