import { createContext } from "react";

export interface QrEntry {
  id: string;
  data: string;
  createdAt: string;
}

export interface Settings {
  maxHistory: number;
  autoSave: boolean;
  autoSaveDelaySeconds: number;
  closeToTrayOnClose: boolean;
  trayRestoreLastRoute: boolean;
  autoStartOnBoot: boolean;
  autoStartShowWindow: boolean;
}

export interface QrState {
  entries: QrEntry[];
  settings: Settings;
  lastSavedAt: number | null;
}

export interface QrStoreValue {
  state: QrState;
  addEntry: (
    data: string,
    options?: { bypassAutoSave?: boolean },
  ) => { saved: boolean; reason?: string };
  removeEntry: (id: string) => void;
  clearEntries: () => void;
  updateSettings: (updates: Partial<Settings>) => void;
}

export const QrStoreContext = createContext<QrStoreValue | undefined>(
  undefined,
);
