import { Surface } from "../../../components";
import type { Settings } from "../../../types/qr";

type WindowBehaviorSettingsSectionProps = {
  settings: Settings;
  updateSettings: (updates: Partial<Settings>) => void;
};

export function WindowBehaviorSettingsSection({
  settings,
  updateSettings,
}: WindowBehaviorSettingsSectionProps) {
  return (
    <Surface className="grid gap-2 rounded-2xl p-2">
      <span className="font-medium text-stone-200">Window close behavior</span>
      <label className="inline-flex items-center gap-2 text-sm text-stone-300">
        <input
          className="h-4 w-4 accent-primary-200"
          type="checkbox"
          checked={settings.closeToTrayOnClose}
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
          checked={settings.trayRestoreLastRoute}
          onChange={(event) =>
            updateSettings({ trayRestoreLastRoute: event.target.checked })
          }
        />
        Open last window page
      </label>
    </Surface>
  );
}
