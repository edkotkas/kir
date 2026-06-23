import { useEffect, useState } from "react";

export type SavedStatus = {
  ok: boolean;
  message: string;
};

export function useSavedStatus() {
  const [saved, setSaved] = useState<SavedStatus | null>(null);

  useEffect(() => {
    if (!saved) return;
    const timeout = window.setTimeout(() => setSaved(null), 3500);
    return () => window.clearTimeout(timeout);
  }, [saved]);

  return { saved, setSaved };
}
