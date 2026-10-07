import { forwardRef } from "react";
import { motion } from "framer-motion";
import clsx from "clsx";
import { Loader2 } from "lucide-react";

const VARIANTS = {
  primary:
    "bg-accent text-[#0B0B0F] border-t border-t-[rgba(255,255,255,0.25)] hover:bg-accent-hover",
  secondary: "bg-surface-2 text-text border border-border hover:border-border-strong hover:bg-hover",
  ghost: "bg-transparent text-text-2 hover:text-text hover:bg-hover",
  danger: "bg-danger/12 text-danger border border-danger/20 hover:bg-danger/20",
};

export const Button = forwardRef(function Button(
  { className, variant = "primary", size = "md", loading = false, icon: Icon, children, disabled, ...props },
  ref
) {
  const sizeClasses = size === "sm" ? "h-8 px-3 text-xs gap-1.5" : "h-9 px-4 text-sm gap-2";

  return (
    <motion.button
      ref={ref}
      whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
      className={clsx(
        "inline-flex items-center justify-center rounded-field font-medium transition-colors duration-150 ease-out",
        "disabled:opacity-50 disabled:pointer-events-none",
        sizeClasses,
        VARIANTS[variant],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <Loader2 size={15} className="animate-spin" /> : Icon ? <Icon size={15} /> : null}
      {children}
    </motion.button>
  );
});
