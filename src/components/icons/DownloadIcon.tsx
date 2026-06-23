import type { SVGProps } from "react";
import { BaseIcon } from "./BaseIcon";

export function DownloadIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <BaseIcon {...props}>
      <path d="M12 4v10" />
      <path d="M8.5 10.5L12 14l3.5-3.5" />
      <path d="M5 18h14" />
    </BaseIcon>
  );
}
