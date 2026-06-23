use serde::{Deserialize, Serialize};
use tauri::{Emitter, Manager, PhysicalPosition, PhysicalSize};

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct SavedWindowState {
    pub x: i32,
    pub y: i32,
    pub width: u32,
    pub height: u32,
}

pub fn window_state_path(app: &tauri::AppHandle) -> Option<std::path::PathBuf> {
    app.path()
        .app_data_dir()
        .ok()
        .map(|dir| dir.join("window-state.json"))
}

pub fn load_window_state(app: &tauri::AppHandle) -> Option<SavedWindowState> {
    let path = window_state_path(app)?;
    let raw = std::fs::read_to_string(&path).ok()?;
    serde_json::from_str(&raw).ok()
}

pub fn save_window_state(app: &tauri::AppHandle, state: &SavedWindowState) {
    if let Some(path) = window_state_path(app) {
        if let Some(parent) = path.parent() {
            let _ = std::fs::create_dir_all(parent);
        }
        if let Ok(json) = serde_json::to_string(state) {
            let _ = std::fs::write(path, json);
        }
    }
}

pub fn position_window_on_startup(window: &tauri::WebviewWindow, app: &tauri::AppHandle) {
    let monitors = window.available_monitors().unwrap_or_default();

    if let Some(saved) = load_window_state(app) {
        let on_valid_monitor = monitors.iter().any(|m| {
            let pos = m.position();
            let size = m.size();
            saved.x >= pos.x
                && saved.y >= pos.y
                && saved.x < pos.x + size.width as i32
                && saved.y < pos.y + size.height as i32
        });

        if on_valid_monitor {
            let _ = window.set_size(PhysicalSize::new(saved.width, saved.height));
            let _ = window.set_position(PhysicalPosition::new(saved.x, saved.y));
            return;
        }
    }

    let cursor = window.cursor_position().unwrap_or(PhysicalPosition {
        x: 0.0_f64,
        y: 0.0_f64,
    });

    let target_monitor = monitors
        .iter()
        .find(|m| {
            let pos = m.position();
            let size = m.size();
            (cursor.x as i32) >= pos.x
                && (cursor.y as i32) >= pos.y
                && (cursor.x as i32) < pos.x + size.width as i32
                && (cursor.y as i32) < pos.y + size.height as i32
        })
        .or_else(|| monitors.first());

    if let Some(monitor) = target_monitor {
        let pos = monitor.position();
        let size = monitor.size();
        let win_w = window.outer_size().map(|s| s.width).unwrap_or(360);
        let win_h = window.outer_size().map(|s| s.height).unwrap_or(640);
        let x = pos.x + ((size.width as i32 - win_w as i32) / 2).max(0);
        let y = pos.y + ((size.height as i32 - win_h as i32) / 2).max(0);
        let _ = window.set_position(PhysicalPosition::new(x, y));
    }
}

pub fn emit_navigation(app: &tauri::AppHandle, path: &str) {
    if let Some(window) = app.get_webview_window("main") {
        let _ = window.unminimize();
        let _ = window.show();
        let _ = window.set_focus();
        let _ = window.emit("app:navigate", path.to_string());
    }
}
