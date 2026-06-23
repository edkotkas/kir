import { AppButton, Surface } from "../../../components";

type SettingsRestoreDefaultsSectionProps = {
  onRestoreDefaults: () => void;
};

export function SettingsRestoreDefaultsSection({
  onRestoreDefaults,
}: SettingsRestoreDefaultsSectionProps) {
  return (
    <Surface className="flex justify-start rounded-2xl p-2">
      <AppButton type="button" onClick={onRestoreDefaults} className="text-sm">
        Restore defaults
      </AppButton>
    </Surface>
  );
}
