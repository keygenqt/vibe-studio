// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later
// TAGS: ['states']
// INFO: Core data types: the shell payloads and the internal task targets.

//! Core data types.
//!
//! # Submodules
//!
//! - `chat_stream` — `ChatStreamEvent`: the live events of a chat send.
//! - `clipboard` — `ClipboardRead`: the kind-tagged clipboard read answer.
//! - `translate_target` — `TranslateTargetData`: the resolved target of the translation task.

mod chat_stream;
mod clipboard;
mod translate_target;

pub use chat_stream::ChatStreamEvent;
pub use clipboard::ClipboardRead;
pub(crate) use translate_target::TranslateTargetData;
