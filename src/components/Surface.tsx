import type { ComponentPropsWithoutRef, ElementType } from "react";
import { cn } from "../helpers/class-name";

type SurfaceProps<T extends ElementType> = {
  as?: T;
  className?: string;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "className">;

export function Surface<T extends ElementType = "div">({
  as,
  className,
  ...props
}: SurfaceProps<T>) {
  const Component = as ?? "div";
  return (
    <Component
      className={cn(
        "rounded-xl border border-bg-300/70 bg-linear-to-br from-bg-100/85 to-bg-200/85",
        className,
      )}
      {...props}
    />
  );
}
