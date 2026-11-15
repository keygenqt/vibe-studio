/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['states']
 * INFO: UI writes: pure front-end flags without a Rust round trip.
 */
import store from '../store'
import { formSuccessClear, formSuccessSet } from './store'

export const UiMethod = {
  setFormSuccess: function (value) {
    store.dispatch(formSuccessSet(value))
  },
  clearFormSuccess: function () {
    store.dispatch(formSuccessClear())
  },
}
