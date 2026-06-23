import { useEffect, useMemo, useState } from "react";
import type { QrEntry } from "../../../types/qr";

export function useHistoryPreview(entries: QrEntry[]) {
  const [activeEntryId, setActiveEntryId] = useState<null | string>(null);

  const activeEntry = useMemo(
    () => entries.find((entry) => entry.id === activeEntryId) ?? null,
    [activeEntryId, entries]
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

  return { activeEntry, setActiveEntryId };
}
