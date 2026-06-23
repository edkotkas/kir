import { MAX_INPUT_LENGTH, MIN_CONTRAST } from "../constants";
import type { GenerateRailInput } from "./types";

export function getGenerateRails({
  isContentTooLong,
  trimmedLength,
  hasUnsafeContrast,
  ratio,
  hasCutout,
  size,
  hasMissingModuleImage
}: GenerateRailInput) {
  const rails: string[] = [];

  if (isContentTooLong) {
    rails.push(`Input is too long (${trimmedLength}/${MAX_INPUT_LENGTH}).`);
  } else if (trimmedLength > 900) {
    rails.push("Large payload may scan slower on older cameras.");
  }

  if (hasUnsafeContrast) {
    rails.push(
      `Foreground/background contrast is low (${ratio.toFixed(2)}:1). Keep it at least ${MIN_CONTRAST.toFixed(1)}:1.`
    );
  }

  if (hasCutout && size < 220) {
    rails.push("Cutout works best at size 220 or larger for reliable scans.");
  }

  if (hasMissingModuleImage) {
    rails.push("Upload a module image or disable module image mode.");
  }

  return rails;
}
