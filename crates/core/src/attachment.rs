// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later
// TAGS: ['states']
// INFO: Attachment validation and preparation: the UI input becomes the stored rows and prompt parts.

//! Attachment preparation: the untrusted UI input is read, sniffed
//! and validated into the rows ready to store, plus the prompt
//! parts. The files are classified by content, never by extension.

use std::path::Path;
use std::path::PathBuf;

use anyhow::Result;
use anyhow::anyhow;
use base64::Engine as _;
use base64::engine::general_purpose::STANDARD as BASE64;
use std::io::Read as _;

use studio_states::ChatAttachmentBlob;
use studio_states::ChatAttachmentNewData;
use studio_states::ChatHistoryData;
use studio_states::Store;

/// Hard cap per one attachment; a bigger file is rejected at once.
const SIZE_MAX: usize = 10 * 1024 * 1024;
/// Hard cap on the attachments of one send together.
const TOTAL_MAX: usize = 20 * 1024 * 1024;
/// The binary sniff window: a NUL byte here marks a binary file.
const SNIFF_WINDOW: usize = 8 * 1024;

/// One attached file as the shell sends it: a disk path, or a
/// clipboard image as base64 PNG.
#[derive(Debug, Clone, serde::Deserialize)]
#[serde(tag = "kind", rename_all = "snake_case")]
pub enum ChatAttachmentInput {
    /// A file on disk.
    File {
        /// The absolute path.
        path: PathBuf,
    },
    /// An image from the clipboard.
    Image {
        /// The image bytes, base64-encoded PNG.
        png: String,
    },
}

/// The draft facts of a dropped path: the directory flag, the image
/// MIME sniffed from the header, the byte size — the chip paints by them.
#[derive(Debug, serde::Serialize)]
pub struct AttachmentStatData {
    /// `true` = a directory, expands into its files at the send.
    pub dir: bool,
    /// The image MIME by the header sniff; `None` = not an image.
    pub mime: Option<String>,
    /// The size on disk, bytes.
    pub size: i64,
}

/// The prompt parts built from the validated attachments: the text
/// files inlined under their full paths, the images as base64 strings.
#[derive(Debug, Default)]
pub(crate) struct PreparedAttachments {
    /// The rows ready to store with the user message.
    pub rows: Vec<ChatAttachmentNewData>,
    /// The inlined text files, appended after the user text.
    pub inline: String,
    /// The base64 images for a vision model.
    pub images: Vec<String>,
    /// The stored bytes together — checked against the total cap.
    total: usize,
}

/// Reads, classifies and validates every attachment. All-or-nothing:
/// one unsupported file fails the whole send with the names listed.
/// A directory input expands into its files recursively; the bytes
/// of one send are capped together.
pub(crate) fn prepare(attachments: &[ChatAttachmentInput]) -> Result<PreparedAttachments> {
    let mut prepared = PreparedAttachments::default();
    let mut rejected: Vec<String> = Vec::new();
    for input in attachments {
        match input {
            ChatAttachmentInput::File { path } => {
                // a dropped directory expands into its files, each
                // through the usual validation — no special path
                if std::fs::metadata(path).map(|meta| meta.is_dir()).unwrap_or(false) {
                    let name = path
                        .file_name()
                        .map(|name| name.to_string_lossy().into_owned())
                        .unwrap_or_else(|| "directory".to_string());
                    let mut files = Vec::new();
                    expand_dir(path, &mut files).map_err(|_| anyhow!("File cannot be read: {name}."))?;
                    for file in files {
                        prepare_file(&file, &mut prepared, &mut rejected)?;
                    }
                } else {
                    prepare_file(path, &mut prepared, &mut rejected)?;
                }
            }
            ChatAttachmentInput::Image { png } => {
                let name = format!(
                    "image-{}.png",
                    std::time::SystemTime::now()
                        .duration_since(std::time::UNIX_EPOCH)
                        .map(|d| d.as_millis())
                        .unwrap_or(0)
                );
                prepare_image(&name, png, &mut prepared, &mut rejected)?;
            }
        }
    }
    if rejected.is_empty() {
        Ok(prepared)
    } else {
        Err(anyhow!("Unsupported file type: {}.", rejected.join(", ")))
    }
}

