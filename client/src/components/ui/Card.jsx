import clsx from "clsx";
import { motion } from "framer-motion";

export function Card({ className, hover = false, children, ...props }) {
  return (
    <motion.div
      className={clsx(
        "rounded-card border border-border bg-surface shadow-card transition-[border-color,transform] duration-150 ease-out",
        hover && "hover:border-border-strong hover:-translate-y-0.5",
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}
