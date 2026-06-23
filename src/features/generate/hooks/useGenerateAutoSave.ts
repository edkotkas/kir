import { useEffect, useRef } from "react";

import type { SavedStatus } from "./useSavedStatus";

type UseGenerateAutoSaveInput = {
  addEntry: (
    data: string,
    options?: { bypassAutoSave?: boolean },
  ) => { saved: boolean; reason?: string };
  trimmed: string;
  canGenerate: boolean;
  hasUserEditedInput: boolean;
  autoSaveDelayMs: number;
  setSaved: (status: SavedStatus) => void;
};

export function useGenerateAutoSave({
  addEntry,
  trimmed,
  canGenerate,
  hasUserEditedInput,
  autoSaveDelayMs,
  setSaved,
}: UseGenerateAutoSaveInput) {
  const saveTimeoutRef = useRef<number | null>(null);

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
  }, [
    addEntry,
    autoSaveDelayMs,
    canGenerate,
    hasUserEditedInput,
    setSaved,
    trimmed,
  ]);
}
