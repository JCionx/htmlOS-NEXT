import { Icon } from "../Icon/Icon";
import { X } from "lucide-react";
import styles from "./Tab.module.css";

interface TabProps {
  title: string;
  selected?: boolean;
  onClick?: () => void;
  canClose?: boolean;
  onClose?: () => void;
}

export function Tab({ title, selected, onClick, canClose, onClose }: TabProps) {
  return (
    <div
      className={`${styles.tab} ${selected ? styles.tabSelected : ""}`}
      onClick={onClick}
    >
      <span className={styles.tabTitle}>{title}</span>
      {canClose && (
        <button
          className={styles.closeButton}
          onClick={(e) => {
            e.stopPropagation();
            onClose?.();
          }}
        >
          <Icon icon={X} />
        </button>
      )}
    </div>
  );
}
