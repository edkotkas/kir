import type { QrLevel } from "./types";

export function getEffectiveLevel(hasCutout: boolean): QrLevel {
  return hasCutout ? "H" : "M";
}