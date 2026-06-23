import type { ButtonHTMLAttributes } from "react";
import { cn } from "../../utils/class-name";

type AppButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary";
};

export function AppButton({
  variant = "secondary",
  className,
  ...props
}: AppButtonProps) {
  return (
    <button
      className={cn(
        "rounded-xl border px-3 py-2 font-medium transition disabled:cursor-not-allowed disabled:opacity-50",
        variant === "primary"
          ? "border-primary-100 bg-linear-to-r from-primary-100 to-accent-100 text-text-100 hover:from-primary-200 hover:to-primary-100"
          : "border-bg-300 bg-linear-to-br from-bg-200 to-bg-300 text-text-100 hover:brightness-110",
        className,
      )}
      {...props}
    />
  );
}
