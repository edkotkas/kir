import { QRCodeCanvas } from "qrcode.react";
import { useNavigate } from "react-router";

import {
  IconButton,
  PencilIcon,
  Surface,
  TrashIcon,
  ZoomIcon,
} from "../../../components";
import type { QrEntry } from "../../../types/qr";
import { formatHistoryDate } from "../utils/formatDate";

const PREVIEW_SIZE = 72;

type HistoryEntryCardProps = {
  entry: QrEntry;
  onPreview: (entryId: string) => void;
  onRemove: (entryId: string) => void;
};

export function HistoryEntryCard({
  entry,
  onPreview,
  onRemove,
}: HistoryEntryCardProps) {
  const navigate = useNavigate();

  return (
    <Surface
      as="article"
      key={entry.id}
      className="flex min-h-32 gap-3 rounded-2xl p-3"
    >
      <button
        type="button"
        onClick={() => onPreview(entry.id)}
        className="group relative flex shrink-0 self-stretch items-center justify-center overflow-hidden rounded-xl border border-stone-600 bg-stone-900/70 p-1.5 transition hover:border-primary-200"
        title="Preview QR code"
      >
        <QRCodeCanvas
          className="qr-code-media block rounded-md"
          value={entry.data}
          size={PREVIEW_SIZE}
          marginSize={1}
          level="H"
        />
        <span className="absolute inset-0 flex items-center justify-center rounded-xl bg-bg-100/75 opacity-0 transition-opacity group-hover:opacity-100">
          <ZoomIcon className="h-5 w-5 text-primary-200" />
        </span>
      </button>

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div
          data-allow-context-menu="true"
          className="max-h-20 min-w-0 flex-1 overflow-y-auto rounded-lg border border-stone-700/70 bg-stone-900/40 px-2 py-1.5"
        >
          <pre className="whitespace-pre-wrap break-all text-xs leading-5 text-stone-100">
            {entry.data}
          </pre>
        </div>

        <div className="flex items-center justify-between gap-2">
          <p className="text-right text-xs text-stone-400">
            {formatHistoryDate(entry.createdAt)}
          </p>

          <div className="flex items-center gap-2">
            <IconButton
              label="Edit saved QR item"
              onClick={() =>
                navigate("/", {
                  state: {
                    editEntry: { id: entry.id, data: entry.data },
                  },
                })
              }
              type="button"
            >
              <PencilIcon />
            </IconButton>
            <IconButton
              label="Remove saved QR item"
              onClick={() => onRemove(entry.id)}
              type="button"
              className="border-accent-100/70 bg-accent-200/45 text-primary-300 hover:border-primary-200 hover:bg-accent-200/70 hover:text-text-100"
            >
              <TrashIcon />
            </IconButton>
          </div>
        </div>
      </div>
    </Surface>
  );
}
