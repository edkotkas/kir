import type { SVGProps } from "react";
import { BaseIcon } from "./BaseIcon";

export function MaximizeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <BaseIcon {...props}>
      <rect x="6.5" y="6.5" width="11" height="11" rx="1.5" />
    </BaseIcon>
  );
}
