import { useState } from "react";
import { useTranslation } from "react-i18next";

import styles from "./Onboarding.module.css";
import closeButtonIcon from "./assets/icons/close-button.svg";
import mainIcon from "./assets/icons/main.png";

import schemeLight from "./assets/scheme-light.svg";
import schemeDark from "./assets/scheme-dark.svg";
import schemeSystem from "./assets/scheme-system.svg";

import lightFloating from "./assets/light-floating.png";
import lightExpanded from "./assets/light-expanded.png";
import darkFloating from "./assets/dark-floating.png";
import darkExpanded from "./assets/dark-expanded.png";
import lightEdgesExpanded from "./assets/light-edges-expanded.png";
import lightEdgesFloating from "./assets/light-edges-floating.png";
import darkEdgesExpanded from "./assets/dark-edges-expanded.png";
import darkEdgesFloating from "./assets/dark-edges-floating.png";

import { useSettings } from "../../contexts/SettingsContext";

interface OnboardingProps {
  onClose: () => void;
}

function Page1({ onNext }: { onNext: () => void }) {
  const { t } = useTranslation();
  return (
    <>
      <img
        src={mainIcon}
        alt="Onboarding main icon"
        draggable={false}
        className={styles.mainIcon}
      />
      <h2 className={styles.subtitle}>{t("onboarding.welcome")}</h2>
      <h1 className={styles.mainTitle}>{t("onboarding.mainTitle")}</h1>
      <button className={styles.nextButton} onClick={onNext}>
        {t("onboarding.next")}
      </button>
    </>
  );
}

function Page2({ onNext }: { onNext: () => void }) {
  const { language, setLanguage } = useSettings();
  const { t } = useTranslation();

  return (
    <>
      <h1 className={styles.subtitle}>{t("onboarding.selectLanguage")}</h1>
      <select
        className={styles.languageSelect}
        name="language"
        id="language"
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
      >
        <option value="en">{t("onboarding.language_en")}</option>
        <option value="pt">{t("onboarding.language_pt")}</option>
        <option value="es">{t("onboarding.language_es")}</option>
        <option value="zh">{t("onboarding.language_zh")}</option>
        <option value="fr">{t("onboarding.language_fr")}</option>
        <option value="de">{t("onboarding.language_de")}</option>
      </select>
      <button className={styles.nextButton} onClick={onNext}>
        {t("onboarding.next")}
      </button>
    </>
  );
}

function Page3({ onNext }: { onNext: () => void }) {
  const { colorScheme, setColorScheme } = useSettings();
  const { t } = useTranslation();
  const [selectedColorScheme, setSelectedColorScheme] = useState<
    "light" | "dark" | "system"
  >(colorScheme as "light" | "dark" | "system");

  const choose = (scheme: "light" | "dark" | "system") => {
    setSelectedColorScheme(scheme);
    setColorScheme(scheme);
  };

  return (
    <>
      <h1 className={styles.subtitle}>{t("onboarding.chooseColorScheme")}</h1>
      <div className={styles.row}>
        <div className={styles.column} onClick={() => choose("light")}>
          <img
            src={schemeLight}
            alt="Light color scheme"
            className={selectedColorScheme === "light" ? styles.selected : ""}
          />
          <p>{t("onboarding.light")}</p>
        </div>
        <div className={styles.column} onClick={() => choose("dark")}>
          <img
            src={schemeDark}
            alt="Dark color scheme"
            className={selectedColorScheme === "dark" ? styles.selected : ""}
          />
          <p>{t("onboarding.dark")}</p>
        </div>
        <div className={styles.column} onClick={() => choose("system")}>
          <img
            src={schemeSystem}
            alt="System color scheme"
            className={selectedColorScheme === "system" ? styles.selected : ""}
          />
          <p>{t("onboarding.system")}</p>
        </div>
      </div>
      <p className={styles.mutedText}>{t("onboarding.canChangeLater")}</p>
      <button className={styles.nextButton} onClick={onNext}>
        {t("onboarding.next")}
      </button>
    </>
  );
}

