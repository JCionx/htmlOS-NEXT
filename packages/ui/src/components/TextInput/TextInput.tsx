import { forwardRef } from "react";
import styles from "./TextInput.module.css";

interface TextInputProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  disabled?: boolean;
  type?: "text" | "password" | "email" | "number" | "search" | "url" | "tel";
  className?: string;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  (
    {
      placeholder,
      value,
      onChange,
      onFocus,
      onBlur,
      disabled = false,
      type = "text",
      className,
      onKeyDown,
    },
    ref,
  ) => {
    return (
      <input
        ref={ref}
        type={type}
        className={`${styles.textInput} ${className || ""}`}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        onFocus={onFocus}
        onBlur={onBlur}
        disabled={disabled}
        onKeyDown={onKeyDown}
      />
    );
  },
);
