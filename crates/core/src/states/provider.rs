// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later
// TAGS: ['states']

use anyhow::{Result, bail};

use studio_states::{Provider, ProviderNew, Store};

/// id below this value means "new provider" — SQLite assigns the real one.
const NEW_ID: i32 = 0;

/// All configured providers; a store error yields an empty list —
/// loading never blocks the UI.
pub(crate) fn providers_load(store: &Store) -> Vec<Provider> {
    store.providers_list().unwrap_or_default()
}

/// Validates against the cluster catalog, then inserts or updates.
/// The UI is not trusted: strings are trimmed, the kind is normalized
/// to the catalog id, the api key is enforced per cloud flag.
pub(crate) fn provider_save(store: &Store, provider: &Provider) -> Result<Provider> {
    let info = studio_cluster::providers()
        .into_iter()
        .find(|info| info.provider == provider.provider)
        .ok_or_else(|| anyhow::anyhow!("Unknown provider kind: {}.", provider.provider))?;

    let name = provider.name.trim();
    let host = provider.host.trim();
    if name.is_empty() {
        bail!("Name must not be blank.");
    }
    if host.is_empty() {
        bail!("Host must not be blank.");
    }

    let api_key = if info.cloud {
        match provider.api_key.as_deref().map(str::trim) {
            Some(key) if !key.is_empty() => Some(key.to_string()),
            _ => bail!("{} requires an API key.", info.name),
        }
    } else {
        None
    };

    let id = if provider.id > NEW_ID { Some(provider.id) } else { None };
    store.provider_save(
        id,
        &ProviderNew {
            name: name.to_string(),
            provider: info.provider.to_string(),
            host: host.to_string(),
            api_key,
        },
    )
}

/// Deletes the provider; missing rows surface as `NotFound`.
pub(crate) fn provider_delete(store: &Store, id: i32) -> Result<()> {
    store.provider_delete(id)?;
    Ok(())
}
