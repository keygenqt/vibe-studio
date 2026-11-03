// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later
// TAGS: ['states']
// INFO: Core data types served to the shells.

//! Core data types.
//!
//! # Submodules
//!
//! - `chat_stream` — `ChatStreamEvent`: the live events of a chat send.
//! - `clipboard` — `ClipboardRead`: the kind-tagged clipboard read answer.

mod chat_stream;
mod clipboard;

pub use chat_stream::ChatStreamEvent;
pub use clipboard::ClipboardRead;
