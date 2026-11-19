#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::{
    menu::{Menu, MenuItem},
    tray::TrayIconBuilder,
    AppHandle, Manager,
};
use tauri_plugin_notification::NotificationExt;

/// Called from the frontend whenever the Threat Convergence Index or Yield Spread updates.
/// Dynamically updates the macOS Menu Bar title ticker (e.g. "87 | +30bps | HORMUZ 95").
#[tauri::command]
fn update_menubar_ticker(app: AppHandle, threat_index: u32, spread_bps: i32, hormuz_vuln: u32) -> Result<(), String> {
    if let Some(tray) = app.tray_by_id("trident-tray") {
        let sign = if spread_bps >= 0 { "+" } else { "" };
        let title = format!(" 🔱 {} | {}{}bps | HORMUZ {}", threat_index, sign, spread_bps, hormuz_vuln);
        tray.set_title(Some(&title)).map_err(|e| e.to_string())?;
    }
    Ok(())
}

/// Fires a native macOS Notification Center banner on Critical CISA KEV or >85 threshold breaches.
#[tauri::command]
fn send_critical_alert(app: AppHandle, title: String, body: String) -> Result<(), String> {
    app.notification()
        .builder()
        .title(&title)
        .body(&body)
        .show()
        .map_err(|e| e.to_string())
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_notification::init())
        .setup(|app| {
            let show_i = MenuItem::with_id(app, "show", "Open Trident Terminal", true, None::<&str>)?;
            let quit_i = MenuItem::with_id(app, "quit", "Quit Trident", true, None::<&str>)?;
            let menu = Menu::with_items(app, &[&show_i, &quit_i])?;

            let _tray = TrayIconBuilder::with_id("trident-tray")
                .title(" 🔱 87 | +30bps | HORMUZ 95")
                .menu(&menu)
                .on_menu_event(|app, event| match event.id.as_ref() {
                    "show" => {
                        if let Some(win) = app.get_webview_window("main") {
                            let _ = win.show();
                            let _ = win.set_focus();
                        }
                    }
                    "quit" => app.exit(0),
                    _ => {}
                })
                .build(app)?;

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            update_menubar_ticker,
            send_critical_alert
        ])
        .run(tauri::generate_context!())
        .expect("error while running Trident Terminal desktop app");
}
