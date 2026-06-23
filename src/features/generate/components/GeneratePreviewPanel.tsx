import { QRCodeCanvas } from "qrcode.react";
import type { RefObject } from "react";
import { Surface } from "../../../components";

import type { QrImageSettings, QrLevel } from "../utils";

type GeneratePreviewPanelProps = {
  value: string;
  size: number;
  level: QrLevel;
  fgColor: string;
  bgColor: string;
  useModuleImage: boolean;
  imageSettings?: QrImageSettings;
  rails: string[];
  qrCanvasRef: RefObject<HTMLCanvasElement | null>;
};

export function GeneratePreviewPanel({
  value,
  size,
  level,
  fgColor,
  bgColor,
  useModuleImage,
  imageSettings,
  rails,
  qrCanvasRef,
}: GeneratePreviewPanelProps) {
  return (
    <Surface className="relative flex min-h-0 flex-1 flex-col items-center justify-center rounded-2xl p-5">
      <QRCodeCanvas
        className="qr-code-media"
        ref={qrCanvasRef}
        value={value}
        size={size}
        marginSize={0}
        level={level}
        fgColor={useModuleImage ? "#000000" : fgColor}
        bgColor={bgColor}
        imageSettings={imageSettings}
      />
      {rails.length > 0 && (
        <div className="absolute bottom-3 left-3 right-3 flex flex-col gap-1">
          {rails.map((item) => (
            <div
              key={item}
              className="rounded-lg border border-accent-100/45 bg-bg-100/90 px-3 py-1.5 text-xs text-text-200 backdrop-blur-sm"
            >
              {item}
            </div>
          ))}
        </div>
      )}
    </Surface>
  );
}
