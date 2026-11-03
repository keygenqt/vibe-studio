/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['misc']
 * INFO: Shared UI helpers: locales, backend messages, form submit, validators, clamp, stats.
 */
export const AppUtils = {
  // the chat page locales for the Intl date-time formatting
  locales: { ru: 'ru', en: 'en', cn: 'zh-CN' },

  // the Rust message is the i18n key: unknown messages fall back to the raw string
  backendMessage: function (t, error) {
    const message = error.message ?? String(error)
    return t(message) === message ? message : t(message)
  },

  // the form submit pipeline: clears the submit error, shows the saved
  // alert, maps a backend error onto the submit field;
  // resolves with the Rust answer on success, undefined on error
  submitForm: async function (t, helpers, save) {
    const { setErrors, setSubmitting, setSavedOpen } = helpers
    setErrors({ submit: null })
    setSavedOpen(false)
    try {
      const saved = await save()
      setSavedOpen(true)
      return saved
    } catch (error) {
      setErrors({ submit: AppUtils.backendMessage(t, error) })
    } finally {
      setSubmitting(false)
    }
  },

  // Rust keeps values as sent; bounds are a UI shell policy
  clamp: function (value, min, max) {
    return Math.round(Math.min(max, Math.max(min, value)))
  },

  // empty is valid, whitespace-only is not
  notBlank: function (value) {
    return !value || value.trim() !== ''
  },

  // parses only absolute URLs with a host
  validUrl: function (value) {
    try {
      return Boolean(new URL(value).hostname)
    } catch {
      return false
    }
  },

  // the chat message time: "03:23"
  formatTime: function (language, createdAt) {
    return new Intl.DateTimeFormat(this.locales[language] ?? 'en', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(createdAt))
  },

  // the number in a human form: 817 → "817", 49200 → "49.2K",
  // 49152 → "49.2K", 2_400_000 → "2.4M", 36.43 → "36.4"
  human: function (value) {
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`
    if (value >= 1000) return `${(value / 1000).toFixed(1).replace(/\.0$/, '')}K`
    return Number.isInteger(value) ? String(value) : value.toFixed(1)
  },

  // the chat usage line: "1.4K t · 36.4 t/s · 6 msg"; zero parts stay out
  formatStats: function (stats) {
    if (!stats) return undefined
    return [
      stats.tokens > 0 ? `${this.human(stats.tokens)} t` : null,
      stats.tokens_per_second > 0 ? `${this.human(stats.tokens_per_second)} t/s` : null,
      stats.messages > 0 ? `${this.human(stats.messages)} msg` : null,
    ]
      .filter(Boolean)
      .join(' · ')
  },
}
