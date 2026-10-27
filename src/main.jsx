/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['misc']
 */
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'

import './localization'
import store from './store'
import './assets/css/index.css'
import App from './App.jsx'
import { initScrollArea } from './init'
import { bindEvents } from './modules'

// App init: not tied to any component lifetime, runs once, never cleans up
initScrollArea()
// Rust events arrive here; async, fire and forget
bindEvents()

// MUI TextareaAutosize's internal ResizeObserver overflows WebKit's loop
// depth during window drag-resize; the layout converges next frame. Harmless.
window.addEventListener('error', e => {
  if (e.message?.startsWith('ResizeObserver loop')) {
    e.preventDefault()
    e.stopImmediatePropagation()
  }
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>
)
