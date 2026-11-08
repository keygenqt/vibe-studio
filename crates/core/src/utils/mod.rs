// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later
// TAGS: ['misc']
// INFO: Private helpers of the core functions.

//! Private helpers of the core functions.
//!
//! # Submodules
//!
//! - `fence` — the open code fence balancing for the stream snapshots.
//! - `prompt` — the wire role of a stored message and the prompt language name.
//! - `tokens` — token counting for the store and the cancel token registries.

mod fence;
mod prompt;
mod tokens;

pub(crate) use fence::close_open_fence;
pub(crate) use prompt::history_role;
pub(crate) use prompt::locale_language;
pub(crate) use tokens::cancel_stream_token;
pub(crate) use tokens::cancel_summary_token;
pub(crate) use tokens::cancel_translate_token;
pub(crate) use tokens::count;
pub(crate) use tokens::drop_summary_token;
pub(crate) use tokens::drop_translate_token;
pub(crate) use tokens::stream_token;
pub(crate) use tokens::stream_tokens;
pub(crate) use tokens::summary_tokens;
pub(crate) use tokens::translate_tokens;
