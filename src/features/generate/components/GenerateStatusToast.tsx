import { CloseIcon } from "../../../components";
import { cn } from "../../../utils/class-name";
import type { SavedStatus } from "../hooks/useSavedStatus";

type GenerateStatusToastProps = {
  saved: SavedStatus;
  onDismiss: () => void;
};

export function GenerateStatusToast({
  saved,
  onDismiss
}: GenerateStatusToastProps) {
  return (
    <div
      className={cn(
        "fixed bottom-4 left-4 right-4 z-50 rounded-xl border px-3 py-2 text-sm shadow-lg backdrop-blur-sm toast-enter",
        saved.ok
          ? "border-primary-200/60 bg-bg-200/95 text-primary-300"
          : "border-accent-100/60 bg-bg-300/95 text-text-100"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <span>{saved.message}</span>
        <button
          type="button"
          aria-label="Dismiss message"
          title="Dismiss"
          onClick={onDismiss}
          className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-current/40 text-current/90 hover:bg-black/20"
        >
          <CloseIcon className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
