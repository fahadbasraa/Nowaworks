import clsx from "clsx";

export function Table({ children, className }) {
  return (
    <div className={clsx("w-full overflow-x-auto", className)}>
      <table className="w-full border-collapse text-sm">{children}</table>
    </div>
  );
}

export function TableHead({ children }) {
  return (
    <thead>
      <tr className="border-b border-border text-left text-xs text-text-3">{children}</tr>
    </thead>
  );
}

export function Th({ children, align = "left", className }) {
  return (
    <th
      className={clsx(
        "px-3 py-2.5 font-medium",
        align === "right" && "text-right",
        className
      )}
    >
      {children}
    </th>
  );
}

export function TableRow({ children, className, ...props }) {
  return (
    <tr
      className={clsx(
        "h-[52px] border-b border-border transition-colors duration-150 hover:bg-surface-2",
        className
      )}
      {...props}
    >
      {children}
    </tr>
  );
}

export function Td({ children, align = "left", className }) {
  return (
    <td className={clsx("px-3 py-2", align === "right" && "text-right", className)}>{children}</td>
  );
}