function Page4({ onNext }: { onNext: () => void }) {
  const { colorScheme, taskbarFloating, setTaskbarFloating } = useSettings();
  const { t } = useTranslation();
  const [selectedTaskbarStyle, setSelectedTaskbarStyle] = useState<
    "floating" | "expanded"
  >(taskbarFloating ? "floating" : "expanded");

  const choose = (scheme: "floating" | "expanded") => {
    setSelectedTaskbarStyle(scheme);
    setTaskbarFloating(scheme === "floating");
  };

  return (
    <>
      <h1 className={styles.subtitle}>{t("onboarding.chooseTaskbarStyle")}</h1>
      <div className={styles.row}>
        <div className={styles.column} onClick={() => choose("floating")}>
          <img
            src={colorScheme === "dark" ? darkFloating : lightFloating}
            alt="Floating taskbar style"
            className={
              selectedTaskbarStyle === "floating" ? styles.selected : ""
            }
          />
          <p>{t("onboarding.floating")}</p>
        </div>
        <div className={styles.column} onClick={() => choose("expanded")}>
          <img
            src={colorScheme === "dark" ? darkExpanded : lightExpanded}
            alt="Expanded taskbar style"
            className={
              selectedTaskbarStyle === "expanded" ? styles.selected : ""
            }
          />
          <p>{t("onboarding.expanded")}</p>
        </div>
      </div>
      <p className={styles.mutedText}>{t("onboarding.canChangeLater")}</p>
      <button className={styles.nextButton} onClick={onNext}>
        {t("onboarding.next")}
      </button>
    </>
  );
}

function Page5({ onNext }: { onNext: () => void }) {
  const { colorScheme, taskbarFloating, taskbarEdges, setTaskbarEdges } =
    useSettings();
  const { t } = useTranslation();
  const [selectedTaskbarAlignment, setSelectedTaskbarAlignment] = useState<
    "center" | "edges"
  >(taskbarEdges ? "edges" : "center");

  const choose = (scheme: "center" | "edges") => {
    setSelectedTaskbarAlignment(scheme);
    setTaskbarEdges(scheme === "edges");
  };

  return (
    <>
      <h1 className={styles.subtitle}>
        {t("onboarding.chooseTaskbarAlignment")}
      </h1>
      <div className={styles.row}>
        <div className={styles.column} onClick={() => choose("center")}>
          <img
            src={
              colorScheme === "dark"
                ? taskbarFloating
                  ? darkFloating
                  : darkExpanded
                : taskbarFloating
                  ? lightFloating
                  : lightExpanded
            }
            alt="Center taskbar alignment"
            className={
              selectedTaskbarAlignment === "center" ? styles.selected : ""
            }
          />
          <p>{t("onboarding.center")}</p>
        </div>
        <div className={styles.column} onClick={() => choose("edges")}>
          <img
            src={
              colorScheme === "dark"
                ? taskbarFloating
                  ? darkEdgesFloating
                  : darkEdgesExpanded
                : taskbarFloating
                  ? lightEdgesFloating
                  : lightEdgesExpanded
            }
            alt="Edges taskbar alignment"
            className={
              selectedTaskbarAlignment === "edges" ? styles.selected : ""
            }
          />
          <p>{t("onboarding.edges")}</p>
        </div>
      </div>
      <p className={styles.mutedText}>{t("onboarding.canChangeLater")}</p>
      <button className={styles.nextButton} onClick={onNext}>
        {t("onboarding.next")}
      </button>
    </>
  );
}

function Onboarding({ onClose }: OnboardingProps) {
  const { colorScheme } = useSettings();
  const [selectedPage, setSelectedPage] = useState(0);
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 400);
  };

  const systemPrefersDark =
    typeof window !== "undefined" && window.matchMedia
      ? window.matchMedia("(prefers-color-scheme: dark)").matches
      : false;

  const effectiveTheme =
    colorScheme === "system"
      ? systemPrefersDark
        ? "dark"
        : "light"
      : colorScheme;

  const pages = [
    <Page1 key="page1" onNext={() => setSelectedPage(1)} />,
    <Page2 key="page2" onNext={() => setSelectedPage(2)} />,
    <Page3 key="page3" onNext={() => setSelectedPage(3)} />,
    <Page4 key="page4" onNext={() => setSelectedPage(4)} />,
    <Page5 key="page5" onNext={() => handleClose()} />,
  ];

  return (
    <div
      className={`${styles.onboardingContainer} ${
        isClosing ? styles.closing : ""
      }`}
    >
      <div
        className={`${styles.onboarding} ${
          effectiveTheme === "dark" ? styles.dark : ""
        }`}
      >
        <button className={styles.closeButton} onClick={handleClose}>
          <img
            src={closeButtonIcon}
            alt="Onboarding close button"
            draggable={false}
          />
        </button>
        <div
          className={styles.pagesContainer}
          style={{
            transform: `translateX(-${selectedPage * 100}%)`,
          }}
        >
          {pages.map((page) => (
            <div key={page.key} className={styles.page}>
              {page}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Onboarding;
