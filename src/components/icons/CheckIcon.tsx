import type { SVGProps } from "react";
import { BaseIcon } from "./BaseIcon";

export function CheckIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <BaseIcon {...props}>
      <path d="M5.5 12.5l4 4L18.5 8" />
    </BaseIcon>
  );
}
