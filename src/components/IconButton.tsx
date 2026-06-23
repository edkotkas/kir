import type { ButtonHTMLAttributes } from "react";
import { cn } from "../helpers/class-name";

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
  active?: boolean;
};

export function IconButton({
  label,
  active = false,
  className,
  children,
  ...props
}: IconButtonProps) {
  return (
    <button
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center rounded-full border text-text-200 transition",
        active
          ? "border-primary-200 bg-[rgba(192,132,252,0.24)] text-primary-300"
          : "border-bg-300 bg-linear-to-br from-bg-200/90 to-bg-300/90 hover:brightness-110",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
