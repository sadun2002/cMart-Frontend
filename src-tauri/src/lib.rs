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
        use tauri::Manager;
        let window = app.get_webview_window("main").unwrap();
        // Set the native title bar icon to the small 'c' logo
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
    .plugin(tauri_plugin_sql::Builder::default().build())
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
