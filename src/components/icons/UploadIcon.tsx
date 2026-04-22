import type { SVGProps } from "react";
import { BaseIcon } from "./BaseIcon";

export function UploadIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <BaseIcon {...props}>
      <path d="M12 16V6" />
      <path d="M8.5 9.5L12 6l3.5 3.5" />
      <path d="M5 18.5h14" />
    </BaseIcon>
  );
}
