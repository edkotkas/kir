import type { SVGProps } from "react";
import { BaseIcon } from "./BaseIcon";

export function ImageIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <BaseIcon {...props}>
      <rect x="4.5" y="5.5" width="15" height="13" rx="1.8" />
      <circle cx="10" cy="10" r="1.5" />
      <path d="M6.5 16l3.5-3.5 2.5 2.5 2.5-2 2.5 3" />
    </BaseIcon>
  );
}
