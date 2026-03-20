import { forwardRef, useEffect, useRef } from "react";
import styles from "./PopupInput.module.css";

interface PopupInputProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  onSubmit?: (value: string) => void;
  autoFocus?: boolean;
}

export const PopupInput = forwardRef<HTMLInputElement, PopupInputProps>(
  (
    { placeholder = "Enter text...", value, onChange, onSubmit, autoFocus },
    ref,
  ) => {
    const internalRef = useRef<HTMLInputElement>(null);
    const activeRef = (ref as React.RefObject<HTMLInputElement>) || internalRef;

    useEffect(() => {
      if (autoFocus && activeRef.current) {
        activeRef.current.focus();
      }
    }, [autoFocus, activeRef]);

    return (
      <input
        ref={activeRef}
        type="text"
        className={styles.popupInput}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && onSubmit) {
            onSubmit(value || "");
          }
        }}
      />
    );
  },
);
