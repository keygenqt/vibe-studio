// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later
// TAGS: ['states', 'theme', 'facts']
// INFO: Vibe Studio core: facade over sub-crates — the single API for UI shells.

//! Vibe Studio core — facade over sub-crates. UI shells talk to this
//! crate only.

mod data;
mod defaults;
mod pub_app;
mod pub_chat;
mod pub_groups_chat;
mod pub_providers;
mod pub_settings;
mod pub_workspace;
mod services;
mod utils;

pub use data::ChatStreamEvent;
pub use data::ClipboardRead;
pub use defaults::models::EffortSpec;
pub use defaults::models::ModelDefaultsData;
pub use defaults::models::ModelParamSpec;
pub use pub_app::attachment_items;
pub use pub_app::clipboard_clear;
pub use pub_app::clipboard_read;
pub use pub_app::clipboard_write_files;
pub use pub_app::clipboard_write_image;
pub use pub_app::clipboard_write_text;
pub use pub_app::get_system_theme;
pub use pub_app::init;
pub use pub_app::listen_system_theme;
pub use pub_app::open_in_browser;
pub use pub_app::store_open;
pub use pub_chat::chat_cancel_send;
pub use pub_chat::chat_compress_message;
pub use pub_chat::chat_delete_message;
pub use pub_chat::chat_get_history;
pub use pub_chat::chat_regenerate_name;
pub use pub_chat::chat_resend_message;
pub use pub_chat::chat_send_message;
pub use pub_chat::chat_set_message_collapsed;
pub use pub_chat::chat_set_message_show_type;
pub use pub_chat::chat_summarize_message;
pub use pub_chat::chat_translate_message;
pub use pub_chat::delete_chat;
pub use pub_chat::get_chat;
pub use pub_chat::get_chats;
pub use pub_chat::save_chat;
pub use pub_groups_chat::delete_group_chat;
pub use pub_groups_chat::get_group_chat;
pub use pub_groups_chat::get_group_chat_histories;
pub use pub_groups_chat::get_groups_chat;
pub use pub_groups_chat::save_group_chat;
pub use pub_groups_chat::select_group_chat;
pub use pub_groups_chat::set_group_chat_view;
pub use pub_providers::delete_provider;
pub use pub_providers::get_model_defaults;
pub use pub_providers::get_provider;
pub use pub_providers::get_provider_model;
pub use pub_providers::get_provider_models;
pub use pub_providers::get_provider_models_by_type;
pub use pub_providers::get_providers;
pub use pub_providers::get_providers_catalog;
pub use pub_providers::save_provider;
pub use pub_providers::save_provider_model;
pub use pub_providers::save_provider_models;
pub use pub_settings::get_settings;
pub use pub_settings::save_settings;
pub use pub_workspace::get_workspace;
pub use pub_workspace::save_workspace;
pub use services::attachment::AttachmentItemData;
pub use services::attachment::ChatAttachmentInput;
pub use services::theme::ThemeChoice;
pub use studio_cluster::ModelCapabilityData;
pub use studio_cluster::ModelInfoData;
pub use studio_cluster::ProviderInfoData;
pub use studio_cluster::StreamEventData;
pub use studio_states::ChatAttachmentData;
pub use studio_states::ChatData;
pub use studio_states::ChatHistoryData;
pub use studio_states::ChatMessageType;
pub use studio_states::ChatShowType;
pub use studio_states::ChatStatus;
pub use studio_states::GroupChatData;
pub use studio_states::GroupChatHistoryData;
pub use studio_states::ProviderData;
pub use studio_states::ProviderModelData;
pub use studio_states::SettingsData;
pub use studio_states::Store;
pub use studio_states::WorkspaceData;
