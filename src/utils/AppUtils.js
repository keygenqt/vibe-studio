/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['misc']
 */

export const AppUtils = {
  // 'qwen2.5-coder:7b-instruct' -> 'Qwen2.5 Coder 7b Instruct'
  formatModelName: function (model) {
    return model
      .split(/[:\-_/]/)
      .filter(Boolean)
      .map(word => word.replace(/^\p{L}/u, ch => ch.toUpperCase()))
      .join(' ')
  },

  // the Rust message is the i18n key: lookup without the trailing
  // dot, unknown messages fall back to the raw string
  backendMessage: function (t, error) {
    const message = error.message ?? String(error)
    const key = `backend.${message.replace(/\.$/, '')}`
    return t(key) === key ? message : t(key)
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
}
