/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['components', 'hooks']
 * INFO: Groups chat settings section: the group list.
 */
import { useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import { Stack } from '@mui/material'

import { GroupChatCard } from './elements/GroupChatCard'
import { DashedButton } from '../../components/buttons'
import { PageHeader } from '../../components/views'
import { ErrorState, WaitState } from '../../components/states'
import { AppRoutes } from '../../constants'
import { AppNav } from '../../utils'
import { useGroupsChat, useModels } from '../../core'

export function GroupsChatPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { groupsChat, ready, error } = useGroupsChat()
  const { models } = useModels()

  // the models failed: the cards would paint without their model line
  const failure = error ?? models.error
  if (failure) return <ErrorState text={failure} />

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
            model={models?.find(model => model.id === group.modelId)}
            onConfigure={() => AppNav.open(navigate, AppRoutes.groupChat(group.id))}
          />
        ))}
      </Stack>
    </WaitState>
  )
}
