import { QRCodeCanvas } from "qrcode.react";
import type { MouseEvent } from "react";

import { CloseIcon, Surface } from "../../../components";
import type { QrEntry } from "../../../types/qr";

const DETAIL_SIZE = 300;

type HistoryPreviewModalProps = {
  activeEntry: QrEntry;
  onClose: () => void;
};

export function HistoryPreviewModal({
  activeEntry,
  onClose
}: HistoryPreviewModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <Surface
        className="relative flex w-72 flex-col gap-3 rounded-2xl p-4"
        onClick={(event: MouseEvent) => event.stopPropagation()}
      >
        <div className="flex justify-end">
          <button
            type="button"
            aria-label="Close preview"
            title="Close"
            onClick={onClose}
            className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-stone-600 bg-bg-200/90 text-stone-400 hover:border-primary-200 hover:text-text-100"
          >
            <CloseIcon className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="flex justify-center rounded-xl border border-stone-700 bg-stone-900/60 p-3">
          <QRCodeCanvas
            value={activeEntry.data}
            size={DETAIL_SIZE}
            marginSize={1}
            level="H"
            className="qr-code-media rounded-md"
          />
        </div>

        <div
          data-allow-context-menu="true"
          className="max-h-24 overflow-y-auto rounded-lg border border-stone-700/70 bg-stone-900/40 px-2 py-1.5"
        >
          <pre className="whitespace-pre-wrap break-all text-xs leading-5 text-stone-100">
            {activeEntry.data}
          </pre>
        </div>
      </Surface>
    </div>
  );
}
