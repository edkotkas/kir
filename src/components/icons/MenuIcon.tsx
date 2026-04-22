import type { SVGProps } from "react";
import { BaseIcon } from "./BaseIcon";

export function MenuIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <BaseIcon {...props}>
      <path d="M4 6h16" />
      <path d="M4 12h16" />
      <path d="M4 18h16" />
    </BaseIcon>
  );
}
