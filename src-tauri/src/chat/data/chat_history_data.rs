// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later
// TAGS: ['states']
// INFO: The chat message wire type, mirrored from studio-core.

use serde::Serialize;

use super::chat_attachment_data::ChatAttachmentData;
use super::chat_message_type::ChatMessageType;
use super::chat_show_type::ChatShowType;
use super::chat_status::ChatStatus;

/// A message of a chat served to the shell: the mirror of the core
/// row; the timestamp rides the wire as unix millis.
#[derive(Debug, Clone, PartialEq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ChatHistoryData {
    /// Row id; `None` = not stored yet.
    pub id: Option<i32>,
    /// Id of the chat the message belongs to.
    pub chat_id: i32,
    /// The sender kind of the message.
    pub message_type: ChatMessageType,
    /// Kind id of the answering provider; `None` = a user message.
    pub provider: Option<String>,
    /// Name of the answering model; `None` = a user message.
    pub model: Option<String>,
    /// What happened to the message.
    pub status: ChatStatus,
    /// Which artifact the bubble shows.
    pub show_type: ChatShowType,
    /// The message text; for `Error` — the error text.
    pub text: String,
    /// The model reasoning behind the answer.
    pub thinking: Option<String>,
    /// The translation of the text; `None` = not generated yet.
    pub translate: Option<String>,
    /// The brief summary of the text; `None` = not generated yet.
    pub summary: Option<String>,
    /// The file attachments of a user message; the metadata only.
    pub attachments: Vec<ChatAttachmentData>,
    /// Provider-reported output tokens of the answer.
    pub tokens_output: Option<i32>,
    /// Provider-reported reasoning tokens.
    pub tokens_thinking: Option<i32>,
    /// Provider-reported tokens of the translation.
    pub tokens_translate: Option<i32>,
    /// Provider-reported tokens of the summary.
    pub tokens_summary: Option<i32>,
    /// Provider-reported tokens of the compress call.
    pub tokens_compress: Option<i32>,
    /// Provider-reported uncached input tokens of the call.
    pub tokens_input: Option<i32>,
    /// Provider-reported cache-hit tokens of that call.
    pub tokens_cached: Option<i32>,
    /// Duration of the answer text generation in milliseconds.
    pub tokens_gen_ms: Option<i32>,
    /// Store-owned: when the row was born; unix millis.
    pub created_at: i64,
    /// The collapsed view flag of the bubble.
    pub collapsed: bool,
}

impl From<studio_core::ChatHistoryData> for ChatHistoryData {
    fn from(data: studio_core::ChatHistoryData) -> Self {
        Self {
            id: data.id,
            chat_id: data.chat_id,
            message_type: data.message_type.into(),
            provider: data.provider,
            model: data.model,
            status: data.status.into(),
            show_type: data.show_type.into(),
            text: data.text,
            thinking: data.thinking,
            translate: data.translate,
            summary: data.summary,
            attachments: data.attachments.into_iter().map(ChatAttachmentData::from).collect(),
            tokens_output: data.tokens_output,
            tokens_thinking: data.tokens_thinking,
            tokens_translate: data.tokens_translate,
            tokens_summary: data.tokens_summary,
            tokens_compress: data.tokens_compress,
            tokens_input: data.tokens_input,
            tokens_cached: data.tokens_cached,
            tokens_gen_ms: data.tokens_gen_ms,
            created_at: data.created_at.and_utc().timestamp_millis(),
            collapsed: data.collapsed,
        }
    }
}
