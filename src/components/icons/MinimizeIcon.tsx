import type { SVGProps } from "react";
import { BaseIcon } from "./BaseIcon";

export function MinimizeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <BaseIcon {...props}>
      <path d="M6 12.5h12" />
    </BaseIcon>
  );
}
