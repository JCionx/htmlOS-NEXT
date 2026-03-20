import styles from "./PopupActions.module.css";

interface PopupActionsProps {
  orientation?: "horizontal" | "vertical";
  children: React.ReactNode;
}

export function PopupActions({
  orientation = "vertical",
  children,
}: PopupActionsProps) {
  return (
    <div
      className={styles.popupActions}
      style={{
        flexDirection: orientation == "vertical" ? "column" : "row",
      }}
    >
      {children}
    </div>
  );
}
