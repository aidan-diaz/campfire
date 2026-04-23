"use client";

import { Toaster as Sonner, ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast pixel-border bg-[var(--surface)] text-[var(--foreground)] border-[var(--color-gold)]",
          title: "text-xs uppercase tracking-wider text-[var(--color-gold)]",
          description: "text-xs text-[var(--foreground)]",
          actionButton:
            "bg-[var(--color-orange)] text-[var(--primary-foreground)] text-[10px] uppercase tracking-wider px-3 py-1.5",
          cancelButton:
            "bg-transparent border border-[var(--border)] text-[var(--foreground)] text-[10px] uppercase tracking-wider px-3 py-1.5",
          success: "pixel-border-success border-[#4caf50]",
          error: "pixel-border-red border-[var(--color-flag)]",
          info: "pixel-border-orange border-[var(--color-orange)]",
          warning: "pixel-border border-[var(--color-gold)]",
        },
      }}
      style={
        {
          "--normal-bg": "var(--surface)",
          "--normal-text": "var(--foreground)",
          "--normal-border": "var(--color-gold)",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
