// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later
// TAGS: ['states']
// INFO: The chat_attachments table: message attachments with the stored bytes.

use anyhow::Result;
use diesel::prelude::*;
use diesel::sqlite::SqliteConnection;

use crate::Store;

/// A file attached to a user message. The bytes never leave the
/// crate: the wire carries the metadata, the prompt reads the bytes
/// through the blob access.
#[derive(Debug, Clone, PartialEq, serde::Serialize, serde::Deserialize)]
pub struct ChatAttachmentData {
    /// Row id; `None` = not stored yet.
    pub id: Option<i32>,
    /// Id of the message the attachment belongs to.
    pub message_id: i32,
    /// The original file name.
    pub name: String,
    /// The full path of the source file; `None` = clipboard image.
    pub path: Option<String>,
    /// The MIME type resolved by the content sniff.
    pub mime: String,
    /// Size of the stored content, bytes.
    pub size: i32,
}

diesel::table! {
    chat_attachments (id) {
        id -> Integer,
        message_id -> Integer,
        name -> Text,
        path -> Nullable<Text>,
        mime -> Text,
        size -> Integer,
        data -> Blob,
    }
}

/// The stored bytes of one attachment with its name and kind:
/// everything the prompt builder needs.
#[derive(Debug, Clone)]
pub struct ChatAttachmentBlob {
    /// The original file name.
    pub name: String,
    /// The full path of the source file; `None` = clipboard image.
    pub path: Option<String>,
    /// The MIME type resolved by the content sniff.
    pub mime: String,
    /// The stored content.
    pub data: Vec<u8>,
}

/// Validated attachment content, ready to store. The bytes are the
/// single source for the prompt — the original file is never re-read.
#[derive(Debug, Clone)]
pub struct ChatAttachmentNewData {
    /// The original file name.
    pub name: String,
    /// The full path of the source file; `None` = clipboard image.
    pub path: Option<String>,
    /// The MIME type resolved by the content sniff.
    pub mime: String,
    /// Size of the content, bytes.
    pub size: i32,
    /// The content itself.
    pub data: Vec<u8>,
}

/// Insert values: the id is owned by SQLite, the message link comes
/// from the insert call.
#[derive(Debug, Clone, Insertable)]
#[diesel(table_name = chat_attachments)]
struct ChatAttachmentInsert {
    message_id: i32,
    name: String,
    path: Option<String>,
    mime: String,
    size: i32,
    data: Vec<u8>,
}

impl Store {
    /// Metadata of the attachments of the given messages, in id
    /// order — the wire never carries the bytes.
    pub(crate) fn get_chat_attachments(&self, message_ids: &[i32]) -> Result<Vec<ChatAttachmentData>> {
        if message_ids.is_empty() {
            return Ok(Vec::new());
        }
        let mut conn = self.lock();
        // metadata only — the bytes never leave the store on the wire
        let rows: Vec<(i32, i32, String, Option<String>, String, i32)> = chat_attachments::table
            .filter(chat_attachments::message_id.eq_any(message_ids))
            .order_by(chat_attachments::id.asc())
            .select((
                chat_attachments::id,
                chat_attachments::message_id,
                chat_attachments::name,
                chat_attachments::path,
                chat_attachments::mime,
                chat_attachments::size,
            ))
            .load(&mut *conn)?;
        Ok(rows
            .into_iter()
            .map(|(id, message_id, name, path, mime, size)| ChatAttachmentData {
                id: Some(id),
                message_id,
                name,
                path,
                mime,
                size,
            })
            .collect())
    }

    /// Inserts the validated attachments over the given connection —
    /// the transaction in `chat_history` shares it with the message
    /// insert.
    pub(crate) fn insert_chat_attachments(
        conn: &mut SqliteConnection,
        message_id: i32,
        rows: &[ChatAttachmentNewData],
    ) -> Result<()> {
        if rows.is_empty() {
            return Ok(());
        }
        let values: Vec<ChatAttachmentInsert> = rows
            .iter()
            .map(|row| ChatAttachmentInsert {
                message_id,
                name: row.name.clone(),
                path: row.path.clone(),
                mime: row.mime.clone(),
                size: row.size,
                data: row.data.clone(),
            })
            .collect();
        diesel::insert_into(chat_attachments::table)
            .values(&values)
            .execute(conn)?;
        Ok(())
    }

    /// The stored bytes of one message's attachments, in id order —
    /// the prompt is built from what is stored, never re-read.
    pub(crate) fn get_chat_attachment_blobs(&self, message_id: i32) -> Result<Vec<ChatAttachmentBlob>> {
        let mut conn = self.lock();
        let rows: Vec<(String, Option<String>, String, Vec<u8>)> = chat_attachments::table
            .filter(chat_attachments::message_id.eq(message_id))
            .order_by(chat_attachments::id.asc())
            .select((
                chat_attachments::name,
                chat_attachments::path,
                chat_attachments::mime,
                chat_attachments::data,
            ))
            .load(&mut *conn)?;
        Ok(rows
            .into_iter()
            .map(|(name, path, mime, data)| ChatAttachmentBlob { name, path, mime, data })
            .collect())
    }
}
