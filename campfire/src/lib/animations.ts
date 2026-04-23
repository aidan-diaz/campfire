import type { Transition, Variants } from "motion/react";

export const retro = {
  spring: { type: "spring", stiffness: 600, damping: 32 } as Transition,
  snap: { type: "tween", duration: 0.12, ease: [0.25, 0, 0.5, 1] } as Transition,
  glow: {
    duration: 1.6,
    ease: "easeInOut",
    repeat: Infinity,
    repeatType: "mirror",
  } as Transition,
  xpFill: { duration: 1.2, ease: "easeOut" } as Transition,
};

export const buttonVariants: Variants = {
  initial: { y: 0, boxShadow: "3px 3px 0 rgba(0,0,0,0.4)" },
  hover: { y: -1, boxShadow: "4px 4px 0 rgba(0,0,0,0.4)" },
  tap: { y: 2, boxShadow: "none" },
};

export const cardVariants: Variants = {
  initial: {
    y: 0,
    boxShadow:
      "inset 0 0 0 1px rgba(0,48,73,0.8), 0 0 0 1px var(--color-gold), 4px 4px 0 0 rgba(252,191,73,0.3)",
  },
  hover: {
    y: -2,
    boxShadow:
      "0 0 20px rgba(247,127,0,0.2), inset 0 0 0 1px rgba(0,48,73,0.8), 0 0 0 1px var(--color-gold), 4px 4px 0 0 rgba(252,191,73,0.3)",
  },
};

export const modalVariants: Variants = {
  initial: { opacity: 0, scale: 0.92 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.92 },
};

export const accordionVariants: Variants = {
  closed: { height: 0, opacity: 0 },
  open: { height: "auto", opacity: 1 },
};

export const slideUpVariants: Variants = {
  initial: { y: 20, opacity: 0 },
  animate: { y: 0, opacity: 1 },
  exit: { y: 20, opacity: 0 },
};

export const fadeInVariants: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export const navIndicatorVariants: Variants = {
  initial: { scaleY: 0 },
  animate: { scaleY: 1 },
  exit: { scaleY: 0 },
};

export const toastVariants: Variants = {
  initial: { x: "100%", opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: "100%", opacity: 0 },
};

export const dropdownVariants: Variants = {
  initial: { scaleY: 0.85, opacity: 0, transformOrigin: "top" },
  animate: { scaleY: 1, opacity: 1 },
  exit: { scaleY: 0.85, opacity: 0 },
};

export const xpFillVariants: Variants = {
  initial: { width: 0 },
  animate: (progress: number) => ({ width: `${progress}%` }),
};

export const chevronVariants: Variants = {
  closed: { rotate: 0 },
  open: { rotate: 90 },
};

export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.05,
    },
  },
};

export const staggerItem: Variants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
};
