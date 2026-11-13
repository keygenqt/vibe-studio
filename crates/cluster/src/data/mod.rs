// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later
// TAGS: ['facts']
// INFO: Crate data types: provider kinds, call configs, the static catalog, host-reported models.

//! Crate data types; external types never leave the crate.
//!
//! # Submodules
//!
//! - `capability` — the full capability matrix of a model.
//! - `model_info` — a model as a provider host reports it.
//! - `provider_type` — the provider kind.
//! - `call_params` — the provider-agnostic call config and its
//!   family wire mapping.
//! - `provider_info` — a static catalog row of a provider kind.
//! - `stream` — the stream delta events and the aggregated answer.

mod call_params;
mod capability;
mod model_info;
mod provider_info;
mod provider_type;
mod stream;

pub use call_params::CallParamsData;
pub use capability::ModeCapabilityData;
pub use model_info::ModelInfoData;
pub use provider_info::ProviderInfoData;
pub use provider_type::ProviderTypeData;
pub use stream::StreamAnswerData;
pub use stream::StreamEvent;
pub use stream::StreamStatsData;
