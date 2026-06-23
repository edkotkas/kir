import { PasteIcon, SaveIcon, Surface } from "../../../components";
import { AppTextarea } from "../../../components/ui";

type GenerateInputPanelProps = {
  input: string;
  trimmedLength: number;
  maxInputLength: number;
  isAutoSaveEnabled: boolean;
  canGenerate: boolean;
  onInputChange: (nextInput: string) => void;
  onPaste: () => void;
  onSaveManually: () => void;
};

export function GenerateInputPanel({
  input,
  trimmedLength,
  maxInputLength,
  isAutoSaveEnabled,
  canGenerate,
  onInputChange,
  onPaste,
  onSaveManually
}: GenerateInputPanelProps) {
  return (
    <Surface as="label" className="grid shrink-0 gap-2 rounded-2xl p-3">
      <AppTextarea
        className="resize-none"
        rows={4}
        placeholder="Enter text to generate QR code..."
        value={input}
        onChange={(event) => onInputChange(event.target.value)}
      />
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <button
            type="button"
            title="Paste from clipboard"
            aria-label="Paste from clipboard"
            onClick={onPaste}
            className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-bg-300 text-text-200 transition hover:border-primary-200/40 hover:text-text-100"
          >
            <PasteIcon className="h-3.5 w-3.5" />
          </button>
          {!isAutoSaveEnabled && (
            <button
              type="button"
              title="Save to history"
              aria-label="Save to history"
              onClick={onSaveManually}
              disabled={!canGenerate}
              className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-bg-300 text-text-200 transition hover:border-primary-200/40 hover:text-text-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <SaveIcon className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <span className="text-stone-400">
          {trimmedLength}/{maxInputLength}
        </span>
      </div>
    </Surface>
  );
}
