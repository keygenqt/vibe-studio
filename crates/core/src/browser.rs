// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later
// TAGS: ['misc']
// INFO: External links: opening http/https URLs in the default browser.

//! Opening external links in the default browser. Only `http` and
//! `https` pass — the UI input is not trusted.

use anyhow::Result;
use url::Url;

/// Opens the URL in the default browser. The UI is not trusted: only
/// `http` and `https` schemes pass.
pub(crate) fn open_in_browser(url: &str) -> Result<()> {
    let url = Url::parse(url).map_err(|_| anyhow::anyhow!("Invalid link."))?;
    if url.scheme() != "http" && url.scheme() != "https" {
        anyhow::bail!("Only http and https links are supported.");
    }
    open::that_detached(url.as_str()).map_err(|_| anyhow::anyhow!("The link cannot be opened."))
}
