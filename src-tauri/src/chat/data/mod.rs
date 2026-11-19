// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later
// TAGS: ['states']
// INFO: Data types of the chat block served to the shell.

//! Data types of the chat block served to the shell.
//!
//! # Submodules
//!
//! - `chat_attachment_data` — `ChatAttachmentData`: the attachment
//!   metadata wire type.
//! - `chat_attachment_input` — `ChatAttachmentInput`: the attachment
//!   input wire type.
//! - `chat_history_data` — `ChatHistoryData`: the chat message wire type.
//! - `chat_message_type` — `ChatMessageType`: the sender wire type.
//! - `chat_show_type` — `ChatShowType`: the bubble view wire type.
//! - `chat_state` — `ChatStateData`: the fresh state of the chat
//!   block, returned by its mutations.
//! - `chat_stats` — `ChatStatsData`: the usage stats of a chat
//!   computed by Rust.
//! - `chat_status` — `ChatStatus`: the message status wire type.
//! - `stream_chunk` — `StreamChunk` and `StreamChunkKind`: a live
//!   stream delta of the command channel.

pub(crate) mod chat_attachment_data;
pub(crate) mod chat_attachment_input;
pub(crate) mod chat_history_data;
pub(crate) mod chat_message_type;
pub(crate) mod chat_show_type;
pub(crate) mod chat_state;
pub(crate) mod chat_stats;
pub(crate) mod chat_status;
pub(crate) mod stream_chunk;
