"use client";

import { motion, HTMLMotionProps } from "framer-motion";
import { ReactNode } from "react";

interface MotionProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  delay?: number;
}

export const FadeIn = ({ children, delay = 0, ...props }: MotionProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    {...props}
  >
    {children}
  </motion.div>
);

export const SlideIn = ({
  children,
  delay = 0,
  direction = "left",
  ...props
}: MotionProps & { direction?: "left" | "right" }) => (
  <motion.div
    initial={{ opacity: 0, x: direction === "left" ? -20 : 20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.5, delay }}
    {...props}
  >
    {children}
  </motion.div>
);
