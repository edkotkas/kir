import type { SVGProps } from "react";
import { BaseIcon } from "./BaseIcon";

export function ZoomIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <BaseIcon {...props}>
      <circle cx="11" cy="11" r="6" />
      <path d="M11 8.5v5" />
      <path d="M8.5 11h5" />
      <path d="M15.5 15.5L19.5 19.5" />
    </BaseIcon>
  );
}
