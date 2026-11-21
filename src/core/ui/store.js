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
    formState: null,
    error: null,
  },
  reducers: {
    formStateSet: (state, action) => {
      state.formState = action.payload
    },
    formStateClear: state => {
      state.formState = null
    },
    errorSet: (state, action) => {
      state.error = action.payload
    },
    errorClear: state => {
      state.error = null
    },
  },
})

export const { formStateSet, formStateClear, errorSet, errorClear } = uiSlice.actions
export default uiSlice.reducer
