/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['i18n']
 */
export const enLocalization = {
  translation: {
    common: {
      t_loading: 'Loading...',
      t_error_data: 'Failed to load data!',
      t_not_found: 'Nothing found.',
      t_save: 'Save',
    },
    main: {
      t_theme: 'Theme',
      t_new_chat: 'New chat',
      t_sidebar: 'Toggle sidebar',
      t_settings: 'Settings',
      t_placeholder: 'Type a message...',
      t_assistants: 'Assistants',
      t_add_assistant: 'Add assistant',
    },
    settings: {
      t_providers: 'Providers',
      t_providers_description: 'API providers and models',
      t_general: 'General',
      t_general_description: 'Base app behavior',
      t_appearance: 'Appearance',
      t_about: 'About & feedback',
    },
    providers: {
      t_add: 'Connect another provider',
      t_subtitle: 'Connect cloud APIs or local runtimes to use their models.',
    },
    provider: {
      t_title: 'Provider',
      t_subtitle: 'Manage the connection and available models.',
      t_saved: 'Provider saved.',
      t_delete_title: 'Delete provider?',
      t_delete_text: 'The provider and its models will be removed. This action cannot be undone.',
      t_name: 'Name',
      t_host: 'Host',
      t_api_key: 'API key',
      t_api_key_hint: 'Leave empty if not required',
      t_sync_models: 'Sync models',
      t_models: 'Models',
      t_cancel: 'Cancel',
      t_delete: 'Delete',
      t_validation_required: 'Must not be empty.',
      t_validation_url: 'Must be a valid URL.',
    },
    models: {
      t_saved: 'Models saved.',
      t_subtitle: 'Select the models available for this provider.',
      t_badge_vision: 'Understands images',
      t_badge_thinking: 'Reasoning (thinking)',
      t_badge_tools: 'Tool calling',
      t_search: 'Search models...',
      t_select_all: 'Select all',
      t_deselect_all: 'Deselect all',
      t_group_search: 'Search',
      t_group_selected: 'Selected',
    },
    model: {
      t_saved: 'Model saved.',
      t_name: 'Name',
      t_system_prompt: 'System prompt',
      t_parameters: 'Parameters',
      t_temperature: 'Temperature',
      t_seed: 'Seed',
      t_num_ctx: 'Num ctx',
      t_num_predict: 'Num predict',
    },
    error: {
      t_text: 'Hmm, this page does not exist.',
    },
    backend: {
      'Name must not be blank': 'Name must not be blank.',
      'Display name must not be blank': 'Display name must not be blank.',
      'System prompt must not be blank': 'System prompt must not be blank.',
    },
  },
}
