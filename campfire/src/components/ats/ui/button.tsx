"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { motion, type HTMLMotionProps } from "motion/react";

import { cn } from "./utils";
import { retro, buttonVariants as motionButtonVariants } from "@/lib/animations";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-xs font-medium uppercase tracking-wider transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none rpg-button",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--color-orange)] text-[var(--primary-foreground)] hover:brightness-110",
        gold: "bg-[var(--color-gold)] text-[var(--primary-foreground)] hover:brightness-110",
        destructive:
          "bg-[var(--color-flag)] text-[var(--foreground)] hover:brightness-110",
        outline:
          "border-2 border-[var(--border)] bg-transparent text-[var(--foreground)] hover:border-[var(--color-orange)] hover:text-[var(--color-orange)]",
        secondary:
          "bg-[var(--surface)] text-[var(--foreground)] border-2 border-[var(--border)] hover:border-[var(--color-gold)]",
        ghost:
          "bg-transparent text-[var(--foreground)] hover:bg-[rgba(247,127,0,0.12)] hover:text-[var(--color-orange)]",
        link: "text-[var(--color-orange)] underline-offset-4 hover:underline shadow-none",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-8 px-3 py-1.5 text-[10px]",
        lg: "h-12 px-8 py-3",
        icon: "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

type ButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  };

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    if (asChild) {
      return (
        <Slot
          ref={ref}
          data-slot="button"
          className={cn(buttonVariants({ variant, size, className }))}
          {...props}
        />
      );
    }

    return (
      <motion.button
        ref={ref}
        data-slot="button"
        className={cn(buttonVariants({ variant, size, className }))}
        variants={motionButtonVariants}
        initial="initial"
        whileHover="hover"
        whileTap="tap"
        transition={retro.snap}
        {...(props as HTMLMotionProps<"button">)}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
