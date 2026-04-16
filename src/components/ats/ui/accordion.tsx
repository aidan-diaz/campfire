"use client";

import * as React from "react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { motion } from "motion/react";

import { cn } from "./utils";
import { retro, chevronVariants } from "@/lib/animations";

function Accordion({
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Root>) {
  return <AccordionPrimitive.Root data-slot="accordion" {...props} />;
}

function AccordionItem({
  className,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Item>) {
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      className={cn("border-b-2 border-[var(--border)] last:border-b-0", className)}
      {...props}
    />
  );
}

interface AccordionTriggerProps
  extends React.ComponentProps<typeof AccordionPrimitive.Trigger> {
  hideChevron?: boolean;
}

function AccordionTrigger({
  className,
  children,
  hideChevron = false,
  ...props
}: AccordionTriggerProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          "flex flex-1 items-center justify-between gap-4 py-3 px-4 text-left text-xs font-medium uppercase tracking-wider transition-all outline-none",
          "bg-[var(--surface)] border-2 border-[var(--border)]",
          "hover:border-[var(--color-orange)] hover:text-[var(--color-orange)]",
          "data-[state=open]:bg-[var(--surface-raised)] data-[state=open]:border-[var(--color-orange)] data-[state=open]:text-[var(--color-orange)]",
          "disabled:pointer-events-none disabled:opacity-50",
          className
        )}
        onClick={() => setIsOpen(!isOpen)}
        {...props}
      >
        {children}
        {!hideChevron && (
          <motion.span
            className="text-[var(--color-gold)] text-sm shrink-0"
            variants={chevronVariants}
            animate={isOpen ? "open" : "closed"}
            transition={retro.snap}
          >
            ▶
          </motion.span>
        )}
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
}

function AccordionContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Content>) {
  return (
    <AccordionPrimitive.Content
      data-slot="accordion-content"
      className="overflow-hidden text-sm data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
      {...props}
    >
      <div
        className={cn(
          "px-4 py-3 bg-[var(--surface-raised)] border-x-2 border-b-2 border-[var(--color-orange)]",
          className
        )}
      >
        {children}
      </div>
    </AccordionPrimitive.Content>
  );
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
