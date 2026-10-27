/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['components', 'hooks']
 */
import { useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import { Stack } from '@mui/material'

import { GroupChatCard } from './elements/GroupChatCard'
import { DashedButton } from '../../components/buttons'
import { PageHeader } from '../../components/views'
import { WaitState } from '../../components/states'
import { AppRoutes } from '../../constants'
import { AppNav } from '../../utils'
import { useCoreGroupsChat } from '../../hooks'

export function GroupsChatPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { groupsChat, models, ready } = useCoreGroupsChat()

  return (
    <WaitState ready={ready}>
      <Stack spacing={2}>
        <PageHeader title={t('settings.t_groups_chat')} subtitle={t('groups_chat.t_subtitle')} />
        <DashedButton onClick={() => AppNav.open(navigate, AppRoutes.groupChatAdd())}>
          {t('groups_chat.t_add')}
        </DashedButton>
        {(groupsChat ?? []).map(group => (
          <GroupChatCard
            key={`group-chat-${group.id}`}
            groupChat={group}
            model={models?.find(model => model.id === group.model_id)}
            onConfigure={() => AppNav.open(navigate, AppRoutes.groupChat(group.id))}
          />
        ))}
      </Stack>
    </WaitState>
  )
}
