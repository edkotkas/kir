import { QRCodeCanvas } from "qrcode.react";
import { type ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router";

import {
  CloseIcon,
  ImageIcon,
  PasteIcon,
  SaveIcon,
  Surface,
} from "../../components";
import { AppTextarea } from "../../components/ui";
import { useQrStore } from "../../store/useQrStore";
import { cn } from "../../utils/class-name";
import "./GeneratePage.css";

const MAX_INPUT_LENGTH = 1200;
const MIN_CONTRAST = 3.5;
const MIN_QR_SIZE = 180;
const MAX_QR_SIZE = 300;
const QR_SIZE_STEP = 10;

function hexToRgb(value: string) {
  const clean = value.replace("#", "");
  const full =
    clean.length === 3
      ? clean
          .split("")
          .map((c) => c + c)
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
    b: rgb & 255,
  };
}

function toRelativeLuminance(channel: number) {
  const normalized = channel / 255;
  return normalized <= 0.03928
    ? normalized / 12.92
    : ((normalized + 0.055) / 1.055) ** 2.4;
}

function contrastRatio(foreground: string, background: string) {
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

function clampInput(value: string) {
  return value.slice(0, MAX_INPUT_LENGTH);
}

type GeneratePageLocationState = {
  editEntry?: {
    id: string;
    data: string;
  };
};

export function GeneratePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const locationState = location.state as GeneratePageLocationState | null;
  const [input, setInput] = useState(() =>
    clampInput(locationState?.editEntry?.data ?? ""),
  );
  const [hasUserEditedInput, setHasUserEditedInput] = useState(false);
  const [saved, setSaved] = useState<null | { ok: boolean; message: string }>(
    null,
  );
  const [fgColor, setFgColor] = useState("#111827");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [size, setSize] = useState(240);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const moduleImage: string | null = null;
  const useModuleImage = false;
  const { addEntry, state } = useQrStore();
  const qrCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const qrMaskCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const saveTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (!saved) return;
    const t = window.setTimeout(() => setSaved(null), 3500);
    return () => window.clearTimeout(t);
  }, [saved]);

  useEffect(() => {
    const editEntry = locationState?.editEntry;
    if (!editEntry) {
      return;
    }

    navigate(location.pathname, { replace: true, state: null });
  }, [location.pathname, locationState, navigate]);

  const trimmed = input.trim();
  const hasContent = trimmed.length > 0;
  const ratio = useMemo(
    () => contrastRatio(fgColor, bgColor),
    [fgColor, bgColor],
  );
  const isContentTooLong = trimmed.length > MAX_INPUT_LENGTH;
  const hasUnsafeContrast = ratio < MIN_CONTRAST;
  const hasUploadedCutout = Boolean(uploadedImage);
  const hasMissingModuleImage = useModuleImage && !moduleImage;
  const hasCutout = hasUploadedCutout;
  const effectiveLevel: "L" | "M" | "Q" | "H" = hasCutout ? "H" : "M";
  const canGenerate =
    hasContent &&
    !isContentTooLong &&
    !hasUnsafeContrast &&
    !hasMissingModuleImage;
  const autoSaveDelayMs =
    Math.max(1, state.settings.autoSaveDelaySeconds) * 1000;
  const isAutoSaveEnabled = state.settings.autoSave;

  const rails = useMemo(() => {
    const items: string[] = [];

    if (isContentTooLong) {
      items.push(`Input is too long (${trimmed.length}/${MAX_INPUT_LENGTH}).`);
    } else if (trimmed.length > 900) {
      items.push("Large payload may scan slower on older cameras.");
    }

    if (hasUnsafeContrast) {
      items.push(
        `Foreground/background contrast is low (${ratio.toFixed(2)}:1). Keep it at least ${MIN_CONTRAST.toFixed(1)}:1.`,
      );
    }

    if (hasCutout && size < 220) {
      items.push("Cutout works best at size 220 or larger for reliable scans.");
    }

    if (hasMissingModuleImage) {
      items.push("Upload a module image or disable module image mode.");
    }

    return items;
  }, [
    hasCutout,
    hasMissingModuleImage,
    hasUnsafeContrast,
    isContentTooLong,
    ratio,
    size,
    trimmed.length,
  ]);

  const imageSettings = useMemo(() => {
    if (!hasUploadedCutout || !uploadedImage) {
      return undefined;
    }

    const logoSize = Math.round(size * 0.24);

    return {
      src: uploadedImage,
      width: logoSize,
      height: logoSize,
      excavate: true,
    };
  }, [hasUploadedCutout, size, uploadedImage]);

  useEffect(() => {
    if (
      !useModuleImage ||
      !moduleImage ||
      !qrCanvasRef.current ||
      !qrMaskCanvasRef.current
    ) {
      return;
    }

    const targetCanvas = qrCanvasRef.current;
    const maskCanvas = qrMaskCanvasRef.current;
    const targetContext = targetCanvas.getContext("2d");
    const maskContext = maskCanvas.getContext("2d");
    if (!targetContext || !maskContext) {
      return;
    }

    let disposed = false;
    let rafId: number | null = null;
    const width = targetCanvas.width;
    const height = targetCanvas.height;

    const applyMask = async (attempt = 0) => {
      const qrMaskSnapshot = maskContext.getImageData(0, 0, width, height);

      let darkCount = 0;
      for (let i = 0; i < qrMaskSnapshot.data.length; i += 4) {
        const r = qrMaskSnapshot.data[i];
        const g = qrMaskSnapshot.data[i + 1];
        const b = qrMaskSnapshot.data[i + 2];
        const a = qrMaskSnapshot.data[i + 3];
        const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
        if (a > 0 && luma < 128) {
          darkCount += 1;
        }
      }

      if (darkCount === 0) {
        if (attempt < 6 && !disposed) {
          rafId = window.requestAnimationFrame(() => {
            void applyMask(attempt + 1);
          });
        }
        return;
      }

      const image = new Image();
      image.decoding = "async";
      image.src = moduleImage;
      await image.decode();

      if (disposed) {
        return;
      }

      const patternCanvas = document.createElement("canvas");
      patternCanvas.width = width;
      patternCanvas.height = height;
      const patternContext = patternCanvas.getContext("2d");
      if (!patternContext) {
        return;
      }

      const sourceAspect = image.width / image.height;
      const targetAspect = width / height;

      let drawWidth: number;
      let drawHeight: number;
      let drawX = 0;
      let drawY = 0;

      if (sourceAspect > targetAspect) {
        drawHeight = height;
        drawWidth = drawHeight * sourceAspect;
        drawX = (width - drawWidth) / 2;
      } else {
        drawWidth = width;
        drawHeight = drawWidth / sourceAspect;
        drawY = (height - drawHeight) / 2;
      }

      patternContext.drawImage(image, drawX, drawY, drawWidth, drawHeight);

      const maskData = new ImageData(width, height);
      for (let i = 0; i < qrMaskSnapshot.data.length; i += 4) {
        const r = qrMaskSnapshot.data[i];
        const g = qrMaskSnapshot.data[i + 1];
        const b = qrMaskSnapshot.data[i + 2];
        const a = qrMaskSnapshot.data[i + 3];
        const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
        const isDarkModule = a > 0 && luma < 128;
        maskData.data[i + 3] = isDarkModule ? 255 : 0;
      }

      const alphaMaskCanvas = document.createElement("canvas");
      alphaMaskCanvas.width = width;
      alphaMaskCanvas.height = height;
      const alphaMaskContext = alphaMaskCanvas.getContext("2d");
      if (!alphaMaskContext) {
        return;
      }

      alphaMaskContext.putImageData(maskData, 0, 0);

      targetContext.clearRect(0, 0, width, height);
      targetContext.drawImage(patternCanvas, 0, 0);
      targetContext.globalCompositeOperation = "destination-in";
      targetContext.drawImage(alphaMaskCanvas, 0, 0);
      targetContext.globalCompositeOperation = "destination-over";
      targetContext.fillStyle = bgColor;
      targetContext.fillRect(0, 0, width, height);
      targetContext.globalCompositeOperation = "source-over";
    };

    void applyMask();

    return () => {
      disposed = true;
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }
    };
  }, [
    bgColor,
    moduleImage,
    size,
    trimmed,
    useModuleImage,
    effectiveLevel,
    imageSettings,
  ]);

  useEffect(() => {
    if (saveTimeoutRef.current) {
      window.clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }

    if (!canGenerate || !hasUserEditedInput) {
      return;
    }

    saveTimeoutRef.current = window.setTimeout(() => {
      const result = addEntry(trimmed);
      if (!result.saved) {
        setSaved({ ok: false, message: result.reason ?? "Not saved." });
      }
      saveTimeoutRef.current = null;
    }, autoSaveDelayMs);

    return () => {
      if (saveTimeoutRef.current) {
        window.clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = null;
      }
    };
  }, [addEntry, autoSaveDelayMs, canGenerate, hasUserEditedInput, trimmed]);

  const onUploadImageInline = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !file.type.startsWith("image/") || file.size > 1_500_000)
      return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== "string") return;
      setUploadedImage(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const saveManually = () => {
    if (!canGenerate) {
      setSaved({ ok: false, message: "Nothing valid to save yet." });
      return;
    }

    const result = addEntry(trimmed, { bypassAutoSave: true });
    if (!result.saved) {
      setSaved({ ok: false, message: result.reason ?? "Not saved." });
      return;
    }

    setHasUserEditedInput(false);
    setSaved({ ok: true, message: "Saved to history." });
  };

  return (
    <section className="flex h-full  min-h-0 flex-col gap-2">
      <Surface as="label" className="grid shrink-0 gap-2 rounded-2xl p-3">
        <AppTextarea
          className="resize-none"
          rows={4}
          placeholder="Enter text to generate QR code..."
          value={input}
          onChange={(e) => {
            setInput(clampInput(e.target.value));
            setHasUserEditedInput(true);
            setSaved(null);
          }}
        />
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <button
              type="button"
              title="Paste from clipboard"
              aria-label="Paste from clipboard"
              onClick={async (e) => {
                e.preventDefault();
                const text = await navigator.clipboard
                  .readText()
                  .catch(() => "");
                if (text) {
                  setInput(clampInput(text));
                  setHasUserEditedInput(true);
                  setSaved(null);
                }
              }}
              className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-bg-300 text-text-200 transition hover:border-primary-200/40 hover:text-text-100"
            >
              <PasteIcon className="h-3.5 w-3.5" />
            </button>
            {!isAutoSaveEnabled && (
              <button
                type="button"
                title="Save to history"
                aria-label="Save to history"
                onClick={saveManually}
                disabled={!canGenerate}
                className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-bg-300 text-text-200 transition hover:border-primary-200/40 hover:text-text-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <SaveIcon className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <span className="text-stone-400">
            {trimmed.length}/{MAX_INPUT_LENGTH}
          </span>
        </div>
      </Surface>

      <Surface className="relative flex min-h-0 flex-1 flex-col items-center justify-center rounded-2xl p-5">
        <QRCodeCanvas
          className="qr-code-media"
          ref={qrCanvasRef}
          value={trimmed}
          size={size}
          marginSize={0}
          level={effectiveLevel}
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
              onChange={(e) => setFgColor(e.target.value)}
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
              onChange={(e) => setBgColor(e.target.value)}
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
              onChange={(event) => setSize(Number(event.target.value))}
              className="h-8 min-w-0 flex-1 accent-primary-200"
            />
            <input
              type="number"
              value={size}
              onChange={(event) => {
                const nextSize = event.target.valueAsNumber;
                if (Number.isFinite(nextSize) && nextSize > 0) {
                  setSize(nextSize);
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
              onClick={() => setUploadedImage(null)}
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
                onChange={onUploadImageInline}
                className="hidden"
              />
            </label>
          )}
        </div>
      </Surface>

      {saved && (
        <div
          className={cn(
            "fixed bottom-4 left-4 right-4 z-50 rounded-xl border px-3 py-2 text-sm shadow-lg backdrop-blur-sm toast-enter",
            saved.ok
              ? "border-primary-200/60 bg-bg-200/95 text-primary-300"
              : "border-accent-100/60 bg-bg-300/95 text-text-100",
          )}
        >
          <div className="flex items-start justify-between gap-3">
            <span>{saved.message}</span>
            <button
              type="button"
              aria-label="Dismiss message"
              title="Dismiss"
              onClick={() => setSaved(null)}
              className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-current/40 text-current/90 hover:bg-black/20"
            >
              <CloseIcon className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
