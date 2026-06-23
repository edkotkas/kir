import { useQrStore } from "../../store/useQrStore";
import {
  HistorySettingsSection,
  SettingsBackButton,
  SettingsRestoreDefaultsSection,
  SettingsStatusToast,
  StartupSettingsSection,
  WindowBehaviorSettingsSection
} from "./components";
import { DEFAULT_SETTINGS } from "./constants";
import { useSettingsStatus } from "./hooks";

export function SettingsPage() {
  const { state, clearEntries, updateSettings } = useQrStore();
  const { status, setStatus } = useSettingsStatus();

  return (
    <section className="flex min-h-0 flex-col gap-2">
      <SettingsBackButton />

      {status && (
        <SettingsStatusToast
          status={status}
          onDismiss={() => setStatus(null)}
        />
      )}

      <HistorySettingsSection
        settings={state.settings}
        entriesCount={state.entries.length}
        updateSettings={updateSettings}
        onClearHistory={() => {
          clearEntries();
          setStatus({ ok: true, message: "History cleared." });
        }}
      />

      <StartupSettingsSection
        settings={state.settings}
        updateSettings={updateSettings}
      />

      <WindowBehaviorSettingsSection
        settings={state.settings}
        updateSettings={updateSettings}
      />

      <SettingsRestoreDefaultsSection
        onRestoreDefaults={() => {
          updateSettings(DEFAULT_SETTINGS);
          setStatus({ ok: true, message: "Default settings restored." });
        }}
      />
    </section>
  );
}
