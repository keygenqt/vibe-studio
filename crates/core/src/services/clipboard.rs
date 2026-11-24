// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later
// TAGS: ['misc']
// INFO: Clipboard feature: text, files and images over clipboard-rs.

//! Clipboard I/O: text, file references and images, both directions.
//! Read priority: files → text → image.

use std::path::PathBuf;

use anyhow::Result;
use base64::Engine as _;
use base64::engine::general_purpose::STANDARD as BASE64;
use clipboard_rs::Clipboard;
use clipboard_rs::ClipboardContext;
use clipboard_rs::RustImageData;
use clipboard_rs::common::RustImage;
use url::Url;

use crate::data::ClipboardRead;

/// Sets the clipboard to plain text.
pub(crate) fn write_text(text: &str) -> Result<()> {
    let ctx = context()?;
    ctx.set_text(text.to_string())
        .map_err(|_| anyhow::anyhow!("Clipboard is not available."))?;
    Ok(())
}

/// Decodes base64 PNG and sets the clipboard image.
pub(crate) fn write_image(png: &str) -> Result<()> {
    let bytes = BASE64
        .decode(png.as_bytes())
        .map_err(|_| anyhow::anyhow!("Invalid image data."))?;
    let img = image::load_from_memory(&bytes).map_err(|_| anyhow::anyhow!("Invalid image data."))?;
    let ctx = context()?;
    ctx.set_image(RustImageData::from_dynamic_image(img))
        .map_err(|_| anyhow::anyhow!("Clipboard is not available."))?;
    Ok(())
}

/// Sets the clipboard to the file references.
pub(crate) fn write_files(paths: &[PathBuf]) -> Result<()> {
    let ctx = context()?;
    ctx.set_files(paths.iter().map(|path| path.to_string_lossy().into_owned()).collect())
        .map_err(|_| anyhow::anyhow!("Clipboard is not available."))?;
    Ok(())
}

/// Clears the system clipboard.
pub(crate) fn clear() -> Result<()> {
    let ctx = context()?;
    ctx.clear()
        .map_err(|_| anyhow::anyhow!("Clipboard is not available."))?;
    Ok(())
}

/// Raw plain text from the clipboard, or `None` if unavailable.
pub(crate) fn read_text() -> Option<String> {
    let ctx = ClipboardContext::new().ok()?;
    ctx.get_text().ok()
}

/// Image from the clipboard as base64-encoded PNG, or `None`.
pub(crate) fn read_image() -> Option<String> {
    let ctx = ClipboardContext::new().ok()?;
    let png = ctx.get_image().ok()?.to_png().ok()?;
    Some(BASE64.encode(png.get_bytes()))
}

/// File paths copied in a file manager: the native list first, the
/// `file://` text fallback second.
pub(crate) fn read_files() -> Vec<PathBuf> {
    let ctx = match ClipboardContext::new() {
        Ok(ctx) => ctx,
        Err(_) => return Vec::new(),
    };
    if let Ok(files) = ctx.get_files() {
        let paths: Vec<PathBuf> = files.into_iter().map(PathBuf::from).collect();
        if !paths.is_empty() {
            return paths;
        }
    }
    // the text fallback counts as files only when the targets exist
    if let Ok(text) = ctx.get_text() {
        let paths = parse_uri_list(&text);
        if !paths.is_empty() && paths.iter().any(|path| path.exists()) {
            return paths;
        }
    }
    Vec::new()
}

/// The clipboard content by priority: text → files → image. A text
/// that decodes to existing file targets reads as files.
pub(crate) fn read_all() -> Option<ClipboardRead> {
    // a file manager puts a text twin (the file name) next to the
    // native file list — the files must win over the text
    let files = read_files();
    if !files.is_empty() {
        return Some(ClipboardRead::Files { paths: files });
    }
    if let Some(raw) = read_text() {
        if !raw.is_empty() {
            // text that decodes to existing file targets reads as files
            let decoded = parse_uri_list(&raw);
            if !decoded.is_empty() && decoded.iter().any(|path| path.exists()) {
                return Some(ClipboardRead::Files { paths: decoded });
            }
            return Some(ClipboardRead::Text { text: raw });
        }
    }
    read_image().map(|png| ClipboardRead::Image { png })
}

/// Parses text/uri-list (or plain path lines) into paths: skips
/// comments and the GNOME `copy`/`cut` markers, decodes percent
/// encoding, passes plain paths through as is.
fn parse_uri_list(text: &str) -> Vec<PathBuf> {
    text.lines()
        .map(str::trim)
        .filter(|line| !line.is_empty() && !line.starts_with('#'))
        .filter_map(|line| {
            if line.starts_with("file://") {
                Url::parse(line).ok()?.to_file_path().ok()
            } else if line == "cut" || line == "copy" {
                None
            } else {
                Some(PathBuf::from(line))
            }
        })
        .collect()
}

/// A fresh clipboard context; the shared error text is the i18n key.
fn context() -> Result<ClipboardContext> {
    ClipboardContext::new().map_err(|_| anyhow::anyhow!("Clipboard is not available."))
}
