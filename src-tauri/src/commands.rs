use std::sync::atomic::Ordering;
use tauri::Manager;
use tauri_plugin_autostart::ManagerExt as AutostartManagerExt;

use crate::state::AppSettings;

#[tauri::command]
pub fn set_close_to_tray_on_close(value: bool, settings: tauri::State<AppSettings>) {
    settings
        .close_to_tray_on_close
        .store(value, Ordering::Relaxed);
}

#[tauri::command]
pub fn set_tray_restore_last_route(value: bool, settings: tauri::State<AppSettings>) {
    settings
        .tray_restore_last_route
        .store(value, Ordering::Relaxed);
}

#[tauri::command]
pub fn set_last_route(path: String, settings: tauri::State<AppSettings>) {
    let normalized = if path.starts_with('/') {
        path
    } else {
        "/".to_string()
    };
    if let Ok(mut route) = settings.last_route.lock() {
        *route = normalized;
    }
}

#[tauri::command]
pub fn set_auto_start_on_boot(value: bool, app: tauri::AppHandle) -> Result<(), String> {
    if value {
        app.autolaunch().enable().map_err(|e| e.to_string())
    } else {
        app.autolaunch().disable().map_err(|e| e.to_string())
    }
}

#[tauri::command]
pub fn is_auto_start_on_boot_enabled(app: tauri::AppHandle) -> Result<bool, String> {
    app.autolaunch().is_enabled().map_err(|e| e.to_string())
}

#[tauri::command]
pub fn set_autostart_show_window(
    value: bool,
    app: tauri::AppHandle,
    settings: tauri::State<AppSettings>,
) -> Result<(), String> {
    settings
        .autostart_show_window
        .store(value, Ordering::Relaxed);
    if let Ok(dir) = app.path().app_data_dir() {
        let _ = std::fs::create_dir_all(&dir);
        let _ = std::fs::write(
            dir.join("autostart-show-window"),
            if value { "true" } else { "false" },
        );
    }
    Ok(())
}
