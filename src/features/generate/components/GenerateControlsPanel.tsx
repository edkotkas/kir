import { type ChangeEvent } from "react";

import { CloseIcon, ImageIcon, Surface } from "../../../components";
import { MAX_QR_SIZE, MIN_QR_SIZE, QR_SIZE_STEP } from "../utils";

type GenerateControlsPanelProps = {
  fgColor: string;
  bgColor: string;
  size: number;
  uploadedImage: string | null;
  onFgColorChange: (color: string) => void;
  onBgColorChange: (color: string) => void;
  onSizeChange: (size: number) => void;
  onUploadImage: (event: ChangeEvent<HTMLInputElement>) => void;
  onClearUpload: () => void;
};

export function GenerateControlsPanel({
  fgColor,
  bgColor,
  size,
  uploadedImage,
  onFgColorChange,
  onBgColorChange,
  onSizeChange,
  onUploadImage,
  onClearUpload,
}: GenerateControlsPanelProps) {
  return (
    <Surface className="relative shrink-0 rounded-xl p-2">
      <div className="grid grid-cols-[auto_auto_minmax(0,1fr)_auto] items-center gap-2">
        <label
          title="Foreground color"
          aria-label="Foreground color"
          className="block h-8 w-8 cursor-pointer overflow-hidden rounded-lg border border-bg-300"
        >
          <input
            type="color"
            value={fgColor}
            onChange={(event) => onFgColorChange(event.target.value)}
            className="h-full w-full cursor-pointer border-0 p-0"
          />
        </label>

        <label
          title="Background color"
          aria-label="Background color"
          className="block h-8 w-8 cursor-pointer overflow-hidden rounded-lg border border-bg-300"
        >
          <input
            type="color"
            value={bgColor}
            onChange={(event) => onBgColorChange(event.target.value)}
            className="h-full w-full cursor-pointer border-0 p-0"
          />
        </label>

        <div
          title="QR size"
          aria-label="QR size"
          className="inline-flex h-8 min-w-0 items-center gap-2 rounded-lg px-2"
        >
          <input
            type="range"
            min={MIN_QR_SIZE}
            max={MAX_QR_SIZE}
            step={QR_SIZE_STEP}
            value={size}
            onChange={(event) => onSizeChange(Number(event.target.value))}
            className="h-8 min-w-0 flex-1 accent-primary-200"
          />
          <input
            type="number"
            value={size}
            onChange={(event) => {
              const nextSize = event.target.valueAsNumber;
              if (Number.isFinite(nextSize) && nextSize > 0) {
                onSizeChange(nextSize);
              }
            }}
            className="h-full w-14 shrink-0 rounded border border-bg-300 bg-transparent px-1 text-right text-xs text-text-100 focus:outline-none focus:border-primary-200/60"
          />
        </div>

        {uploadedImage ? (
          <button
            type="button"
            title="Remove center image"
            aria-label="Remove center image"
            onClick={onClearUpload}
            className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-accent-100/60 text-accent-100 transition hover:border-accent-100 hover:bg-accent-100/10"
          >
            <CloseIcon className="h-3.5 w-3.5" />
          </button>
        ) : (
          <label
            title="Upload center image"
            aria-label="Upload center image"
            className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-bg-300 text-text-200 transition hover:border-primary-200/40 hover:text-text-100"
          >
            <ImageIcon className="h-3.5 w-3.5" />
            <input
              type="file"
              accept="image/*"
              onChange={onUploadImage}
              className="hidden"
            />
          </label>
        )}
      </div>
    </Surface>
  );
}
