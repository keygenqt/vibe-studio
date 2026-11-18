// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later
// TAGS: ['states']
// INFO: The settings block event bindings: state and theme payloads.

use studio_core::SettingsData;
use studio_core::ThemeChoice;

use crate::events::EventKey;
use crate::events::EventPayload;

impl EventPayload for SettingsData {
    fn main(&self) -> EventKey {
        EventKey::Settings
    }
    fn key(&self) -> &'static str {
        "settings-update"
    }
}

impl EventPayload for ThemeChoice {
    fn main(&self) -> EventKey {
        EventKey::Settings
    }
    fn key(&self) -> &'static str {
        "theme-change"
    }
}
