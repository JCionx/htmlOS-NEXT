import { useEffect, useRef } from "react";
import type { LucideIcon } from "lucide-react";

interface PopupProps {
  title: string;
  description?: string;
  input: boolean;
  placeholder?: string;
  actionName?: string;
  onSubmit?: (value: string) => void;
  onCancel?: () => void;
  open?: boolean;
  icon?: LucideIcon;
}

function Popup({
  title,
  description,
  input,
  placeholder,
  actionName,
  onSubmit,
  onCancel,
  open = false,
  icon: Icon,
}: PopupProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleConfirm = () => {
    if (onSubmit && inputRef.current) {
      onSubmit(inputRef.current.value);
    }
    if (!input && onSubmit) {
      onSubmit("");
    }
  };

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.value = "";
      inputRef.current.focus();
    }
  }, [open]);

  return (
    <div className={`popup-container ${open ? "" : "popup-closed"}`}>
      <div className="popup">
        {Icon && (
          <div className="popup-icon-container">
            <Icon size={64} className="popup-icon" />
          </div>
        )}
        <div className="popup-content">
          <span className="popup-title">{title}</span>
          {description && (
            <span className="popup-description">{description}</span>
          )}
        </div>
        {input && (
          <input
            ref={inputRef}
            type="text"
            className="popup-input"
            placeholder={placeholder || "Enter text..."}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleConfirm();
              }
            }}
          />
        )}
        <div className="popup-actions">
          <button className="popup-btn secondary" onClick={onCancel}>
            Cancel
          </button>
          <button className="popup-btn" onClick={handleConfirm}>
            {actionName || "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Popup;
