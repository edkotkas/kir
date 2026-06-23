import { type ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router";

import { useQrStore } from "../../store/useQrStore";
import {
  GenerateControlsPanel,
  GenerateInputPanel,
  GeneratePreviewPanel,
  GenerateStatusToast,
} from "./components";
import "./GeneratePage.css";
import { useGenerateAutoSave, useQrMaskEffect, useSavedStatus } from "./hooks";
import {
  clampInput,
  contrastRatio,
  getEffectiveLevel,
  getGenerateRails,
  getImageSettings,
  MAX_INPUT_LENGTH,
  MIN_CONTRAST,
} from "./utils";

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
  const [fgColor, setFgColor] = useState("#111827");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [size, setSize] = useState(240);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  const moduleImage: string | null = null;
  const useModuleImage = false;

  const qrCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const qrMaskCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const { addEntry, state } = useQrStore();
  const { saved, setSaved } = useSavedStatus();

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

  const hasCutout = Boolean(uploadedImage);
  const hasMissingModuleImage = useModuleImage && !moduleImage;
  const isContentTooLong = trimmed.length > MAX_INPUT_LENGTH;
  const hasUnsafeContrast = ratio < MIN_CONTRAST;

  const effectiveLevel = getEffectiveLevel(hasCutout);
  const canGenerate =
    hasContent &&
    !isContentTooLong &&
    !hasUnsafeContrast &&
    !hasMissingModuleImage;
  const autoSaveDelayMs =
    Math.max(1, state.settings.autoSaveDelaySeconds) * 1000;

  const rails = useMemo(
    () =>
      getGenerateRails({
        isContentTooLong,
        trimmedLength: trimmed.length,
        hasUnsafeContrast,
        ratio,
        hasCutout,
        size,
        hasMissingModuleImage,
      }),
    [
      hasCutout,
      hasMissingModuleImage,
      hasUnsafeContrast,
      isContentTooLong,
      ratio,
      size,
      trimmed.length,
    ],
  );

  const imageSettings = useMemo(
    () => getImageSettings(uploadedImage, size),
    [size, uploadedImage],
  );

  const maskRerenderKey = useMemo(
    () =>
      [
        size,
        trimmed,
        effectiveLevel,
        imageSettings?.src ?? "",
        imageSettings?.width ?? 0,
        imageSettings?.height ?? 0,
      ].join("|"),
    [effectiveLevel, imageSettings, size, trimmed],
  );

  useQrMaskEffect({
    useModuleImage,
    moduleImage,
    qrCanvasRef,
    qrMaskCanvasRef,
    bgColor,
    rerenderKey: maskRerenderKey,
  });

  useGenerateAutoSave({
    addEntry,
    trimmed,
    canGenerate,
    hasUserEditedInput,
    autoSaveDelayMs,
    setSaved,
  });

  const onUploadImageInline = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !file.type.startsWith("image/") || file.size > 1_500_000) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== "string") {
        return;
      }
      setUploadedImage(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const onInputChange = (nextInput: string) => {
    setInput(clampInput(nextInput));
    setHasUserEditedInput(true);
    setSaved(null);
  };

  const onPaste = () => {
    void navigator.clipboard
      .readText()
      .then((text) => {
        if (!text) {
          return;
        }
        setInput(clampInput(text));
        setHasUserEditedInput(true);
        setSaved(null);
      })
      .catch(() => {});
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
    <section className="flex h-full min-h-0 flex-col gap-2">
      <GenerateInputPanel
        input={input}
        trimmedLength={trimmed.length}
        maxInputLength={MAX_INPUT_LENGTH}
        isAutoSaveEnabled={state.settings.autoSave}
        canGenerate={canGenerate}
        onInputChange={onInputChange}
        onPaste={onPaste}
        onSaveManually={saveManually}
      />

      <GeneratePreviewPanel
        value={trimmed}
        size={size}
        level={effectiveLevel}
        fgColor={fgColor}
        bgColor={bgColor}
        useModuleImage={useModuleImage}
        imageSettings={imageSettings}
        rails={rails}
        qrCanvasRef={qrCanvasRef}
      />

      <GenerateControlsPanel
        fgColor={fgColor}
        bgColor={bgColor}
        size={size}
        uploadedImage={uploadedImage}
        onFgColorChange={setFgColor}
        onBgColorChange={setBgColor}
        onSizeChange={setSize}
        onUploadImage={onUploadImageInline}
        onClearUpload={() => setUploadedImage(null)}
      />

      {saved && (
        <GenerateStatusToast saved={saved} onDismiss={() => setSaved(null)} />
      )}
    </section>
  );
}
