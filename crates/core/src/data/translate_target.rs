// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later
// TAGS: ['misc']
// INFO: The resolved target of the translation task: provider, model and language.

//! The resolved target of the translation task: everything the
//! cluster's translate call needs except the text itself.

use studio_cluster::ProviderTypeData;

/// The resolved target of the translation task: the provider kind
/// with its connection facts, the model name and the language.
pub(crate) struct TranslateTargetData {
    pub kind: ProviderTypeData,
    pub host: String,
    pub api_key: Option<String>,
    pub project: Option<String>,
    pub model: String,
    pub language: String,
}
