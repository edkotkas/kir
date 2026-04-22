import type { SVGProps } from "react";
import { BaseIcon } from "./BaseIcon";

export function HomeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <BaseIcon {...props}>
      <path d="M4.5 10.5L12 4l7.5 6.5" />
      <path d="M7.5 9.5v9h9v-9" />
    </BaseIcon>
  );
}
