import clsx from "clsx";
import { initials, colorFromName } from "../../utils/format.js";

const SIZES = {
  sm: "h-6 w-6 text-[10px]",
  md: "h-8 w-8 text-xs",
  lg: "h-11 w-11 text-sm",
};

export function Avatar({ name, size = "md", className }) {
  const color = colorFromName(name);
  return (
    <span
      className={clsx(
        "inline-flex shrink-0 items-center justify-center rounded-full font-medium font-sans",
        SIZES[size],
        className
      )}
      style={{ backgroundColor: `${color}26`, color }}
      aria-hidden="true"
    >
      {initials(name)}
    </span>
  );
}
