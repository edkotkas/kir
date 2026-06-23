export type QrLevel = "L" | "M" | "Q" | "H";

export type GenerateRailInput = {
  isContentTooLong: boolean;
  trimmedLength: number;
  hasUnsafeContrast: boolean;
  ratio: number;
  hasCutout: boolean;
  size: number;
  hasMissingModuleImage: boolean;
};

export type QrImageSettings = {
  src: string;
  width: number;
  height: number;
  excavate: true;
};
