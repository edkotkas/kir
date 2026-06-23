function hexToRgb(value: string) {
  const clean = value.replace("#", "");
  const full =
    clean.length === 3
      ? clean
          .split("")
          .map((char) => char + char)
          .join("")
      : clean;

  if (full.length !== 6) {
    return null;
  }

  const rgb = Number.parseInt(full, 16);
  if (Number.isNaN(rgb)) {
    return null;
  }

  return {
    r: (rgb >> 16) & 255,
    g: (rgb >> 8) & 255,
    b: rgb & 255
  };
}

function toRelativeLuminance(channel: number) {
  const normalized = channel / 255;
  return normalized <= 0.03928
    ? normalized / 12.92
    : ((normalized + 0.055) / 1.055) ** 2.4;
}

export function contrastRatio(foreground: string, background: string) {
  const fg = hexToRgb(foreground);
  const bg = hexToRgb(background);
  if (!fg || !bg) {
    return 1;
  }

  const fgLum =
    0.2126 * toRelativeLuminance(fg.r) +
    0.7152 * toRelativeLuminance(fg.g) +
    0.0722 * toRelativeLuminance(fg.b);
  const bgLum =
    0.2126 * toRelativeLuminance(bg.r) +
    0.7152 * toRelativeLuminance(bg.g) +
    0.0722 * toRelativeLuminance(bg.b);

  const lighter = Math.max(fgLum, bgLum);
  const darker = Math.min(fgLum, bgLum);
  return (lighter + 0.05) / (darker + 0.05);
}
