import type { SVGProps } from "react";
import { BaseIcon } from "./BaseIcon";

export function CopyIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <BaseIcon {...props}>
      <rect x="9" y="9" width="10" height="10" rx="2" />
      <path d="M7 15H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v1" />
    </BaseIcon>
  );
}
