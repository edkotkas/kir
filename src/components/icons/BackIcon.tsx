import type { SVGProps } from "react";
import { BaseIcon } from "./BaseIcon";

export function BackIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <BaseIcon {...props}>
      <path d="M15.5 5.5L9 12l6.5 6.5" />
      <path d="M9 12h10" />
    </BaseIcon>
  );
}
