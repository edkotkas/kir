import type { TextareaHTMLAttributes } from "react";
import { cn } from "../../utils/class-name";

export function AppTextarea({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "w-full resize-none rounded-xl border border-bg-300 bg-bg-100 px-3 py-2.5 text-text-100 placeholder:text-text-200/70 focus:border-primary-200 focus:outline-none",
        className,
      )}
      {...props}
    />
  );
}
