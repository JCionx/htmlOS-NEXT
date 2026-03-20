import { forwardRef } from "react";
import styles from "./SelectInput.module.css";

interface SelectInputProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  className?: string;
  children: React.ReactNode;
}

export const SelectInput = forwardRef<HTMLSelectElement, SelectInputProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={`${styles.selectInput} ${className || ""}`}
        {...props}
      >
        {children}
      </select>
    );
  },
);
