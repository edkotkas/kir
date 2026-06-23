import { invoke } from "@tauri-apps/api/core";
import type { ReactNode } from "react";
import { useCallback, useEffect, useMemo, useReducer, useRef } from "react";
import {
  QrStoreContext,
  type QrEntry,
  type QrState,
  type QrStoreValue,
  type Settings
} from "../types/qr";

const STORAGE_KEY = "offline-qr-reader-state";

const defaultSettings: Settings = {
  maxHistory: 50,
  autoSave: true,
  autoSaveDelaySeconds: 1,
  closeToTrayOnClose: true,
  trayRestoreLastRoute: true,
  autoStartOnBoot: false,
  autoStartShowWindow: false
};

const isTauri =
  typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;

const initialState: QrState = {
  entries: [],
  settings: defaultSettings,
  lastSavedAt: null
};

type Action =
  | { type: "ADD_ENTRY"; payload: QrEntry }
  | { type: "REMOVE_ENTRY"; payload: { id: string } }
  | { type: "CLEAR_ENTRIES" }
  | { type: "UPDATE_SETTINGS"; payload: Partial<Settings> };

function loadState(): QrState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return initialState;
    }

    const parsed = JSON.parse(raw) as QrState;

    return {
      entries: Array.isArray(parsed.entries) ? parsed.entries : [],
      settings: {
        ...defaultSettings,
        ...parsed.settings
      },
      lastSavedAt: null
    };
  } catch {
    return initialState;
  }
}

function saveState(state: QrState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function reducer(state: QrState, action: Action): QrState {
  switch (action.type) {
    case "ADD_ENTRY": {
      const entries = [action.payload, ...state.entries].slice(
        0,
        state.settings.maxHistory
      );
      return { ...state, entries, lastSavedAt: Date.now() };
    }
    case "REMOVE_ENTRY": {
      const entries = state.entries.filter(
        (entry) => entry.id !== action.payload.id
      );
      return { ...state, entries };
    }
    case "CLEAR_ENTRIES": {
      return { ...state, entries: [] };
    }
    case "UPDATE_SETTINGS": {
      const settings = { ...state.settings, ...action.payload };
      const entries = state.entries.slice(0, settings.maxHistory);
      return { ...state, settings, entries };
    }
    default:
      return state;
  }
}

export function QrStoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadState);
  const stateRef = useRef(state);

  useEffect(() => {
    stateRef.current = state;
    saveState(state);
  }, [state]);

  useEffect(() => {
    if (!isTauri) {
      return;
    }

    void invoke("set_close_to_tray_on_close", {
      value: state.settings.closeToTrayOnClose
    });
  }, [state.settings.closeToTrayOnClose]);

  useEffect(() => {
    if (!isTauri) {
      return;
    }

    void invoke("set_tray_restore_last_route", {
      value: state.settings.trayRestoreLastRoute
    });
  }, [state.settings.trayRestoreLastRoute]);

  useEffect(() => {
    if (!isTauri) {
      return;
    }

    void invoke("set_auto_start_on_boot", {
      value: state.settings.autoStartOnBoot
    });
  }, [state.settings.autoStartOnBoot]);

  useEffect(() => {
    if (!isTauri) {
      return;
    }

    void invoke("set_autostart_show_window", {
      value: state.settings.autoStartShowWindow
    });
  }, [state.settings.autoStartShowWindow]);

  const addEntry = useCallback(
    (data: string, options?: { bypassAutoSave?: boolean }) => {
      const currentState = stateRef.current;

      if (!options?.bypassAutoSave && !currentState.settings.autoSave) {
        return { saved: false, reason: "Autosave is disabled in settings." };
      }

      dispatch({
        type: "ADD_ENTRY",
        payload: {
          id: crypto.randomUUID(),
          data,
          createdAt: new Date().toISOString()
        }
      });

      return { saved: true };
    },
    []
  );

  const removeEntry = useCallback((id: string) => {
    dispatch({ type: "REMOVE_ENTRY", payload: { id } });
  }, []);

  const clearEntries = useCallback(() => {
    dispatch({ type: "CLEAR_ENTRIES" });
  }, []);

  const updateSettings = useCallback((updates: Partial<Settings>) => {
    dispatch({ type: "UPDATE_SETTINGS", payload: updates });
  }, []);

  const value = useMemo<QrStoreValue>(
    () => ({
      state,
      addEntry,
      removeEntry,
      clearEntries,
      updateSettings
    }),
    [state, addEntry, removeEntry, clearEntries, updateSettings]
  );

  return (
    <QrStoreContext.Provider value={value}>{children}</QrStoreContext.Provider>
  );
}
