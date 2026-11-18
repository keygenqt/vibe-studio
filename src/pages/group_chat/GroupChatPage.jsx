/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['components', 'hooks']
 * INFO: Group add/edit page over the groups chat block.
 */
import { useParams } from 'react-router'
import { useTranslation } from 'react-i18next'
import { Stack } from '@mui/material'

import { GroupChatForm } from './elements/GroupChatForm'
import { PageHeader } from '../../components/views'
import { ErrorState, WaitState } from '../../components/states'
import { useGroupChat, useModels, useProviders } from '../../core'

export function GroupChatPage() {
  const { groupChatId } = useParams()
  const { t } = useTranslation()
  const isEdit = Boolean(groupChatId)
  const gid = Number(groupChatId)
  const { groupChat, ready: rowReady, error: rowError } = useGroupChat(isEdit ? gid : undefined)
  const { providers, ready: providersReady, error: providersError } = useProviders()
  const { models, ready: modelsReady, error: modelsError } = useModels()

  // any resource failed: the error paints over the loader
  const failure = rowError ?? providersError ?? modelsError
  if (failure) return <ErrorState text={failure} />

  const ready = rowReady && providersReady && modelsReady

  return (
    <WaitState ready={ready}>
      <Stack spacing={2}>
        <PageHeader
          title={isEdit ? (groupChat?.name ?? t('group_chat.t_title')) : t('groups_chat.t_add')}
          subtitle={t('group_chat.t_subtitle')}
        />

        {!isEdit || groupChat ? (
          <GroupChatForm
            isEdit={isEdit}
            id={isEdit ? groupChat.id : 0}
            name={groupChat?.name}
            systemPrompt={groupChat?.systemPrompt}
            modelId={groupChat?.modelId}
            providers={providers ?? []}
            models={models ?? []}
          />
        ) : null}
      </Stack>
    </WaitState>
  )
}
