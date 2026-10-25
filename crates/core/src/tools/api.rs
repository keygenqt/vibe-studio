// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later
// TAGS: ['theme']

//! Tool features: platform facts with no state behind them.

use anyhow::Result;

pub use super::theme::ThemeChoice;
pub use studio_cluster::ModelInfo;

/// Detects the OS theme. Falls back to Light when the OS does not
/// specify one.
pub fn get_system_theme() -> ThemeChoice {
    super::theme::get_system_theme()
}

/// Resolves the persisted choice to a concrete theme. `System`
/// becomes the detected OS theme.
pub fn resolve_theme(choice: ThemeChoice) -> ThemeChoice {
    super::theme::resolve_theme(choice)
}

/// Calls the callback with the OS theme on every change. Spawns a
/// background watcher thread that lives for the app's lifetime.
pub fn listen_system_theme(on_change: impl Fn(ThemeChoice) + Send + 'static) -> Result<()> {
    super::theme::listen_system_theme(on_change)
}

/// Fetches the live model catalog of a provider host. The host is not
/// trusted: trimmed, blank is an error. Embedding models are filtered
/// out on the cluster layer.
pub async fn provider_models(kind: &str, host: &str, api_key: Option<&str>) -> Result<Vec<ModelInfo>> {
    let host = host.trim();
    if host.is_empty() {
        anyhow::bail!("Host must not be blank.");
    }
    Ok(studio_cluster::fetch_models(kind, host, api_key).await?)
}