/// Collects the files of a directory tree, depth-first in name order;
/// symlinked directories are skipped — no loops, no escapes.
fn expand_dir(dir: &Path, files: &mut Vec<PathBuf>) -> Result<()> {
    let mut entries: Vec<std::fs::DirEntry> = std::fs::read_dir(dir)?.collect::<std::io::Result<Vec<_>>>()?;
    entries.sort_by_key(|entry| entry.file_name());
    for entry in entries {
        // hidden files and directories stay out of the tree
        if entry.file_name().to_string_lossy().starts_with('.') {
            continue;
        }
        // `file_type` does not follow symlinks
        if entry.file_type()?.is_dir() {
            expand_dir(&entry.path(), files)?;
        } else {
            files.push(entry.path());
        }
    }
    Ok(())
}

/// The draft facts of one dropped path: the metadata and the header
/// sniff — never the whole file.
pub(crate) fn stat(path: &str) -> AttachmentStatData {
    let meta = std::fs::metadata(path).ok();
    let dir = meta.as_ref().map(|meta| meta.is_dir()).unwrap_or(false);
    let size = meta.as_ref().map(|meta| meta.len() as i64).unwrap_or(0);
    let mime = if dir { None } else { sniff_header(path) };
    AttachmentStatData { dir, mime, size }
}

/// The image MIME of a file header: the four signatures need at
/// most 12 bytes.
fn sniff_header(path: &str) -> Option<String> {
    let mut file = std::fs::File::open(path).ok()?;
    let mut head = [0u8; 12];
    let read = file.read(&mut head).ok()?;
    sniff_mime(&head[..read]).map(String::from)
}

/// Reads and classifies one file from disk; the name comes from the
/// path. A read failure names the file — unsupported content is the
/// only rejection path left.
fn prepare_file(path: &PathBuf, prepared: &mut PreparedAttachments, rejected: &mut Vec<String>) -> Result<()> {
    let name = path
        .file_name()
        .map(|name| name.to_string_lossy().into_owned())
        .unwrap_or_else(|| "file".to_string());
    let full = path.to_string_lossy().into_owned();
    let bytes = read_capped(path, &name)?;
    prepare_bytes(&name, Some(&full), &bytes, prepared, rejected)?;
    Ok(())
}

/// Decodes the clipboard PNG and classifies the bytes.
fn prepare_image(name: &str, png: &str, prepared: &mut PreparedAttachments, rejected: &mut Vec<String>) -> Result<()> {
    match BASE64.decode(png.as_bytes()) {
        Ok(bytes) => prepare_bytes(name, None, &bytes, prepared, rejected),
        Err(_) => {
            rejected.push(name.to_string());
            Ok(())
        }
    }
}

/// One content decision: an image by its magic bytes, a text by the
/// sniff, anything else is rejected.
fn prepare_bytes(
    name: &str,
    path: Option<&str>,
    bytes: &[u8],
    prepared: &mut PreparedAttachments,
    rejected: &mut Vec<String>,
) -> Result<()> {
    if bytes.len() > SIZE_MAX {
        rejected.push(name.to_string());
        return Ok(());
    }
    match sniff_mime(bytes) {
        Some(mime) => {
            prepared.images.push(BASE64.encode(bytes));
            prepared.rows.push(ChatAttachmentNewData {
                name: name.to_string(),
                path: path.map(String::from),
                mime: mime.to_string(),
                size: bytes.len() as i32,
                data: bytes.to_vec(),
            });
            prepared.total += bytes.len();
        }
        None if is_text(bytes) => {
            prepared.inline.push_str(&render_inline(
                path.expect("file text carries its path"),
                std::str::from_utf8(bytes).expect("utf-8 checked"),
            ));
            prepared.rows.push(ChatAttachmentNewData {
                name: name.to_string(),
                path: path.map(String::from),
                mime: "text/plain".to_string(),
                size: bytes.len() as i32,
                data: bytes.to_vec(),
            });
            prepared.total += bytes.len();
        }
        None => rejected.push(name.to_string()),
    }
    // the whole send dies over the total cap — nothing is stored
    if prepared.total > TOTAL_MAX {
        anyhow::bail!("Attachments are too large.");
    }
    Ok(())
}

