import { Surface } from "../../../components";
import type { Settings } from "../../../types/qr";
import { cn } from "../../../utils/class-name";

type StartupSettingsSectionProps = {
  settings: Settings;
  updateSettings: (updates: Partial<Settings>) => void;
};

export function StartupSettingsSection({
  settings,
  updateSettings
}: StartupSettingsSectionProps) {
  return (
    <Surface className="grid gap-2 rounded-2xl p-2">
      <span className="font-medium text-stone-200">Startup</span>
      <label className="inline-flex items-center gap-2 text-sm text-stone-300">
        <input
          className="h-4 w-4 accent-primary-200"
          type="checkbox"
          checked={settings.autoStartOnBoot}
          onChange={(event) =>
            updateSettings({ autoStartOnBoot: event.target.checked })
          }
        />
        Auto start app on system boot
      </label>
      <label
        className={cn(
          "inline-flex items-center gap-2 text-sm transition",
          settings.autoStartOnBoot
            ? "text-stone-300"
            : "cursor-not-allowed text-stone-600"
        )}
      >
        <input
          className="h-4 w-4 accent-primary-200"
          type="checkbox"
          disabled={!settings.autoStartOnBoot}
          checked={settings.autoStartShowWindow}
          onChange={(event) =>
            updateSettings({ autoStartShowWindow: event.target.checked })
          }
        />
        Show window on startup
      </label>
    </Surface>
  );
}
