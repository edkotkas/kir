import type { SVGProps } from "react";
import { BaseIcon } from "./BaseIcon";

export function SaveIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <BaseIcon {...props}>
      <path d="M6 4.5h10l2 2V19.5H6V4.5Z" />
      <path d="M9 4.5v5h6v-5" />
      <path d="M9 19.5v-5h6v5" />
      <path d="M10.5 7h3" />
    </BaseIcon>
  );
}