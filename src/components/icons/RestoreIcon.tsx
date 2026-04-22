import type { SVGProps } from "react";
import { BaseIcon } from "./BaseIcon";

export function RestoreIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <BaseIcon {...props}>
      <rect x="8" y="5.5" width="10" height="10" rx="1.5" />
      <path d="M6 8.5H5A1.5 1.5 0 0 0 3.5 10v9A1.5 1.5 0 0 0 5 20.5h9A1.5 1.5 0 0 0 15.5 19v-1" />
    </BaseIcon>
  );
}
