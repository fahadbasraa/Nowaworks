import clsx from "clsx";

export function Skeleton({ className }) {
  return <div className={clsx("skeleton rounded-field", className)} />;
}
