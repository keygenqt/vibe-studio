// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later
// TAGS: ['states']
// INFO: Data types of the providers block served to the shell.

//! Data types of the providers block served to the shell.
//!
//! # Submodules
//!
//! - `provider_data` — `ProviderData`: the provider connection wire type.
//! - `provider_info_data` — `ProviderInfoData`: the static catalog row.
//! - `provider_model_data` — `ProviderModelData`: the model wire type.
//! - `model_defaults_data` — `ModelDefaultsData`: the parameter spec.
//! - `providers_state` — `ProvidersData`: the fresh state of the
//!   providers block, returned by its mutations.

pub(crate) mod model_defaults_data;
pub(crate) mod model_info_data;
pub(crate) mod provider_data;
pub(crate) mod provider_info_data;
pub(crate) mod provider_model_data;
pub(crate) mod providers_state;
