// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later
// TAGS: ['states']
// INFO: The fresh state of the providers block, assembled by Rust for JS.

use serde::Serialize;

use studio_core::Store;

use super::provider_data::ProviderData;
use super::provider_info_data::ProviderInfoData;
use super::provider_model_data::ProviderModelData;

/// The fresh state of the providers block, returned by every
/// mutation of the block: Rust assembles it, JS renders it.
#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ProvidersData {
    pub catalog: Vec<ProviderInfoData>,
    pub providers: Vec<ProviderData>,
    pub models: Vec<ProviderModelData>,
}

impl ProvidersData {
    /// Assembles the fresh state of the providers block.
    pub(crate) fn new(store: &Store) -> Self {
        Self {
            catalog: studio_core::get_providers_catalog()
                .into_iter()
                .map(ProviderInfoData::from)
                .collect(),
            providers: studio_core::get_providers(store)
                .into_iter()
                .map(ProviderData::from)
                .collect(),
            models: studio_core::get_provider_models(store, None)
                .into_iter()
                .map(ProviderModelData::from)
                .collect(),
        }
    }
}
