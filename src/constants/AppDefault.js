/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['facts']
 * INFO: UI drag bounds, defaults and animation durations.
 */

// Composer height: user-dragged between min and max.
export const CHAT_INPUT_SIZE_MIN = 132
export const CHAT_INPUT_SIZE_MAX = 285
export const CHAT_INPUT_SIZE_DEFAULT = 48

// Sidebar width: user-dragged, shared by chat and settings sidebars.
export const SIDE_BAR_SIZE_MIN = 200
export const SIDE_BAR_SIZE_MAX = 450
export const SIDE_BAR_SIZE_DEFAULT = 340

// Animation timing vs how long a success banner stays visible
export const DURATION_DEFAULT = 150
export const DURATION_AUTO_HIDE = 4000

// Compact page mode: content width below which rows drop controls under the text.
export const COMPACT_PAGE_WIDTH = 480

// Accent theme names: each resolves to its theme pair in the theme zone.
export const ACCENTS = ['default', 'wave', 'moss', 'twilight', 'sunset']
export const ACCENT_DEFAULT = ACCENTS[0]

// Settings UI defaults: applied to the untouched (null) stored values.
export const CHAT_FONT_SIZE_DEFAULT = 15
export const CHAT_KEEP_MESSAGES_DEFAULT = 50
export const TRANSLATE_LOCALE_DEFAULT = 'ru'
