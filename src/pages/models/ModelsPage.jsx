/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['components']
 */
import * as React from 'react'
import { useParams } from 'react-router'
import { useTranslation } from 'react-i18next'
import SearchIcon from '@mui/icons-material/Search'
import DoneOutlined from '@mui/icons-material/DoneOutlined'
import {
  Box,
  Button,
  CircularProgress,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from '@mui/material'

import { ModelCard } from './elements/ModelCard'
import { PageHeader } from '../../components/views'
import { WaitState } from '../../components/states'
import { Methods } from '../../modules'

// draft: hardcoded until the model state lands in Rust
const available = [
  {
    id: 1,
    name: 'gpt-4o',
    avatar: '4o',
    description: 'Universal · text and images',
    checked: true,
  },
  {
    id: 2,
    name: 'gpt-4o-mini',
    avatar: '4o',
    description: 'Fast and cheap · for simple tasks',
    checked: true,
  },
  {
    id: 3,
    name: 'qwen2.5-coder:7b-instruct',
    avatar: 'Qw',
    description: 'Code · 7B parameters',
    checked: false,
  },
  {
    id: 4,
    name: 'qwen2.5vl:7b',
    avatar: 'Qw',
    description: 'Vision · 7B parameters',
    checked: false,
  },
]

export function ModelsPage() {
  const { t } = useTranslation()
  const { providerId } = useParams()
  const [provider, setProvider] = React.useState(Methods.providers_last_by_id(Number(providerId)))
  const [catalog, setCatalog] = React.useState(Methods.providers_catalog_last())
  const [query, setQuery] = React.useState('')
  const [selected, setSelected] = React.useState(available.filter(m => m.checked).map(m => m.id))
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  React.useEffect(() => {
    Methods.providers_get().then(list => {
      setProvider(list.find(item => item.id === Number(providerId)) ?? null)
    })
    Methods.providers_catalog().then(setCatalog)
  }, [providerId])

  // the search filter is active on a non-empty query
  const isFilter = query.length > 0

  // matches of the filter, whatever the selection state
  const matched = isFilter ? available.filter(m => m.name.toLowerCase().includes(query)) : []

  // selected models hidden by the filter
  const pinned = isFilter
    ? available.filter(m => selected.includes(m.id) && !m.name.toLowerCase().includes(query))
    : []

  // everything the page shows: filter matches plus the selected ones it hides
  const visible = isFilter ? [...matched, ...pinned] : available

  // toggle: select all visible models, or clear them when everything is selected
  const allVisibleSelected = visible.length > 0 && visible.every(m => selected.includes(m.id))

  // page sections: a flat list, or Search + Selected groups under the filter
  const sections = [
    isFilter && { title: t('models.t_group_search'), models: matched },
    isFilter && pinned.length > 0 && { title: t('models.t_group_selected'), models: pinned },
    !isFilter && { models: available },
  ].filter(Boolean)

  return (
    <WaitState ready={Boolean(provider)}>
      <Stack spacing={2}>
        <PageHeader title={provider?.name ?? ''} subtitle={t('models.t_subtitle')} />
        <TextField
          hiddenLabel
          variant={'filled'}
          disabled={Boolean(isSubmitting)}
          placeholder={t('models.t_search')}
          value={query}
          onChange={event => {
            setQuery(event.target.value.trim().toLowerCase())
          }}
          sx={{ flexGrow: 1 }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position={'start'}>
                  <SearchIcon fontSize={'small'} />
                </InputAdornment>
              ),
            },
          }}
        />
        {sections.map(section => (
          <React.Fragment key={section.title ?? 'models'}>
            {section.title && (
              <Typography
                variant={'body2'}
                color={'text.secondary'}
                sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}
              >
                {section.title}
              </Typography>
            )}
            {section.models.map(model => (
              <ModelCard
                key={`model-${model.id}`}
                avatar={model.avatar}
                name={model.name}
                description={model.description}
                color={catalog?.find(info => info.provider === provider?.provider)?.color}
                checked={selected.includes(model.id)}
                disabled={Boolean(isSubmitting)}
                onToggle={() =>
                  setSelected(current =>
                    current.includes(model.id)
                      ? current.filter(item => item !== model.id)
                      : [...current, model.id]
                  )
                }
              />
            ))}
            {section.title && section.models.length === 0 && (
              <Typography variant={'body2'} color={'text.secondary'}>
                {t('common.t_not_found')}
              </Typography>
            )}
          </React.Fragment>
        ))}
        <Stack direction={'row'} spacing={2} alignItems={'center'}>
          {visible.length > 0 && (
            <Button
              variant={'outlined'}
              size={'large'}
              disabled={Boolean(isSubmitting)}
              sx={{ flexShrink: 0, whiteSpace: 'nowrap' }}
              onClick={() =>
                setSelected(current =>
                  allVisibleSelected
                    ? current.filter(id => !visible.some(model => model.id === id))
                    : [...new Set([...current, ...visible.map(model => model.id)])]
                )
              }
            >
              {t(allVisibleSelected ? 'models.t_deselect_all' : 'models.t_select_all')}
            </Button>
          )}
          <Box sx={{ flexGrow: 1 }} />
          <Button
            variant={'contained'}
            color={'success'}
            size={'large'}
            disabled={available.length === 0 || Boolean(isSubmitting)}
            startIcon={
              isSubmitting ? (
                <CircularProgress
                  sx={{ mr: 0.5, height: '18px !important', width: '18px !important' }}
                />
              ) : (
                <DoneOutlined color={'text.primary'} sx={{ height: 18 }} />
              )
            }
            onClick={() => {
              setIsSubmitting(true)
              console.log('sync models', selected)
              setTimeout(() => setIsSubmitting(false), 1000)
            }}
          >
            {t('common.t_save')}
          </Button>
        </Stack>
      </Stack>
    </WaitState>
  )
}
