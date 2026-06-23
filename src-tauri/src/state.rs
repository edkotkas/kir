use std::sync::{
  atomic::{AtomicBool, Ordering},
  Mutex,
};
use tauri::Manager;

pub struct AppSettings {
  pub close_to_tray_on_close: AtomicBool,
  pub tray_restore_last_route: AtomicBool,
  pub autostart_show_window: AtomicBool,
  pub last_route: Mutex<String>,
}

impl AppSettings {
  pub fn new() -> Self {
    Self {
      close_to_tray_on_close: AtomicBool::new(true),
      tray_restore_last_route: AtomicBool::new(true),
      autostart_show_window: AtomicBool::new(false),
      last_route: Mutex::new("/".to_string()),
    }
  }

  pub fn load_autostart_show_window(&self, app: &tauri::AppHandle) {
    if let Ok(dir) = app.path().app_data_dir() {
      if let Ok(val) = std::fs::read_to_string(dir.join("autostart-show-window")) {
        self
          .autostart_show_window
          .store(val.trim() == "true", Ordering::Relaxed);
      }
    }
  }
}
