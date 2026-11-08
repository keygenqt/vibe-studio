// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later
// TAGS: ['facts']
// INFO: Crate data types: provider kinds, the static catalog, host-reported models.

//! Crate data types; external types never leave the crate.
//!
//! # Submodules
//!
//! - `capability` — the full capability matrix of a model.
//! - `model_info` — a model as a provider host reports it.
//! - `provider_type` — the provider kind.
//! - `provider_info` — a static catalog row of a provider kind.
//! - `stream` — the stream delta events and the aggregated answer.

mod capability;
mod model_info;
mod provider_info;
mod provider_type;
mod stream;

pub use capability::ModeCapabilityData;
pub use model_info::ModelInfoData;
pub use provider_info::ProviderInfoData;
pub use provider_type::ProviderTypeData;
pub use stream::StreamAnswerData;
pub use stream::StreamEvent;
pub use stream::StreamStatsData;
