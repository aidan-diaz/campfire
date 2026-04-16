import * as React from "react";

import { cn } from "./utils";

export interface InputProps extends React.ComponentProps<"input"> {
  error?: string;
  label?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, label, ...props }, ref) => {
    return (
      <div className="field-group w-full">
        {label && <label className="stat-label">{label}</label>}
        <input
          type={type}
          ref={ref}
          data-slot="input"
          className={cn(
            "stat-input",
            error && "error",
            className
          )}
          {...props}
        />
        {error && <span className="stat-error">▲ {error}</span>}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
