mod commands;
mod constants;
mod state;
mod tray;
mod window;

use std::sync::atomic::Ordering;
use tauri::{
    menu::{Menu, MenuItem},
    Manager, WindowEvent,
};
use tauri_plugin_autostart::MacosLauncher;

use commands::*;
use constants::*;
use state::AppSettings;
use window::{emit_navigation, position_window_on_startup, save_window_state, SavedWindowState};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_updater::Builder::new().build())
        .manage(AppSettings::new())
        .invoke_handler(tauri::generate_handler![
            set_close_to_tray_on_close,
            set_tray_restore_last_route,
            set_last_route,
            set_auto_start_on_boot,
            is_auto_start_on_boot_enabled,
            set_autostart_show_window
        ])
        .plugin(tauri_plugin_autostart::init(
            MacosLauncher::LaunchAgent,
            Some(vec!["--autostart"]),
        ))
        .setup(|app| {
            let launched_by_autostart = std::env::args().any(|arg| arg == "--autostart");

            app.state::<AppSettings>()
                .load_autostart_show_window(app.handle());

            let generate_item =
                MenuItem::with_id(app, NAV_GENERATE_ID, "Generate", true, None::<&str>)?;
            let settings_item =
                MenuItem::with_id(app, NAV_SETTINGS_ID, "Settings", true, None::<&str>)?;
            let history_item =
                MenuItem::with_id(app, NAV_HISTORY_ID, "History", true, None::<&str>)?;
            let minimize_item =
                MenuItem::with_id(app, WINDOW_MINIMIZE_ID, "Minimize", true, None::<&str>)?;
            let close_item = MenuItem::with_id(app, WINDOW_CLOSE_ID, "Close", true, None::<&str>)?;
            let quit_item = MenuItem::with_id(app, APP_QUIT_ID, "Quit", true, None::<&str>)?;

            let app_menu = Menu::with_items(
                app,
                &[
                    &generate_item,
                    &settings_item,
                    &history_item,
                    &minimize_item,
                    &close_item,
                    &quit_item,
                ],
            )?;
            app.set_menu(app_menu)?;

            if let Some(window) = app.get_webview_window("main") {
                if let Ok(icon) =
                    tauri::image::Image::from_bytes(include_bytes!("../icons/icon.png"))
                {
                    let _ = window.set_icon(icon);
                } else if let Some(icon) = app.default_window_icon().cloned() {
                    let _ = window.set_icon(icon);
                }
                position_window_on_startup(&window, app.handle());
                let show_window = app
                    .state::<AppSettings>()
                    .autostart_show_window
                    .load(Ordering::Relaxed);
                if launched_by_autostart && !show_window {
                    let _ = window.hide();
                } else {
                    let _ = window.show();
                }
            }

            tray::build_tray(app.handle())?;

            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            Ok(())
        })
        .on_window_event(|window, event| match event {
            WindowEvent::Moved(pos) => {
                if let Ok(size) = window.outer_size() {
                    save_window_state(
                        window.app_handle(),
                        &SavedWindowState {
                            x: pos.x,
                            y: pos.y,
                            width: size.width,
                            height: size.height,
                        },
                    );
                }
            }
            WindowEvent::Resized(size) => {
                if let Ok(pos) = window.outer_position() {
                    save_window_state(
                        window.app_handle(),
                        &SavedWindowState {
                            x: pos.x,
                            y: pos.y,
                            width: size.width,
                            height: size.height,
                        },
                    );
                }
            }
            WindowEvent::CloseRequested { api, .. } => {
                let close_to_tray = window
                    .state::<AppSettings>()
                    .close_to_tray_on_close
                    .load(Ordering::Relaxed);
                if close_to_tray {
                    api.prevent_close();
                    let _ = window.hide();
                }
            }
            _ => {}
        })
        .on_menu_event(|app, event| match event.id().as_ref() {
            NAV_GENERATE_ID => emit_navigation(app, "/"),
            NAV_SETTINGS_ID => emit_navigation(app, "/settings"),
            NAV_HISTORY_ID => emit_navigation(app, "/history"),
            WINDOW_MINIMIZE_ID => {
                if let Some(window) = app.get_webview_window("main") {
                    let _ = window.minimize();
                }
            }
            WINDOW_CLOSE_ID => {
                if let Some(window) = app.get_webview_window("main") {
                    let _ = window.close();
                }
            }
            APP_QUIT_ID => app.exit(0),
            _ => {}
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
