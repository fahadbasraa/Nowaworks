import { forwardRef } from "react";
import clsx from "clsx";

export const Textarea = forwardRef(function Textarea({ className, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      className={clsx(
        "w-full rounded-field border border-border bg-surface-2 px-3 py-3 font-mono text-sm text-text",
        "placeholder:text-text-3 outline-none transition-colors duration-150 ease-out",
        "hover:border-border-strong focus:border-border-strong resize-none",
        "disabled:opacity-60 disabled:cursor-not-allowed",
        className
      )}
      {...props}
    />
  );
});
