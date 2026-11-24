// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later
// TAGS: ['states']
// INFO: Application state persistence on SQLite: the crate's public flat API.

//! Application state persistence on SQLite.
//!
//! Owns the database (schema, migrations) and the state structures
//! saved in it. The flat functions live in the `pub_*` modules; UI
//! shells talk to this crate through `studio-core` only.

mod data;
mod db;
mod pub_chats;
mod pub_groups;
mod pub_prefs;
mod pub_providers;

pub use data::chat_attachments::ChatAttachmentBlob;
pub use data::chat_attachments::ChatAttachmentData;
pub use data::chat_attachments::ChatAttachmentNewData;
pub use data::chat_history::ChatHistoryData;
pub use data::chat_history::ChatMessageType;
pub use data::chat_history::ChatShowType;
pub use data::chat_history::ChatStatus;
pub use data::chats::ChatData;
pub use data::group_chat_history::GroupChatHistoryData;
pub use data::groups_chat::GroupChatData;
pub use data::models::ProviderModelData;
pub use data::providers::ProviderData;
pub use data::settings::SettingsData;
pub use data::workspace::WorkspaceData;
pub use db::store::Store;
pub use pub_chats::add_chat_history;
pub use pub_chats::add_chat_history_compress;
pub use pub_chats::add_chat_message_attachments;
pub use pub_chats::cancel_progress_chat_histories;
pub use pub_chats::delete_chat;
pub use pub_chats::delete_chat_histories;
pub use pub_chats::delete_chat_histories_after;
pub use pub_chats::delete_chat_histories_except;
pub use pub_chats::delete_chat_histories_from;
pub use pub_chats::delete_chat_history;
pub use pub_chats::delete_group_chats;
pub use pub_chats::delete_progress_chat_histories_compress;
pub use pub_chats::get_chat;
pub use pub_chats::get_chat_attachment_blobs;
pub use pub_chats::get_chat_histories;
pub use pub_chats::get_chats;
pub use pub_chats::get_last_group_chat;
pub use pub_chats::get_progress_chat_histories;
pub use pub_chats::save_chat;
pub use pub_chats::update_chat_history;
pub use pub_chats::update_chat_history_collapsed;
pub use pub_chats::update_chat_history_show_type;
pub use pub_chats::update_chat_history_summary;
pub use pub_chats::update_chat_history_translate;
pub use pub_groups::add_group_chat_history;
pub use pub_groups::bump_group_chat_history_activations;
pub use pub_groups::bump_group_chat_history_chats_created;
pub use pub_groups::bump_group_chat_history_updates;
pub use pub_groups::clear_group_chat_history_selected_chat;
pub use pub_groups::delete_group_chat;
pub use pub_groups::delete_group_chat_history;
pub use pub_groups::get_group_chat;
pub use pub_groups::get_group_chat_histories;
pub use pub_groups::get_groups_chat;
pub use pub_groups::save_group_chat;
pub use pub_groups::set_active_group_chat;
pub use pub_groups::set_group_chat_view;
pub use pub_prefs::get_settings;
pub use pub_prefs::get_workspace;
pub use pub_prefs::save_settings;
pub use pub_prefs::save_workspace;
pub use pub_providers::delete_provider;
pub use pub_providers::get_provider;
pub use pub_providers::get_provider_model;
pub use pub_providers::get_provider_models;
pub use pub_providers::get_providers;
pub use pub_providers::save_provider;
pub use pub_providers::save_provider_model;
pub use pub_providers::save_provider_models;
