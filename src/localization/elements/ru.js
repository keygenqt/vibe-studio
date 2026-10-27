/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['i18n']
 */
export const ruLocalization = {
  translation: {
    common: {
      t_loading: 'Загрузка...',
      t_error_data: 'Ошибка получения данных!',
      t_not_found: 'Ничего не найдено.',
      t_save: 'Сохранить',
      t_cancel: 'Отмена',
      t_delete: 'Удалить',
    },
    main: {
      t_theme: 'Тема',
      t_sidebar: 'Свернуть панель',
      t_settings: 'Настройки',
      t_placeholder: 'Введите сообщение...',
      t_assistants: 'Ассистенты',
      t_add_assistant: 'Добавить ассистента',
    },
    settings: {
      t_providers: 'Провайдеры',
      t_providers_description: 'API-провайдеры и модели',
      t_groups_chat: 'Группы чатов',
      t_groups_chat_description: 'Настройка групп чатов',
      t_general: 'Общие',
      t_general_description: 'Основное поведение приложения',
    },
    general: {
      t_general: 'Общие',
      t_general_description: 'Основное поведение приложения',
    },
    providers: {
      t_add: 'Добавить провайдера',
      t_subtitle: 'Подключите облачные API или локальные среды выполнения для их моделей.',
    },
    provider: {
      t_title: 'Провайдер',
      t_subtitle: 'Управление подключением и доступными моделями.',
      t_saved: 'Провайдер сохранён.',
      t_delete_title: 'Удалить провайдера?',
      t_delete_text: 'Провайдер и его модели будут удалены. Действие необратимо.',
      t_name: 'Название',
      t_host: 'Хост',
      t_api_key: 'API-ключ',
      t_api_key_hint: 'Оставьте пустым, если ключ не обязателен',
      t_sync_models: 'Синхронизировать модели',
      t_models: 'Модели',
      t_delete: 'Удалить',
      t_validation_required: 'Не должно быть пустым.',
      t_validation_url: 'Должен быть корректным URL.',
    },
    groups_chat: {
      t_add: 'Добавить группу',
      t_subtitle: 'Группы чатов с настройкой модели и системного промпта.',
    },
    group_chat: {
      t_title: 'Группа',
      t_subtitle: 'Модель и системный промпт группы.',
      t_saved: 'Группа сохранена.',
      t_delete_title: 'Удалить группу?',
      t_delete_text: 'Группа будет удалена. Действие необратимо.',
      t_name: 'Название',
      t_model: 'Модель',
      t_system_prompt: 'Системный промпт',
      t_delete: 'Удалить',
      t_validation_required: 'Не должно быть пустым.',
    },
    models: {
      t_saved: 'Модели сохранены.',
      t_subtitle: 'Выберите модели, доступные для этого провайдера.',
      t_badge_vision: 'Понимает изображения',
      t_badge_thinking: 'Рассуждения (thinking)',
      t_badge_tools: 'Вызов инструментов',
      t_search: 'Поиск моделей...',
      t_select_all: 'Выбрать все',
      t_deselect_all: 'Снять все',
      t_group_search: 'Поиск',
      t_group_selected: 'Выбранные',
    },
    model: {
      t_saved: 'Модель сохранена.',
      t_name: 'Название',
      t_system_prompt: 'Системный промпт',
      t_parameters: 'Параметры',
      t_temperature: 'Температура',
      t_seed: 'Seed',
      t_num_ctx: 'Размер контекста',
      t_num_predict: 'Максимум токенов',
    },
    error: {
      t_text: 'Хм, такой страницы не существует.',
    },
    backend: {
      'Name must not be blank': 'Название не должно быть пустым.',
      'Display name must not be blank': 'Название не должно быть пустым.',
      'System prompt must not be blank': 'Системный промпт не должен быть пустым.',
      'Unknown model': 'Неизвестная модель.',
    },
  },
}
