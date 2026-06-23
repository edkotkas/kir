import type { Settings } from "../../../types/qr";

export const DEFAULT_SETTINGS: Settings = {
  maxHistory: 50,
  autoSave: true,
  autoSaveDelaySeconds: 1,
  closeToTrayOnClose: true,
  trayRestoreLastRoute: true,
  autoStartOnBoot: false,
  autoStartShowWindow: false,
};
