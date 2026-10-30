/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['misc']
 * INFO: Shared UI helpers: backend messages, form submit, validators, clamp.
 */
export const AppUtils = {
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
}
