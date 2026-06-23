import { useQrStore } from "../../store/useQrStore";
import {
  HistoryEmptyState,
  HistoryEntriesGrid,
  HistoryHeader,
  HistoryPreviewModal,
} from "./components";
import { useHistoryPreview } from "./hooks";

export function HistoryPage() {
  const { state, removeEntry } = useQrStore();
  const { activeEntry, setActiveEntryId } = useHistoryPreview(state.entries);

  return (
    <section className="flex h-full min-h-0 flex-col gap-4">
      <HistoryHeader />

      {state.entries.length === 0 ? (
        <HistoryEmptyState />
      ) : (
        <HistoryEntriesGrid
          entries={state.entries}
          onPreview={setActiveEntryId}
          onRemove={removeEntry}
        />
      )}

      {activeEntry && (
        <HistoryPreviewModal
          activeEntry={activeEntry}
          onClose={() => setActiveEntryId(null)}
        />
      )}
    </section>
  );
}
