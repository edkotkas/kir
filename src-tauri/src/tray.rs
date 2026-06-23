use std::sync::atomic::Ordering;
use tauri::Manager;
use tauri::{
    menu::{Menu, MenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    Emitter,
};

use crate::constants::*;
use crate::state::AppSettings;
use crate::window::emit_navigation;

pub fn toggle_window_visibility(app: &tauri::AppHandle, settings: &AppSettings) {
    if let Some(window) = app.get_webview_window("main") {
        let is_minimized = window.is_minimized().unwrap_or(false);
        let is_visible = window.is_visible().unwrap_or(false);

        if is_visible && !is_minimized {
            let _ = window.hide();
            return;
        }

        let _ = window.unminimize();
        let _ = window.show();
        let _ = window.set_focus();

        if settings.tray_restore_last_route.load(Ordering::Relaxed) {
            let path = settings
                .last_route
                .lock()
                .map(|route| route.clone())
                .unwrap_or_else(|_| "/".to_string());
            let _ = window.emit("app:navigate", path);
        }
    }
}

pub fn build_tray(app: &tauri::AppHandle) -> tauri::Result<()> {
    let settings_item = MenuItem::with_id(app, NAV_SETTINGS_ID, "Settings", true, None::<&str>)?;
    let history_item = MenuItem::with_id(app, NAV_HISTORY_ID, "History", true, None::<&str>)?;
    let quit_item = MenuItem::with_id(app, APP_QUIT_ID, "Quit", true, None::<&str>)?;

    let tray_menu = Menu::with_items(app, &[&settings_item, &history_item, &quit_item])?;

    let mut tray_builder = TrayIconBuilder::new()
        .menu(&tray_menu)
        .show_menu_on_left_click(false)
        .on_tray_icon_event(|tray, event| {
            if let TrayIconEvent::Click {
                button: MouseButton::Left,
                button_state: MouseButtonState::Up,
                ..
            } = event
            {
                let app_handle = tray.app_handle();
                toggle_window_visibility(&app_handle, app_handle.state::<AppSettings>().inner());
            }
        })
        .on_menu_event(|app, event| match event.id.as_ref() {
            NAV_GENERATE_ID => emit_navigation(app, "/"),
            NAV_SETTINGS_ID => emit_navigation(app, "/settings"),
            NAV_HISTORY_ID => emit_navigation(app, "/history"),
            APP_QUIT_ID => app.exit(0),
            _ => {}
        });

    if let Ok(icon) = tauri::image::Image::from_bytes(include_bytes!("../icons/icon.png")) {
        tray_builder = tray_builder.icon(icon);
    } else if let Some(icon) = app.default_window_icon().cloned() {
        tray_builder = tray_builder.icon(icon);
    }

    tray_builder.build(app)?;
    Ok(())
}
