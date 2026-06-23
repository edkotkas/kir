import type { SVGProps } from "react";
import { BaseIcon } from "./BaseIcon";

export function ClearHistoryIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <BaseIcon {...props}>
      <path d="M11 7h9" />
      <path d="M10 12h10" />
      <path d="M11 17h9" />
      <path d="M2.6 8h6.8" />
      <path d="M3.6 8V6.2h4.8V8" />
      <path d="M3 8l.7 8h4.6L9 8" />
    </BaseIcon>
  );
}
