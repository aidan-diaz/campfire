import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "./utils";

const badgeVariants = cva(
  "inline-flex items-center justify-center border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none transition-colors overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "border-[var(--color-orange)] bg-[rgba(247,127,0,0.12)] text-[var(--color-orange)]",
        xp: "border-[var(--color-gold)] bg-[rgba(252,191,73,0.12)] text-[var(--color-gold)]",
        stage:
          "border-[var(--color-orange)] bg-[rgba(247,127,0,0.15)] text-[var(--color-orange)]",
        danger:
          "border-[var(--color-flag)] bg-[rgba(214,40,40,0.12)] text-[var(--color-flag)]",
        success:
          "border-[#4caf50] bg-[rgba(76,175,80,0.12)] text-[#4caf50]",
        level:
          "border-[var(--color-gold)] bg-gradient-to-r from-[var(--color-gold)] to-[var(--color-orange)] text-[var(--primary-foreground)]",
        muted:
          "border-[var(--border)] bg-[rgba(234,226,183,0.06)] text-[var(--muted-foreground)]",
        secondary:
          "border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)]",
        outline:
          "border-[var(--border)] bg-transparent text-[var(--foreground)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span";

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
