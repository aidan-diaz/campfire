"use client";

import * as React from "react";
import { motion, type HTMLMotionProps } from "motion/react";

import { cn } from "./utils";
import { cardVariants as motionCardVariants } from "@/lib/animations";

interface CardProps extends React.ComponentProps<"div"> {
  interactive?: boolean;
}

function Card({ className, interactive = false, ...props }: CardProps) {
  if (interactive) {
    return (
      <motion.div
        data-slot="card"
        className={cn(
          "pixel-border bg-[var(--surface)] text-[var(--foreground)] flex flex-col gap-4",
          className
        )}
        variants={motionCardVariants}
        initial="initial"
        whileHover="hover"
        transition={{ duration: 0.15 }}
        {...(props as HTMLMotionProps<"div">)}
      />
    );
  }

  return (
    <div
      data-slot="card"
      className={cn(
        "pixel-border bg-[var(--surface)] text-[var(--foreground)] flex flex-col gap-4",
        className
      )}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "flex flex-col gap-1.5 px-4 pt-4 border-b-2 border-[var(--border)] pb-3",
        className
      )}
      {...props}
    />
  );
}

function CardTitle({ className, ...props }: React.ComponentProps<"h4">) {
  return (
    <h4
      data-slot="card-title"
      className={cn(
        "text-[var(--color-gold)] text-sm uppercase tracking-wider leading-none",
        className
      )}
      {...props}
    />
  );
}

function CardDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="card-description"
      className={cn("text-[var(--muted-foreground)] text-xs", className)}
      {...props}
    />
  );
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn("self-end", className)}
      {...props}
    />
  );
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-4 pb-4", className)}
      {...props}
    />
  );
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn(
        "flex items-center px-4 pb-4 pt-2 border-t-2 border-[var(--border)]",
        className
      )}
      {...props}
    />
  );
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
};
