"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

/** Tags Reveal can render as. Use "li" inside an <ol>/<ul> to keep list semantics. */
type RevealTag = "div" | "li";

interface RevealProps {
  children: ReactNode;
  /** Stagger delay in seconds, usually index * 0.06. */
  delay?: number;
  className?: string;
  /** Host element. Defaults to "div"; pass "li" for list items. */
  as?: RevealTag;
}

/** Scroll-reveal wrapper: fades and lifts content as it enters the viewport. */
export function Reveal({ children, delay = 0, className, as = "div" }: RevealProps) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    const Tag = as;
    return <Tag className={className}>{children}</Tag>;
  }

  const MotionTag = as === "li" ? motion.li : motion.div;

  return (
    <MotionTag
      className={className}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
    >
      {children}
    </MotionTag>
  );
}
