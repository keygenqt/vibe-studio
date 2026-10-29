// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later
// TAGS: ['facts']

use serde::Serialize;

use studio_core::ProviderData;
use studio_core::ProviderInfoData;
use studio_core::ProviderModelData;
use studio_core::Store;

/// The fresh state of the providers block, returned by every
/// mutation of the block: Rust assembles it, JS renders it.
#[derive(Serialize)]
pub struct ProvidersData {
    pub catalog: Vec<ProviderInfoData>,
    pub providers: Vec<ProviderData>,
    pub models: Vec<ProviderModelData>,
    pub provider: Option<ProviderData>,
}

impl ProvidersData {
    /// Assembles the fresh state of the providers block.
    pub(crate) fn new(store: &Store) -> Self {
        Self {
            catalog: studio_core::get_providers_catalog(),
            providers: studio_core::get_providers(store),
            models: studio_core::get_provider_models(store, None),
            provider: None,
        }
    }
}
