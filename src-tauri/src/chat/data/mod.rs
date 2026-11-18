// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later
// TAGS: ['states']
// INFO: Data types of the chat block served to the shell.

//! Data types of the chat block served to the shell.
//!
//! # Submodules
//!
//! - `chat_state` — `ChatStateData`: the fresh state of the chat
//!   block, returned by its mutations.
//! - `chat_stats` — `ChatStatsData`: the usage stats of a chat
//!   computed by Rust.
//! - `stream_chunk` — `StreamChunk` and `StreamChunkKind`: a live
//!   stream delta of the command channel.

pub(crate) mod chat_state;
pub(crate) mod chat_stats;
pub(crate) mod stream_chunk;
