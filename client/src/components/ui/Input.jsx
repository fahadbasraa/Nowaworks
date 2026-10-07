import { forwardRef, useState } from "react";
import clsx from "clsx";
import { Eye, EyeOff } from "lucide-react";

export const Input = forwardRef(function Input(
  { className, label, error, type = "text", id, ...props },
  ref
) {
  const [show, setShow] = useState(false);
  const isPassword = type === "password";
  const inputId = id || props.name;

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-xs text-text-2">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          ref={ref}
          id={inputId}
          type={isPassword && show ? "text" : type}
          className={clsx(
            "h-9 w-full rounded-field border bg-surface-2 px-3 text-sm text-text placeholder:text-text-3",
            "transition-colors duration-150 ease-out outline-none",
            error ? "border-danger/50" : "border-border hover:border-border-strong focus:border-border-strong",
            isPassword && "pr-9",
            className
          )}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            aria-label={show ? "Hide password" : "Show password"}
            onClick={() => setShow((s) => !s)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-3 hover:text-text-2"
          >
            {show ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        )}
      </div>
      {error && <span className="text-xs text-danger">{error}</span>}
    </div>
  );
});
