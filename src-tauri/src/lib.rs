use serde::{Deserialize, Serialize};
use tauri::{
  menu::{Menu, MenuItem},
  tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
  Emitter, Manager, PhysicalPosition, PhysicalSize, WindowEvent,
};
use tauri_plugin_autostart::{MacosLauncher, ManagerExt as AutostartManagerExt};
use std::sync::{
  atomic::{AtomicBool, Ordering},
  Mutex,
};

const NAV_GENERATE_ID: &str = "nav_generate";
const NAV_SETTINGS_ID: &str = "nav_settings";
const NAV_HISTORY_ID: &str = "nav_history";
const WINDOW_MINIMIZE_ID: &str = "window_minimize";
const WINDOW_CLOSE_ID: &str = "window_close";
const APP_QUIT_ID: &str = "app_quit";

struct AppSettings {
  close_to_tray_on_close: AtomicBool,
  tray_restore_last_route: AtomicBool,
  autostart_show_window: AtomicBool,
  last_route: Mutex<String>,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
struct SavedWindowState {
  x: i32,
  y: i32,
  width: u32,
  height: u32,
}

fn window_state_path(app: &tauri::AppHandle) -> Option<std::path::PathBuf> {
  app.path().app_data_dir().ok().map(|dir| dir.join("window-state.json"))
}

fn load_window_state(app: &tauri::AppHandle) -> Option<SavedWindowState> {
  let path = window_state_path(app)?;
  let raw = std::fs::read_to_string(&path).ok()?;
  serde_json::from_str(&raw).ok()
}

fn save_window_state(app: &tauri::AppHandle, state: &SavedWindowState) {
  if let Some(path) = window_state_path(app) {
    if let Some(parent) = path.parent() {
      let _ = std::fs::create_dir_all(parent);
    }
    if let Ok(json) = serde_json::to_string(state) {
      let _ = std::fs::write(path, json);
    }
  }
}

#[tauri::command]
fn set_close_to_tray_on_close(value: bool, settings: tauri::State<AppSettings>) {
  settings.close_to_tray_on_close.store(value, Ordering::Relaxed);
}

#[tauri::command]
fn set_tray_restore_last_route(value: bool, settings: tauri::State<AppSettings>) {
  settings.tray_restore_last_route.store(value, Ordering::Relaxed);
}

#[tauri::command]
fn set_last_route(path: String, settings: tauri::State<AppSettings>) {
  let normalized = if path.starts_with('/') { path } else { "/".to_string() };
  if let Ok(mut route) = settings.last_route.lock() {
    *route = normalized;
  }
}

#[tauri::command]
fn set_auto_start_on_boot(value: bool, app: tauri::AppHandle) -> Result<(), String> {
  if value {
    app
      .autolaunch()
      .enable()
      .map_err(|error| error.to_string())
  } else {
    app
      .autolaunch()
      .disable()
      .map_err(|error| error.to_string())
  }
}

#[tauri::command]
fn set_autostart_show_window(
  value: bool,
  app: tauri::AppHandle,
  settings: tauri::State<AppSettings>,
) -> Result<(), String> {
  settings.autostart_show_window.store(value, Ordering::Relaxed);
  if let Ok(dir) = app.path().app_data_dir() {
    let _ = std::fs::create_dir_all(&dir);
    let _ = std::fs::write(
      dir.join("autostart-show-window"),
      if value { "true" } else { "false" },
    );
  }
  Ok(())
}

#[tauri::command]
fn is_auto_start_on_boot_enabled(app: tauri::AppHandle) -> Result<bool, String> {
  app
    .autolaunch()
    .is_enabled()
    .map_err(|error| error.to_string())
}

fn toggle_window_visibility(app: &tauri::AppHandle, settings: &AppSettings) {
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

fn emit_navigation(app: &tauri::AppHandle, path: &str) {
  if let Some(window) = app.get_webview_window("main") {
    let _ = window.unminimize();
    let _ = window.show();
    let _ = window.set_focus();
    let _ = window.emit("app:navigate", path.to_string());
  }
}

fn position_window_on_startup(window: &tauri::WebviewWindow, app: &tauri::AppHandle) {
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

  let cursor = window
    .cursor_position()
    .unwrap_or(PhysicalPosition { x: 0.0_f64, y: 0.0_f64 });

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

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .manage(AppSettings {
      close_to_tray_on_close: AtomicBool::new(true),
      tray_restore_last_route: AtomicBool::new(true),
      autostart_show_window: AtomicBool::new(false),
      last_route: Mutex::new("/".to_string()),
    })
    .invoke_handler(tauri::generate_handler![
      set_close_to_tray_on_close,
      set_tray_restore_last_route,
      set_last_route,
      set_auto_start_on_boot,
      is_auto_start_on_boot_enabled,
      set_autostart_show_window
    ])
    .plugin(tauri_plugin_autostart::init(MacosLauncher::LaunchAgent, Some(vec!["--autostart"])))
    .setup(|app| {
      let launched_by_autostart = std::env::args().any(|arg| arg == "--autostart");

      if let Ok(dir) = app.path().app_data_dir() {
        if let Ok(val) = std::fs::read_to_string(dir.join("autostart-show-window")) {
          app
            .state::<AppSettings>()
            .autostart_show_window
            .store(val.trim() == "true", Ordering::Relaxed);
        }
      }
      let generate_item =
        MenuItem::with_id(app, NAV_GENERATE_ID, "Generate", true, None::<&str>)?;
      let settings_item =
        MenuItem::with_id(app, NAV_SETTINGS_ID, "Settings", true, None::<&str>)?;
      let history_item =
        MenuItem::with_id(app, NAV_HISTORY_ID, "History", true, None::<&str>)?;
      let minimize_item =
        MenuItem::with_id(app, WINDOW_MINIMIZE_ID, "Minimize", true, None::<&str>)?;
      let close_item =
        MenuItem::with_id(app, WINDOW_CLOSE_ID, "Close", true, None::<&str>)?;
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
        if let Ok(icon) = tauri::image::Image::from_bytes(include_bytes!("../icons/icon.png")) {
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

      let tray_settings_item =
        MenuItem::with_id(app, NAV_SETTINGS_ID, "Settings", true, None::<&str>)?;
      let tray_history_item =
        MenuItem::with_id(app, NAV_HISTORY_ID, "History", true, None::<&str>)?;
      let tray_quit_item = MenuItem::with_id(app, APP_QUIT_ID, "Quit", true, None::<&str>)?;

      let tray_menu = Menu::with_items(
        app,
        &[
          &tray_settings_item,
          &tray_history_item,
          &tray_quit_item,
        ],
      )?;

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

      let _tray = tray_builder.build(app)?;

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
