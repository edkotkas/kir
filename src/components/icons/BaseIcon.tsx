import type { SVGProps } from "react";

export function BaseIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      className="h-4 w-4"
      aria-hidden="true"
      {...props}
    >
      {props.children}
    </svg>
  );
}
