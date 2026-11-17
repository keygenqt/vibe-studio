/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['states']
 * INFO: UI writes: pure front-end flags without a Rust round trip.
 */
import store from '../store'
import { formStateClear, formStateSet } from './store'

export const UiMethod = {
  setFormState: function (value) {
    store.dispatch(formStateSet(value))
  },
  clearFormState: function () {
    store.dispatch(formStateClear())
  },
}
