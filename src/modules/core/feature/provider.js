/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['states']
 */
import { invoke } from "@tauri-apps/api/core";

// last answers from Rust, kept only for rendering: pages take them as
// the initial state, so back and forward navigation never shows a loader.
// Every call refreshes the cache; mutations are covered by the refetch
// each page runs on mount.
const cache = { providers: null, catalog: null };

export const provider = {
  // last known provider list for the first render (null before the first call)
  providers_last: () => cache.providers,
  // cached provider row by id, null when nothing cached or no match
  providers_last_by_id: (id) =>
    (cache.providers ?? []).find((item) => item.id === id) ?? null,
  // last known catalog for the first render (null before the first call)
  providers_catalog_last: () => cache.catalog,
  // cached catalog entry by kind id, null when nothing cached or no match
  providers_catalog_last_by: (kind) =>
    (cache.catalog ?? []).find((info) => info.provider === kind) ?? null,
  // catalog: supported provider types for the add form
  providers_catalog: async function () {
    cache.catalog = await invoke("providers_catalog", {});
    return cache.catalog;
  },
  providers_get: async function () {
    cache.providers = await invoke("providers_get", {});
    return cache.providers;
  },
  // insert on id = 0, update otherwise; returns the stored row
  provider_save: async function (provider) {
    return invoke("provider_save", { provider });
  },
  provider_delete: async function (id) {
    return invoke("provider_delete", { id });
  },
};
