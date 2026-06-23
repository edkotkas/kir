import { useEffect, useState } from "react";

export type SettingsStatus = {
  ok: boolean;
  message: string;
};

export function useSettingsStatus() {
  const [status, setStatus] = useState<SettingsStatus | null>(null);

  useEffect(() => {
    if (!status) return;
    const timeout = window.setTimeout(() => setStatus(null), 3500);
    return () => window.clearTimeout(timeout);
  }, [status]);

  return { status, setStatus };
}
