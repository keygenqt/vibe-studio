/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['facts']
 */

// Single source of UI shell bounds and defaults. Values are resolved
// here and sent to Rust as is — Rust stores them without clamping.
export const CHAT_INPUT_SIZE_MIN = 48
export const CHAT_INPUT_SIZE_MAX = 320
export const CHAT_INPUT_SIZE_DEFAULT = 48
export const SIDE_BAR_SIZE_MIN = 200
export const SIDE_BAR_SIZE_MAX = 480
export const SIDE_BAR_SIZE_DEFAULT = 260
