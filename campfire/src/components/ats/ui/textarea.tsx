import * as React from "react";

import { cn } from "./utils";

export interface TextareaProps extends React.ComponentProps<"textarea"> {
  error?: string;
  label?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, label, ...props }, ref) => {
    return (
      <div className="field-group w-full">
        {label && <label className="stat-label">{label}</label>}
        <textarea
          ref={ref}
          data-slot="textarea"
          className={cn(
            "stat-input min-h-[100px] resize-none",
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
Textarea.displayName = "Textarea";

export { Textarea };
