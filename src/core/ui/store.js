/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['states']
 * INFO: The UI copy: pure front-end state without a Rust owner.
 */
import { createSlice } from '@reduxjs/toolkit'

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    formSuccess: null,
  },
  reducers: {
    formSuccessSet: (state, action) => {
      state.formSuccess = action.payload
    },
    formSuccessClear: state => {
      state.formSuccess = null
    },
  },
})

export const { formSuccessSet, formSuccessClear } = uiSlice.actions
export default uiSlice.reducer