/// The MIME type of the four image formats the providers accept.
fn sniff_mime(bytes: &[u8]) -> Option<&'static str> {
    if bytes.starts_with(b"\x89PNG\r\n\x1a\n") {
        Some("image/png")
    } else if bytes.starts_with(b"\xFF\xD8\xFF") {
        Some("image/jpeg")
    } else if bytes.starts_with(b"GIF87a") || bytes.starts_with(b"GIF89a") {
        Some("image/gif")
    } else if bytes.len() >= 12 && &bytes[0..4] == b"RIFF" && &bytes[8..12] == b"WEBP" {
        Some("image/webp")
    } else {
        None
    }
}

/// A text file: no NUL byte in the sniff window and valid UTF-8.
fn is_text(bytes: &[u8]) -> bool {
    !bytes.iter().take(SNIFF_WINDOW).any(|&byte| byte == 0) && std::str::from_utf8(bytes).is_ok()
}

/// Reads the file, refusing anything over the cap before touching
/// the memory; the failures carry the file name.
fn read_capped(path: &PathBuf, name: &str) -> Result<Vec<u8>> {
    let metadata = std::fs::metadata(path).map_err(|_| anyhow!("File cannot be read: {name}."))?;
    if metadata.len() as usize > SIZE_MAX {
        anyhow::bail!("File is too large: {name}.");
    }
    Ok(std::fs::read(path).map_err(|_| anyhow!("File cannot be read: {name}."))?)
}

/// One text file in the prompt: the full path as the header, the
/// content raw — no fence, nothing to break out of.
pub(crate) fn render_inline(path: &str, content: &str) -> String {
    format!("\n\n[{path}]\n{content}\n")
}

/// The prompt parts of a stored message, rebuilt from the database
/// bytes: the resend context matches the original send even when the
/// original file is gone.
pub(crate) struct StoredPrompt {
    /// The user text with the inlined file blocks.
    pub prompt: String,
    /// The base64 images, `None` when the message had none.
    pub images: Option<Vec<String>>,
}

/// Rebuilds one stored message's prompt from the stored bytes.
pub(crate) fn prepare_stored(store: &Store, message: &ChatHistoryData) -> Result<StoredPrompt> {
    let mut prompt = message.text.clone();
    let mut images: Vec<String> = Vec::new();
    let blobs = studio_states::get_chat_attachment_blobs(store, message.id.expect("stored message id"))?;
    for blob in &blobs {
        if blob.mime.starts_with("image/") {
            images.push(BASE64.encode(&blob.data));
        } else {
            let path = blob.path.as_deref().unwrap_or(&blob.name);
            prompt.push_str(&render_inline(path, stored_text(blob)?));
        }
    }
    let images = if images.is_empty() { None } else { Some(images) };
    Ok(StoredPrompt { prompt, images })
}

/// Renders a stored message as prompt parts: the text with the
/// inlined file texts, plus the image pairs — path and base64.
pub(crate) fn render_message_parts(
    store: &Store,
    message: &ChatHistoryData,
) -> Result<(String, Vec<(String, String)>)> {
    // the metadata is already in hand: a message without attachments
    // skips the blob query entirely
    if message.attachments.is_empty() {
        return Ok((message.text.clone(), Vec::new()));
    }
    let mut content = message.text.clone();
    let mut images: Vec<(String, String)> = Vec::new();
    let blobs = studio_states::get_chat_attachment_blobs(store, message.id.expect("stored message id"))?;
    for blob in &blobs {
        let path = blob.path.as_deref().unwrap_or(&blob.name);
        if blob.mime.starts_with("image/") {
            images.push((path.to_string(), BASE64.encode(&blob.data)));
        } else {
            content.push_str(&render_inline(path, stored_text(blob)?));
        }
    }
    Ok((content, images))
}

/// Renders a stored message as text only — the compress base cannot
/// re-attach images, they go as named placeholders.
pub(crate) fn render_message(store: &Store, message: &ChatHistoryData) -> Result<String> {
    let (mut content, images) = render_message_parts(store, message)?;
    for (path, _) in &images {
        content.push_str(&format!("\n\n[attached image: {path}]"));
    }
    Ok(content)
}

/// The stored text bytes as UTF-8; the store keeps only validated
/// text, a broken blob is a data bug.
fn stored_text(blob: &ChatAttachmentBlob) -> Result<&str> {
    std::str::from_utf8(&blob.data).map_err(|_| anyhow!("Unsupported file type: {}.", blob.name))
}
