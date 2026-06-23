import type { QrImageSettings } from "./types";

export function getImageSettings(
  uploadedImage: string | null,
  size: number
): QrImageSettings | undefined {
  if (!uploadedImage) {
    return undefined;
  }

  const logoSize = Math.round(size * 0.24);
  return {
    src: uploadedImage,
    width: logoSize,
    height: logoSize,
    excavate: true
  };
}
