import type { QrEntry } from "../../../types/qr";
import { HistoryEntryCard } from "./HistoryEntryCard";

type HistoryEntriesGridProps = {
  entries: QrEntry[];
  onPreview: (entryId: string) => void;
  onRemove: (entryId: string) => void;
};

export function HistoryEntriesGrid({
  entries,
  onPreview,
  onRemove
}: HistoryEntriesGridProps) {
  return (
    <div className="min-h-0 flex-1 overflow-y-auto pr-1">
      <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-3">
        {entries.map((entry) => (
          <HistoryEntryCard
            key={entry.id}
            entry={entry}
            onPreview={onPreview}
            onRemove={onRemove}
          />
        ))}
      </div>
    </div>
  );
}
