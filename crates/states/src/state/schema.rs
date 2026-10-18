// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later
// TAGS: ['states']

diesel::table! {
    states (key) {
        key -> Text,
        value -> Text,
    }
}
