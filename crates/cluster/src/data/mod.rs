// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later
// TAGS: ['facts']
// INFO: Crate data types: provider kinds, call configs, the static catalog, host-reported models.

//! Crate data types; external types never leave the crate.
//!
//! # Submodules
//!
//! - `model_capability` — the full capability matrix of a model.
//! - `model_info` — a model as a provider host reports it.
//! - `provider_type` — the provider kind.
//! - `call_params` — the provider-agnostic call config and its
//!   family wire mapping.
//! - `provider_info` — a static catalog row of a provider kind.
//! - `stream_event` — a live delta of a model answer.
//! - `stream_status` — the token and timing report of a call.
//! - `stream_result` — the aggregated answer of a stream call.

mod call_params;
mod model_capability;
mod model_info;
mod provider_info;
mod provider_type;
mod stream_event;
mod stream_result;
mod stream_status;

pub use call_params::CallParamsData;
pub use model_capability::ModelCapabilityData;
pub use model_info::ModelInfoData;
pub use provider_info::ProviderInfoData;
pub use provider_type::ProviderTypeData;
pub use stream_event::StreamEventData;
pub use stream_result::StreamResultData;
pub use stream_status::StreamStatusData;
