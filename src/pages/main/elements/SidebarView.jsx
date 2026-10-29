/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['components', 'hooks']
 */
import * as React from 'react'
import PropTypes from 'prop-types'
import { useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import { Box, Button, List, ListItemButton, Stack, Typography } from '@mui/material'
import ExpandLess from '@mui/icons-material/ExpandLess'
import ExpandMore from '@mui/icons-material/ExpandMore'

import { DeleteDialog } from '../../../components/views'
import { WaitState } from '../../../components/states'
import { AppRoutes } from '../../../constants'
import { AppNav } from '../../../utils'
import { Methods } from '../../../modules'

import { ChatItem } from './ChatItem'
import { GroupItem } from './GroupItem'

// chats shown before the "more" expander opens the rest
const CHATS_PREVIEW_COUNT = 3

export function SidebarView(props) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [chatToDelete, setChatToDelete] = React.useState(null)
  // local UI state: per-group collapse and the "more" expander,
  // both die with the session
  const [collapsed, setCollapsed] = React.useState({})
  const [expanded, setExpanded] = React.useState({})
  // chat names are dynamic keys: resolve against the backend object
  // directly — dots in the names break the nested key path
  const backend = t('backend', { returnObjects: true })

  const chatTitle = chat =>
    chat.name ? (backend?.[chat.name] ?? chat.name) : t('main.t_chat_untitled')

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
        {props.groupsChat.map(group => {
          const chats = (props.chats ?? []).filter(chat => chat.group_chat_id === group.id)
          const isCollapsed = Boolean(collapsed[group.id])
          const visible = Boolean(expanded[group.id]) ? chats : chats.slice(0, CHATS_PREVIEW_COUNT)
          return (
            <React.Fragment key={`group-${group.id}`}>
              <GroupItem
                name={group.name}
                model={props.models?.find(model => model.id === group.model_id)?.name ?? null}
                active={props.activeId === group.id}
                collapsed={isCollapsed}
                onActivate={() => props.onActivate(group.id)}
                onToggle={() => setCollapsed(prev => ({ ...prev, [group.id]: !isCollapsed }))}
              />
              {!isCollapsed && chats.length > 0 && (
                // the connector line ties the chats to their group header
                <Box
                  sx={{
                    ml: '29px',
                    pl: 1,
                    borderLeft: 2,
                    borderColor: 'divider',
                    py: 0.5,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1,
                  }}
                >
                  {visible.map(chat => (
                    <ChatItem
                      key={`chat-${chat.id}`}
                      title={chatTitle(chat)}
                      active={props.activeChatId === chat.id}
                      onClick={() => props.onActivateChat(chat.id)}
                      onDelete={() => setChatToDelete(chat)}
                    />
                  ))}
                  {chats.length > CHATS_PREVIEW_COUNT && (
                    <ListItemButton
                      sx={{ borderRadius: 2, px: '8px', py: '4px', minHeight: 40 }}
                      onClick={() =>
                        setExpanded(prev => ({ ...prev, [group.id]: !prev[group.id] }))
                      }
                    >
                      <Stack direction={'row'} spacing={1} alignItems={'center'}>
                        {expanded[group.id] ? (
                          <ExpandLess sx={{ fontSize: 18 }} />
                        ) : (
                          <ExpandMore sx={{ fontSize: 18 }} />
                        )}
                        <Typography variant={'body2'} color={'text.secondary'}>
                          {expanded[group.id]
                            ? t('main.t_chat_less')
                            : t('main.t_chat_more', {
                                n: chats.length - CHATS_PREVIEW_COUNT,
                              })}
                        </Typography>
                      </Stack>
                    </ListItemButton>
                  )}
                </Box>
              )}
            </React.Fragment>
          )
        })}
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
  models: PropTypes.array,
  activeId: PropTypes.number,
  onActivate: PropTypes.func.isRequired,
  activeChatId: PropTypes.number,
  onActivateChat: PropTypes.func.isRequired,
}
