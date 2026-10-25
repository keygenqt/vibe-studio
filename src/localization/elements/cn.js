/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['i18n']
 */
export const cnLocalization = {
  translation: {
    common: {
      t_loading: '加载中...',
      t_error_data: '获取数据失败！',
      t_not_found: '未找到任何内容。',
      t_save: '保存',
    },
    main: {
      t_theme: '切换主题',
      t_new_chat: '新建聊天',
      t_sidebar: '切换侧边栏',
      t_settings: '设置',
      t_placeholder: '输入消息...',
      t_assistants: '助手',
      t_add_assistant: '添加助手',
    },
    settings: {
      t_providers: '提供商',
      t_providers_description: 'API 提供商与模型',
      t_general: '通用',
      t_general_description: '应用核心行为',
      t_appearance: '外观',
      t_about: '关于与反馈',
    },
    providers: {
      t_add: '添加提供商',
      t_subtitle: '连接云端 API 或本地运行环境以使用其模型。',
    },
    provider: {
      t_title: '提供商',
      t_subtitle: '管理连接与可用模型。',
      t_saved: '提供商已保存。',
      t_delete_title: '删除提供商？',
      t_delete_text: '提供商及其模型将被删除。此操作无法撤销。',
      t_name: '名称',
      t_host: '主机',
      t_api_key: 'API 密钥',
      t_api_key_hint: '如非必需请留空',
      t_sync_models: '同步模型',
      t_models: '模型',
      t_cancel: '取消',
      t_delete: '删除',
      t_validation_required: '不能为空。',
      t_validation_url: '必须是有效的 URL。',
    },
    models: {
      t_saved: '模型已保存。',
      t_subtitle: '选择此提供商可用的模型。',
      t_badge_vision: '理解图像',
      t_badge_thinking: '推理（thinking）',
      t_badge_tools: '工具调用',
      t_search: '搜索模型...',
      t_select_all: '全选',
      t_deselect_all: '取消全选',
      t_group_search: '搜索',
      t_group_selected: '已选择',
    },
    model: {
      t_saved: '模型已保存。',
      t_name: '名称',
      t_system_prompt: '系统提示词',
      t_parameters: '参数',
      t_temperature: '温度',
      t_seed: '随机种子',
      t_num_ctx: '上下文长度',
      t_num_predict: '最大生成数',
    },
    error: {
      t_text: '嗯，此页面不存在。',
    },
    backend: {
      'Name must not be blank': '名称不能为空。',
      'Display name must not be blank': '名称不能为空。',
      'System prompt must not be blank': '系统提示词不能为空。',
    },
  },
}
