import type { SVGProps } from "react";
import { BaseIcon } from "./BaseIcon";

export function TrashIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <BaseIcon {...props}>
      <path d="M5.5 7h13" />
      <path d="M9 7V5.5h6V7" />
      <path d="M7.5 7l.8 11.5h7.4L16.5 7" />
      <path d="M10 10v6" />
      <path d="M14 10v6" />
    </BaseIcon>
  );
}
