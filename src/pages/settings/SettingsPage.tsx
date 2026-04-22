import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

import {
  AppButton,
  AppInput,
  BackIcon,
  CloseIcon,
  Surface,
} from "../../components";
import { cn } from "../../helpers/class-name";
import { useQrStore } from "../../state/useQrStore";

const DEFAULT_SETTINGS = {
  maxHistory: 50,
  autoSave: true,
  autoSaveDelaySeconds: 1,
  closeToTrayOnClose: true,
  trayRestoreLastRoute: true,
  autoStartOnBoot: false,
  autoStartShowWindow: false,
};

export function SettingsPage() {
  const { state, clearEntries, updateSettings } = useQrStore();
  const navigate = useNavigate();
  const [status, setStatus] = useState<{
    ok: boolean;
    message: string;
  } | null>(null);

  useEffect(() => {
    if (!status) return;
    const t = window.setTimeout(() => setStatus(null), 3500);
    return () => window.clearTimeout(t);
  }, [status]);

  return (
    <section className="flex min-h-0 flex-col gap-2">
      <button
        type="button"
        onClick={() => navigate("/")}
        className="inline-flex w-fit items-center gap-1.5 text-sm text-stone-400 transition hover:text-stone-100"
      >
        <BackIcon className="h-4 w-4" />
        Back
      </button>
      {status && (
        <div
          className={cn(
            "fixed bottom-4 left-4 right-4 z-50 rounded-xl border px-3 py-2 text-sm shadow-lg backdrop-blur-sm toast-enter",
            status.ok
              ? "border-primary-200/60 bg-bg-200/95 text-primary-300"
              : "border-accent-100/60 bg-bg-300/95 text-text-100",
          )}
        >
          <div className="flex items-start justify-between gap-3">
            <span>{status.message}</span>
            <button
              type="button"
              aria-label="Dismiss message"
              title="Dismiss"
              onClick={() => setStatus(null)}
              className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-current/40 text-current/90 hover:bg-black/20"
            >
              <CloseIcon className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      <Surface className="grid gap-2 rounded-2xl p-2">
        <span className="font-medium text-stone-200">History</span>
        <label className="inline-flex items-center gap-2 text-sm text-stone-300">
          <input
            className="h-4 w-4 accent-primary-200"
            type="checkbox"
            checked={state.settings.autoSave}
            onChange={(event) =>
              updateSettings({ autoSave: event.target.checked })
            }
          />
          Auto save new entries to history
        </label>
        <div className="mt-1 grid gap-3 sm:grid-cols-2">
          <label className="grid gap-1.5 text-sm text-stone-300">
            Max history items
            <AppInput
              type="number"
              min={5}
              max={500}
              value={state.settings.maxHistory}
              onChange={(event) => {
                const value = Number(event.target.value);
                if (!Number.isNaN(value)) {
                  updateSettings({ maxHistory: value });
                }
              }}
            />
          </label>
          <label className="grid gap-1.5 text-sm text-stone-300">
            Auto save delay (seconds)
            <AppInput
              type="number"
              min={1}
              max={30}
              value={state.settings.autoSaveDelaySeconds}
              onChange={(event) => {
                const value = Number(event.target.value);
                if (!Number.isNaN(value)) {
                  updateSettings({ autoSaveDelaySeconds: value });
                }
              }}
            />
          </label>
        </div>
        <div className="mt-1 flex items-center text-sm">
          <AppButton
            type="button"
            onClick={() => {
              clearEntries();
              setStatus({ ok: true, message: "History cleared." });
            }}
            disabled={state.entries.length === 0}
            className="text-sm"
          >
            Clear all history
          </AppButton>
        </div>
      </Surface>

      <Surface className="grid gap-2 rounded-2xl p-2">
        <span className="font-medium text-stone-200">Startup</span>
        <label className="inline-flex items-center gap-2 text-sm text-stone-300">
          <input
            className="h-4 w-4 accent-primary-200"
            type="checkbox"
            checked={state.settings.autoStartOnBoot}
            onChange={(event) =>
              updateSettings({ autoStartOnBoot: event.target.checked })
            }
          />
          Auto start app on system boot
        </label>
        <label
          className={cn(
            "inline-flex items-center gap-2 text-sm transition",
            state.settings.autoStartOnBoot
              ? "text-stone-300"
              : "cursor-not-allowed text-stone-600",
          )}
        >
          <input
            className="h-4 w-4 accent-primary-200"
            type="checkbox"
            disabled={!state.settings.autoStartOnBoot}
            checked={state.settings.autoStartShowWindow}
            onChange={(event) =>
              updateSettings({ autoStartShowWindow: event.target.checked })
            }
          />
          Show window on startup
        </label>
      </Surface>

      <Surface className="grid gap-2 rounded-2xl p-2">
        <span className="font-medium text-stone-200">
          Window close behavior
        </span>
        <label className="inline-flex items-center gap-2 text-sm text-stone-300">
          <input
            className="h-4 w-4 accent-primary-200"
            type="checkbox"
            checked={state.settings.closeToTrayOnClose}
            onChange={(event) =>
              updateSettings({ closeToTrayOnClose: event.target.checked })
            }
          />
          Close to tray
        </label>
        <label className="inline-flex items-center gap-2 text-sm text-stone-300">
          <input
            className="h-4 w-4 accent-primary-200"
            type="checkbox"
            checked={state.settings.trayRestoreLastRoute}
            onChange={(event) =>
              updateSettings({ trayRestoreLastRoute: event.target.checked })
            }
          />
          Open last window page
        </label>
      </Surface>

      <Surface className="flex justify-start rounded-2xl p-2">
        <AppButton
          type="button"
          onClick={() => {
            updateSettings(DEFAULT_SETTINGS);
            setStatus({ ok: true, message: "Default settings restored." });
          }}
          className="text-sm"
        >
          Restore defaults
        </AppButton>
      </Surface>
    </section>
  );
}
