import styles from "./Content.module.css";

interface ContentProps {
  expanded?: boolean;
  toolbar?: boolean;
  margin?: "default" | "none";
  children: React.ReactNode;
}

export function Content({
  expanded = true,
  toolbar = true,
  margin = "default",
  children,
}: ContentProps) {
  return (
    <div
      className={`${styles.content} ${expanded ? styles.contentExpanded : ""} ${toolbar ? styles.toolbarPresent : ""} ${margin === "none" ? styles.contentNoMargin : ""}`}
    >
      {children}
    </div>
  );
}
