use tauri::Manager;

#[derive(serde::Serialize, serde::Deserialize, Clone, Debug)]
pub struct DisplayInfo {
    pub id: usize,
    pub name: Option<String>,
    pub x: i32,
    pub y: i32,
    pub width: u32,
    pub height: u32,
    pub scale_factor: f64,
    pub is_primary: bool,
}

#[tauri::command]
fn get_available_displays(app: tauri::AppHandle) -> Result<Vec<DisplayInfo>, String> {
    if let Some(main_win) = app.get_webview_window("main") {
        let monitors = main_win.available_monitors().map_err(|e| e.to_string())?;
        let primary = main_win.primary_monitor().ok().flatten();
        let primary_name = primary.as_ref().and_then(|p| p.name().cloned());

        let list: Vec<DisplayInfo> = monitors.into_iter().enumerate().map(|(idx, m)| {
            let pos = m.position();
            let size = m.size();
            let is_prim = if let Some(ref pn) = primary_name {
                m.name().map_or(false, |n| n == pn)
            } else {
                idx == 0
            };
            DisplayInfo {
                id: idx,
                name: m.name().cloned(),
                x: pos.x,
                y: pos.y,
                width: size.width,
                height: size.height,
                scale_factor: m.scale_factor(),
                is_primary: is_prim,
            }
        }).collect();
        return Ok(list);
    }
    Ok(vec![])
}

#[tauri::command]
fn launch_customer_display(
    app: tauri::AppHandle,
    url: Option<String>,
    monitor_index: Option<usize>,
    fullscreen: Option<bool>,
) -> Result<bool, String> {
    let _ = url;
    if let Some(window) = app.get_webview_window("customer-display") {
        let _ = window.unminimize();
        let _ = window.show();
        let _ = window.set_focus();
        return Ok(true);
    }

    let main_win = app.get_webview_window("main");
    let (target_monitor, monitor_count) = if let Some(ref win) = main_win {
        let monitors = win.available_monitors().unwrap_or_default();
        let count = monitors.len();
        let target = if let Some(idx) = monitor_index {
            monitors.into_iter().nth(idx)
        } else if count > 1 {
            let primary = win.primary_monitor().ok().flatten();
            let primary_name = primary.as_ref().and_then(|p| p.name().cloned());
            let secondary = monitors.iter().find(|m| {
                if let Some(ref pn) = primary_name {
                    m.name().map_or(true, |n| n != pn)
                } else {
                    false
                }
            }).cloned();
            secondary.or_else(|| monitors.into_iter().nth(1))
        } else {
            None
        };
        (target, count)
    } else {
        (None, 1)
    };

    // Always use WebviewUrl::App for internal application routes so Tauri injects IPC,
    // enables permissions, and binds properly to devUrl or local frontendDist assets.
    let webview_url = tauri::WebviewUrl::App("customer-display".into());

    let mut builder = tauri::WebviewWindowBuilder::new(&app, "customer-display", webview_url)
        .title("cMart Customer Display")
        .decorations(true)
        .shadow(true)
        .resizable(true);

    if monitor_count > 1 && target_monitor.is_some() {
        let mon = target_monitor.unwrap();
        let pos = mon.position();
        let size = mon.size();
        builder = builder
            .position(pos.x as f64, pos.y as f64)
            .inner_size(size.width as f64, size.height as f64);
        
        if fullscreen.unwrap_or(true) {
            builder = builder.fullscreen(true);
        }
    } else {
        // Single monitor setup (laptop): Always open as a manageable floating window with titlebar
        builder = builder
            .inner_size(1024.0, 680.0)
            .center()
            .fullscreen(false);
    }

    let win = builder.build().map_err(|e| e.to_string())?;
    let _ = win.show();
    let _ = win.set_focus();

    Ok(true)
}

#[tauri::command]
fn close_customer_display(app: tauri::AppHandle) -> Result<bool, String> {
    if let Some(window) = app.get_webview_window("customer-display") {
        let _ = window.destroy();
        return Ok(true);
    }
    Ok(false)
}

#[tauri::command]
fn is_customer_display_open(app: tauri::AppHandle) -> Result<bool, String> {
    Ok(app.get_webview_window("customer-display").is_some())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }
      
      #[cfg(desktop)]
      {
        let window = app.get_webview_window("main").unwrap();
        let icon_bytes = include_bytes!("../icons/window-icon.png").to_vec();
        if let Ok(icon) = tauri::image::Image::from_bytes(&icon_bytes) {
            let _ = window.set_icon(icon);
        }
      }

      Ok(())
    })
    .plugin(tauri_plugin_process::init())
    .plugin(tauri_plugin_dialog::init())
    .plugin(tauri_plugin_updater::Builder::new().build())
    .plugin(tauri_plugin_shell::init())
    .plugin(tauri_plugin_fs::init())
    .plugin(tauri_plugin_sql::Builder::default().build())
    .invoke_handler(tauri::generate_handler![
        get_available_displays,
        launch_customer_display,
        close_customer_display,
        is_customer_display_open
    ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
