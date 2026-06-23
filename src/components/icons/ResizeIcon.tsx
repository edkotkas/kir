import type { SVGProps } from "react";
import { BaseIcon } from "./BaseIcon";

export function ResizeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <BaseIcon {...props}>
      <path d="M4.5 9.5V4.5h5" />
      <path d="M19.5 14.5v5h-5" />
      <path d="M9 4.5L4.5 9" />
      <path d="M15 19.5l4.5-4.5" />
      <path d="M8 16h8" />
    </BaseIcon>
  );
}
