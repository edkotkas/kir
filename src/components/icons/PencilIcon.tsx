import type { SVGProps } from "react";
import { BaseIcon } from "./BaseIcon";

export function PencilIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <BaseIcon {...props}>
      <path d="M4 20h4.25L18 10.25 13.75 6 4 15.75V20Z" />
      <path d="M11.75 8 16 12.25" />
      <path d="M14.5 5.25 18.75 9.5" />
    </BaseIcon>
  );
}
