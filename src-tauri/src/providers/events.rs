// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later
// TAGS: ['states']
// INFO: The providers block event binding.

use super::data::providers_state::ProvidersData;

use crate::events::EventKey;
use crate::events::EventPayload;

impl EventPayload for ProvidersData {
    fn main(&self) -> EventKey {
        EventKey::Providers
    }
    fn key(&self) -> &'static str {
        "providers-update"
    }
}
