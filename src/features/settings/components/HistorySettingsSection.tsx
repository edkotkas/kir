import { AppButton, AppInput, Surface } from "../../../components";
import type { Settings } from "../../../types/qr";

type HistorySettingsSectionProps = {
  settings: Settings;
  entriesCount: number;
  updateSettings: (updates: Partial<Settings>) => void;
  onClearHistory: () => void;
};

export function HistorySettingsSection({
  settings,
  entriesCount,
  updateSettings,
  onClearHistory,
}: HistorySettingsSectionProps) {
  return (
    <Surface className="grid gap-2 rounded-2xl p-2">
      <span className="font-medium text-stone-200">History</span>
      <label className="inline-flex items-center gap-2 text-sm text-stone-300">
        <input
          className="h-4 w-4 accent-primary-200"
          type="checkbox"
          checked={settings.autoSave}
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
            value={settings.maxHistory}
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
            value={settings.autoSaveDelaySeconds}
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
          onClick={onClearHistory}
          disabled={entriesCount === 0}
          className="text-sm"
        >
          Clear all history
        </AppButton>
      </div>
    </Surface>
  );
}
