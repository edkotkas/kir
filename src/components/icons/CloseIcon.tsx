import type { SVGProps } from "react";
import { BaseIcon } from "./BaseIcon";

export function CloseIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <BaseIcon {...props}>
      <path d="M7 7l10 10" />
      <path d="M17 7L7 17" />
    </BaseIcon>
  );
}
