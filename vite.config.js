/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['deps']
 */
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteStaticCopy } from 'vite-plugin-static-copy'

export default defineConfig({
  plugins: [
    react(),
    // the OFL license travels with the fonts into the bundle
    viteStaticCopy({
      targets: [{ src: 'src/assets/fonts/**/OFL.txt', dest: 'fonts', rename: { stripBase: 3 } }],
    }),
  ],
  clearScreen: false,
  server: { port: 3030, strictPort: true },
  build: { target: 'es2022', chunkSizeWarningLimit: 1500 },
})
