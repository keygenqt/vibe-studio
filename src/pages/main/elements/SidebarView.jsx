/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['components', 'hooks']
 */
import * as React from 'react'
import PropTypes from 'prop-types'
import { useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import { Button, List, Stack, Typography } from '@mui/material'

import { DeleteDialog, SidebarItem } from '../../../components/views'
import { WaitState } from '../../../components/states'
import { AppRoutes } from '../../../constants'
import { AppNav } from '../../../utils'
import { Methods } from '../../../modules'

import { ChatItem } from './ChatItem'

export function SidebarView(props) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [chatToDelete, setChatToDelete] = React.useState(null)
  // chat names are dynamic keys: resolve against the backend object
  // directly — dots in the names break the nested key path
  const backend = t('backend', { returnObjects: true })

  if (props.groupsChat === null) {
    return <WaitState ready={false} />
  }

  if (props.groupsChat.length === 0) {
    return (
      <Stack height={1} spacing={2} sx={{ justifyContent: 'center', alignItems: 'center' }}>
        <Typography variant={'body2'} color={'text.secondary'} textAlign={'center'}>
          {t('main.t_no_groups')}
        </Typography>
        <Button
          variant={'outlined'}
          onClick={() => AppNav.open(navigate, AppRoutes.settingsGroupsChat())}
        >
          {t('main.t_add_group')}
        </Button>
      </Stack>
    )
  }

  return (
    <>
      <List dense disablePadding sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {props.groupsChat.map(group => (
          <React.Fragment key={`group-${group.id}`}>
            <SidebarItem
              title={group.name}
              active={props.activeId === group.id}
              onClick={() => props.onActivate(group.id)}
            />
            {(props.chats ?? [])
              .filter(chat => chat.group_chat_id === group.id)
              .map(chat => (
                <ChatItem
                  key={`chat-${chat.id}`}
                  title={backend?.[chat.name] ?? chat.name}
                  onDelete={() => setChatToDelete(chat)}
                />
              ))}
          </React.Fragment>
        ))}
      </List>
      <DeleteDialog
        open={chatToDelete !== null}
        title={t('main.t_chat_delete_title')}
        text={t('main.t_chat_delete_text')}
        onCancel={() => setChatToDelete(null)}
        onConfirm={() => {
          Methods.delete_chat(chatToDelete.id)
            .then(() => setChatToDelete(null))
            .catch(() => setChatToDelete(null))
        }}
      />
    </>
  )
}

SidebarView.propTypes = {
  groupsChat: PropTypes.array,
  chats: PropTypes.array,
  activeId: PropTypes.number,
  onActivate: PropTypes.func.isRequired,
}
