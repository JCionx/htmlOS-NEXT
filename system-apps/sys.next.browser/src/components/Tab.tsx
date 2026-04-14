import { Icon } from "@htmlos-next/ui";
import { X } from "lucide-react";

interface TabProps {
  title: string;
  selected?: boolean;
  onClick?: () => void;
  canClose?: boolean;
  onClose?: () => void;
}

function Tab({ title, selected, onClick, canClose, onClose }: TabProps) {
  return (
    <div className={`tab ${selected ? "tabSelected" : ""}`} onClick={onClick}>
      {title}
      {canClose && (
        <button
          className="closeButton"
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

export default Tab;
