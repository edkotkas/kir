import type { SVGProps } from "react";
import { BaseIcon } from "./BaseIcon";

export function PaletteIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <BaseIcon {...props}>
      <path d="M12 4.5a7.5 7.5 0 1 0 0 15h1.2a2.3 2.3 0 0 0 0-4.6h-1a2 2 0 1 1 0-4h2.3a3 3 0 0 0 3-3 3.5 3.5 0 0 0-3.5-3.4H12z" />
      <circle cx="8" cy="10" r="1" fill="currentColor" stroke="none" />
      <circle cx="10.7" cy="7.5" r="1" fill="currentColor" stroke="none" />
      <circle cx="14" cy="7.8" r="1" fill="currentColor" stroke="none" />
    </BaseIcon>
  );
}
