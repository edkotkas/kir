import type { SVGProps } from "react";
import { BaseIcon } from "./BaseIcon";

export function PasteIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <BaseIcon {...props}>
      <rect x="8" y="2" width="8" height="4" rx="1" />
      <path d="M8 2H7a2 2 0 0 0-2 2v15a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2h-1" />
      <path d="M12 12v5" />
      <path d="M9.5 14.5L12 17l2.5-2.5" />
    </BaseIcon>
  );
}
