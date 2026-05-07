import { QRCodeCanvas } from "qrcode.react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";

import {
  BackIcon,
  CloseIcon,
  IconButton,
  PencilIcon,
  Surface,
  TrashIcon,
  ZoomIcon,
} from "../../components";
import { useQrStore } from "../../store/useQrStore";

const PREVIEW_SIZE = 72;
const DETAIL_SIZE = 300;

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function HistoryPage() {
  const { state, removeEntry } = useQrStore();
  const [activeEntryId, setActiveEntryId] = useState<null | string>(null);
  const navigate = useNavigate();

  const activeEntry = useMemo(
    () => state.entries.find((entry) => entry.id === activeEntryId) ?? null,
    [activeEntryId, state.entries],
  );

  useEffect(() => {
    if (!activeEntryId) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActiveEntryId(null);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [activeEntryId]);

  return (
    <section className="flex h-full min-h-0 flex-col gap-4">
      <button
        type="button"
        onClick={() => navigate("/")}
        className="inline-flex w-fit items-center gap-1.5 text-sm text-stone-400 transition hover:text-stone-100"
      >
        <BackIcon className="h-4 w-4" />
        Back
      </button>

      {state.entries.length === 0 ? (
        <Surface className="px-3 py-2 text-stone-300">
          No saved entries yet. Create a QR code on the Generate page.
        </Surface>
      ) : (
        <div className="min-h-0 flex-1 overflow-y-auto pr-1">
          <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-3">
            {state.entries.map((entry) => (
              <Surface
                as="article"
                key={entry.id}
                className="flex min-h-32 gap-3 rounded-2xl p-3"
              >
                <button
                  type="button"
                  onClick={() => setActiveEntryId(entry.id)}
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
                      {formatDate(entry.createdAt)}
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
                        onClick={() => removeEntry(entry.id)}
                        type="button"
                        className="border-accent-100/70 bg-accent-200/45 text-primary-300 hover:border-primary-200 hover:bg-accent-200/70 hover:text-text-100"
                      >
                        <TrashIcon />
                      </IconButton>
                    </div>
                  </div>
                </div>
              </Surface>
            ))}
          </div>
        </div>
      )}

      {activeEntry && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => setActiveEntryId(null)}
        >
          <Surface
            className="relative flex w-72 flex-col gap-3 rounded-2xl p-4"
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
          >
            <div className="flex justify-end">
              <button
                type="button"
                aria-label="Close preview"
                title="Close"
                onClick={() => setActiveEntryId(null)}
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
      )}
    </section>
  );
}
