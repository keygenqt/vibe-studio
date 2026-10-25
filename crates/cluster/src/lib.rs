// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later
// TAGS: ['facts']

//! Vibe Studio cluster — provider catalog and LLM cluster features
//! over `vibe-cluster`.

mod models;
mod provider;

pub use provider::ProviderInfo;
pub use vibe_cluster::ModelInfo;

pub use models::fetch_models;
pub use provider::provider_by_kind;
pub use provider::providers;
