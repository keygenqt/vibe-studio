// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later
// TAGS: ['facts']
// INFO: Provider catalog and LLM requests: the crate's public flat API.

//! Vibe Studio cluster — provider catalog and LLM requests.

mod data;
mod pub_call;
mod pub_providers;
mod pub_tasks;
mod tasks;

pub use data::CallParamsData;
pub use data::ModelCapabilityData;
pub use data::ModelInfoData;
pub use data::ProviderInfoData;
pub use data::ProviderTypeData;
pub use data::StreamEventData;
pub use data::StreamResultData;
pub use data::StreamStatusData;
pub use pub_call::call_prompt;
pub use pub_call::call_prompt_stream;
pub use pub_providers::get_provider_by_kind;
pub use pub_providers::get_provider_models_by_type;
pub use pub_providers::get_providers;
pub use pub_tasks::task_chat_name;
pub use pub_tasks::task_compress;
pub use pub_tasks::task_summary;
pub use pub_tasks::task_translate;
pub use pub_tasks::task_translate_stream;
pub use vibe_cluster::CancelToken;
