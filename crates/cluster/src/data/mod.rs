// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later
// TAGS: ['facts']

//! Crate data types; external types never leave the crate.
//!
//! # Submodules
//!
//! - `model_info` — a model as a provider host reports it.
//! - `provider_type` — the provider kind.
//! - `provider_info` — a static catalog row of a provider kind.

mod model_info;
mod provider_info;
mod provider_type;

pub use model_info::ModelInfoData;
pub use provider_info::ProviderInfoData;
pub use provider_type::ProviderTypeData;
